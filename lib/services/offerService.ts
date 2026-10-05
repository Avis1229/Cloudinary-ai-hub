import dbConnect from '@/lib/dbConnect';
import Offer from '@/lib/models/OfferModel';

export type CartItem = {
  productId?: string;
  _id?: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  category?: string;
};

export type AppliedOffer = {
  offerId: string;
  title: string;
  discountType: string;
  discountAmount: number;
  couponCode?: string;
  badge?: string;
};

/**
 * Evaluates all active offers against the given cart items and returns
 * the best applicable offer (highest discount wins).
 */
export async function evaluateBestOffer(
  items: CartItem[],
  itemsPrice: number
): Promise<AppliedOffer | null> {
  await dbConnect();

  const now = new Date();

  const offers = await Offer.find({
    isActive: true,
    discountType: { $exists: true, $ne: null },
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .lean()
    .exec();

  if (!offers.length || !items.length) return null;

  let bestOffer: AppliedOffer | null = null;
  let bestDiscount = 0;

  for (const offer of offers) {
    // Check minimum order amount
    if (offer.minimumOrderAmount && itemsPrice < offer.minimumOrderAmount) {
      continue;
    }

    // Check product targeting
    const hasProductRestriction =
      offer.applicableProducts && offer.applicableProducts.length > 0;

    let applicableItems = items;
    if (hasProductRestriction) {
      const productIds = offer.applicableProducts!.map((id: any) =>
        id.toString()
      );
      applicableItems = items.filter(
        (item) =>
          productIds.includes(item.productId?.toString() || '') ||
          productIds.includes(item._id?.toString() || '')
      );
      if (applicableItems.length === 0) continue;
    }

    const applicableValue = applicableItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const totalQty = applicableItems.reduce((sum, item) => sum + item.qty, 0);

    let discount = 0;

    switch (offer.discountType) {
      case 'percentage': {
        discount = (applicableValue * (offer.discountValue || 0)) / 100;
        if (offer.maxDiscount && discount > offer.maxDiscount) {
          discount = offer.maxDiscount;
        }
        break;
      }
      case 'flat': {
        discount = Math.min(offer.discountValue || 0, applicableValue);
        break;
      }
      case 'combo': {
        const minQty = offer.minimumQuantity || 2;
        if (totalQty >= minQty && offer.comboPrice) {
          // Discount = (normal price - combo price)
          const normalPrice = applicableItems
            .slice(0, minQty)
            .reduce((sum, item) => sum + item.price, 0);
          discount = Math.max(0, normalPrice - offer.comboPrice);
        }
        break;
      }
      case 'bogo': {
        if (totalQty >= 2) {
          // Cheapest item is free
          const prices = applicableItems
            .flatMap((item) => Array(item.qty).fill(item.price))
            .sort((a, b) => a - b);
          discount = prices[0] || 0;
        }
        break;
      }
      case 'freebie': {
        // Freebie discount is the value of the free product
        // This is handled at order creation by adding the free product
        discount = offer.discountValue || 0;
        break;
      }
    }

    discount = Math.round(discount * 100) / 100;

    if (discount > bestDiscount) {
      bestDiscount = discount;
      bestOffer = {
        offerId: (offer as any)._id.toString(),
        title: offer.title,
        discountType: offer.discountType!,
        discountAmount: discount,
        couponCode: offer.couponCode,
        badge: offer.badge,
      };
    }
  }

  return bestOffer;
}

/**
 * Validates a specific offer by ID is still active and applicable.
 */
export async function validateOffer(
  offerId: string,
  items: CartItem[],
  itemsPrice: number
): Promise<AppliedOffer | null> {
  await dbConnect();

  const now = new Date();
  const offer = await Offer.findOne({
    _id: offerId,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean();

  if (!offer || !offer.discountType) return null;

  // Re-evaluate using the same logic
  const result = await evaluateBestOffer(items, itemsPrice);
  if (result && result.offerId === offerId) return result;

  return null;
}
