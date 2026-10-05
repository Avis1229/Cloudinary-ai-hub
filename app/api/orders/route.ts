import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import CouponModel from "@/lib/models/CouponModel";
import OrderModel, { OrderItem } from "@/lib/models/OrderModel";
import ProductModel from "@/lib/models/ProductModel";
import UserModel from "@/lib/models/UserModel";
import ReferralSettingsModel from "@/lib/models/ReferralSettingsModel";
import SiteSettingsModel from "@/lib/models/SiteSettingsModel";
import { emitAdminEvent } from "@/lib/eventBus";
import {
  sanitizeRequestBody,
  validateRequiredFields,
  validateNumeric,
} from "@/lib/security";
import { round2 } from "@/lib/utils";

// Utility: calculate prices using admin-configurable pricing
const calcPrices = (
  orderItems: OrderItem[],
  pricing: { shippingPrice: number; freeShippingThreshold: number; taxRate: number }
) => {
  const itemsPrice = round2(
    orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  // Shipping: free above threshold, else configured flat rate
  const shippingPrice = round2(
    pricing.freeShippingThreshold > 0 && itemsPrice > pricing.freeShippingThreshold
      ? 0
      : pricing.shippingPrice
  );
  // Tax: admin-configured percentage
  const taxRate = pricing.taxRate / 100;
  const taxPrice = round2(Number(taxRate * itemsPrice));
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

export const POST = auth(async (req: any) => {
  if (!req.auth) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const user = req.auth.user;
  const safeUserId = user?._id || user?.id;

  // ✅ Ensure DB is connected before session
  await dbConnect();
  
  // Use session for transactions, but fall back to non-transactional if sessions aren't supported
  let session: mongoose.ClientSession | null = null;
  try {
    session = await mongoose.startSession();
  } catch (error) {
    console.warn("MongoDB sessions not supported, falling back to non-transactional flow");
    session = null;
  }

  // ✅ Read body once outside any potential retry loops
  const rawPayload = await req.json();
  const payload = sanitizeRequestBody(rawPayload);

  let createdOrder: any = null;
  
  // Helper to perform the actual order creation logic
  const performOrderCreation = async (currentSession: mongoose.ClientSession | null) => {
    
    // Validate required fields
    const requiredFieldsCheck = validateRequiredFields(payload, [
      "items",
      "shippingAddress",
      "paymentMethod",
    ]);
    
    if (!requiredFieldsCheck.isValid) {
      throw new Error(`Missing required fields: ${requiredFieldsCheck.missingFields.join(", ")}`);
    }
    
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error("Your cart is empty. Please add items before placing an order.");
    }

    // Secondary validation for items
    for (const item of payload.items) {
      if (!item.slug || typeof item.slug !== "string") {
        throw new Error("Invalid item data: missing or invalid product slug");
      }
    }

    const slugs: string[] = payload.items.map((x: any) => x.slug);
    const dbProducts = await ProductModel.find(
      { slug: { $in: slugs } },
      "slug price countInStock name"
    ).session(currentSession);
    
    const productBySlug = new Map(dbProducts.map((p) => [p.slug, p]));
    const dbOrderItems: any[] = [];
    const stockUpdates: any[] = [];

    for (const x of payload.items as any[]) {
      const p = productBySlug.get(x.slug);
      if (!p) {
        throw new Error(`Product not found: ${x.slug}`);
      }
      
      const qty = Number(x.qty);
      if (qty <= 0) throw new Error(`Invalid quantity for ${p.name}`);

      if (typeof p.countInStock === "number" && qty > p.countInStock) {
        throw new Error(
          `Insufficient stock for ${p.name}. Only ${p.countInStock} remaining.`
        );
      }

      // Prepare order item with all metadata from client + verified price from DB
      dbOrderItems.push({
        name: x.name || p.name,
        slug: x.slug,
        qty: qty,
        image: x.image,
        price: p.price, // Trust DB price
        color: x.color || 'Standard',
        size: x.size || 'Regular',
        product: p._id,
      });

      // Atomic stock update: only decrement if enough stock exists
      stockUpdates.push({
        updateOne: {
          filter: { _id: p._id, countInStock: { $gte: qty } },
          update: { $inc: { countInStock: -qty } },
        },
      });
    }

    // Fetch admin-configured pricing
    let siteSettings = await SiteSettingsModel.findOne({}).lean() as any;
    const pricing = {
      shippingPrice: siteSettings?.shippingPrice ?? 200,
      freeShippingThreshold: siteSettings?.freeShippingThreshold ?? 2000,
      taxRate: siteSettings?.taxRate ?? 18,
    };

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(dbOrderItems, pricing);
    
    // ----------------------------------------------------
    // Loyalty Tier Discounts
    // ----------------------------------------------------
    const dbUser = await mongoose.models.User.findById(safeUserId).select('loyaltyTier').session(currentSession);
    const loyaltyTier = dbUser?.loyaltyTier || 'Novice';
    
    let tierDiscountRatio = 0;
    if (loyaltyTier === 'Seeker') tierDiscountRatio = 0.05;
    if (loyaltyTier === 'Keeper') tierDiscountRatio = 0.10;
    if (loyaltyTier === 'Sage') tierDiscountRatio = 0.15;
    
    const tierDiscountAmount = round2(itemsPrice * tierDiscountRatio);
    let effectiveItemsPrice = itemsPrice - tierDiscountAmount;
    
    let effectiveShippingPrice = shippingPrice;
    if (loyaltyTier === 'Keeper' || loyaltyTier === 'Sage') {
      effectiveShippingPrice = 0;
    }
    
    let effectiveTaxPrice = round2(Number((pricing.taxRate / 100) * effectiveItemsPrice));
    let finalTotalPrice = round2(effectiveItemsPrice + effectiveShippingPrice + effectiveTaxPrice);
    
    let couponInfo = null;

    // Handle Coupons
    if (payload.coupon?.code) {
      const coupon = await CouponModel.findOne({ code: payload.coupon.code }).session(currentSession);
      if (coupon && coupon.isActive) {
        const userOrders = await OrderModel.find({
          user: safeUserId,
          isPaid: true,
        }).session(currentSession);
        
        const validation = coupon.isValidForUser(safeUserId, effectiveItemsPrice, userOrders, dbOrderItems);
        if (validation.valid) {
          const discountAmount = coupon.calculateDiscount(effectiveItemsPrice, effectiveShippingPrice, dbOrderItems);
          finalTotalPrice = Math.max(0, finalTotalPrice - discountAmount);
          
          await coupon.applyCoupon(safeUserId, effectiveItemsPrice, discountAmount);
          await coupon.save({ session: currentSession || undefined });
          
          couponInfo = {
            code: payload.coupon.code,
            name: payload.coupon.name,
            type: payload.coupon.type,
            discountAmount,
            originalOrderValue: effectiveItemsPrice,
          };
        }
      }
    }

    const newOrderData = {
      items: dbOrderItems,
      itemsPrice: effectiveItemsPrice,
      taxPrice: effectiveTaxPrice,
      shippingPrice: effectiveShippingPrice,
      totalPrice: finalTotalPrice,
      coupon: couponInfo,
      shippingAddress: payload.shippingAddress,
      paymentMethod: payload.paymentMethod,
      user: safeUserId,
      status: 'pending',
      isPaid: false,
      isDelivered: false,
    };

    const [order] = await OrderModel.create([newOrderData], { session: currentSession || undefined });
    
    if (stockUpdates.length > 0) {
      const bulkResult = await ProductModel.bulkWrite(stockUpdates, { session: currentSession || undefined });
      if (bulkResult.matchedCount < stockUpdates.length) {
        throw new Error("One or more items in your cart became unavailable. Please review your cart.");
      }
    }
    
    return order;
  };

  try {
    let transactionSuccess = false;
    if (session) {
      // Try with transaction
      try {
        await session.withTransaction(async () => {
          createdOrder = await performOrderCreation(session);
        });
        transactionSuccess = true;
      } catch (txErr: any) {
        if (txErr.message && txErr.message.includes('Transaction numbers are only allowed')) {
          console.warn("MongoDB Standalone detected. Falling back to non-transactional flow.");
          session.endSession();
          session = null;
        } else {
          throw txErr;
        }
      }
    } 
    
    if (!transactionSuccess && !session) {
      // Direct execution if sessions not supported
      createdOrder = await performOrderCreation(null);
    }

    return NextResponse.json(
      { message: "Order has been created", order: createdOrder },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[ORDER_API_ERROR]:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to place order. Please try again." },
      { status: 400 } // Use 400 for validation/business logic errors
    );
  } finally {
    if (session) session.endSession();
    
    if (createdOrder) {
      emitAdminEvent({
        type: 'order.created',
        ts: Date.now(),
        orderId: createdOrder._id?.toString?.(),
        total: createdOrder.totalPrice,
        userId: createdOrder.user?.toString?.(),
      });

      // ---- Referral Reward Crediting ----
      // Credit the referrer when a referred user places their first paid order
      try {
        const orderUser = await UserModel.findById(safeUserId).select(
          'referredBy referralHistory'
        );
        if (orderUser?.referredBy) {
          // Check this is the user's first order (excluding this one)
          const previousOrders = await OrderModel.countDocuments({
            user: safeUserId,
            _id: { $ne: createdOrder._id },
          });
          if (previousOrders === 0) {
            // First order — credit the referrer
            const settings = await ReferralSettingsModel.findOne({});
            if (settings?.enabled) {
              let reward = 0;
              if (settings.rewardType === 'fixed') {
                reward = settings.rewardValue || 0;
              } else if (settings.rewardType === 'percent') {
                reward = Math.round(
                  (createdOrder.totalPrice * (settings.rewardValue || 0)) / 100
                );
                if (settings.maxReward && reward > settings.maxReward) {
                  reward = settings.maxReward;
                }
              }

              if (reward > 0) {
                const referrer = await UserModel.findOne({
                  referralCode: orderUser.referredBy,
                });
                if (referrer) {
                  referrer.referralCredits =
                    (referrer.referralCredits || 0) + reward;
                  referrer.referralHistory = referrer.referralHistory || [];
                  referrer.referralHistory.push({
                    referredUserId: safeUserId,
                    referredUserEmail: user?.email || '',
                    reward,
                    orderId: createdOrder._id?.toString(),
                    date: new Date(),
                  });
                  await referrer.save();
                  emitAdminEvent({
                    type: 'referral.reward',
                    referrerId: referrer._id?.toString(),
                    referredUserId: safeUserId,
                    reward,
                  });
                }
              }
            }
          }
        }
      } catch (refErr) {
        // Non-critical: log but don't fail the order
        console.error('Referral reward crediting error:', refErr);
      }
    }
  }
});
