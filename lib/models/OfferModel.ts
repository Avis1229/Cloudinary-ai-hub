import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  description?: string;
  shortDescription?: string;
  type: 'popup' | 'banner' | 'flashSale' | 'productOffer';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  priority: number;

  // Discount fields
  discountType?: 'percentage' | 'flat' | 'combo' | 'bogo' | 'freebie';
  discountValue?: number;
  minimumOrderAmount?: number;
  minimumQuantity?: number;
  maxDiscount?: number;
  comboPrice?: number;

  // Targeting
  applicableProducts?: mongoose.Types.ObjectId[];
  applicableCategories?: string[];
  freeProductId?: mongoose.Types.ObjectId;

  // Coupon integration
  couponCode?: string;
  linkedCouponId?: mongoose.Types.ObjectId;

  // Display
  badge?: string;
  imageUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    description: { type: String },
    shortDescription: { type: String },
    type: {
      type: String,
      enum: ['popup', 'banner', 'flashSale', 'productOffer'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 1, min: 1, max: 10 },

    // Discount
    discountType: {
      type: String,
      enum: ['percentage', 'flat', 'combo', 'bogo', 'freebie'],
    },
    discountValue: { type: Number, min: 0 },
    minimumOrderAmount: { type: Number, default: 0, min: 0 },
    minimumQuantity: { type: Number, default: 1, min: 1 },
    maxDiscount: { type: Number, min: 0 },
    comboPrice: { type: Number, min: 0 },

    // Targeting
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: String }],
    freeProductId: { type: Schema.Types.ObjectId, ref: 'Product' },

    // Coupon integration
    couponCode: { type: String, uppercase: true, trim: true },
    linkedCouponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },

    // Display
    badge: { type: String, trim: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

OfferSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
OfferSchema.index({ couponCode: 1 }, { sparse: true });
OfferSchema.index({ applicableProducts: 1 });

const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
