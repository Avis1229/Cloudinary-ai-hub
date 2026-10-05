import mongoose from 'mongoose';

export type SiteSettings = {
  _id?: string;
  supportPhone: string;
  whatsappNumber: string;
  supportEmail: string;
  shopAddress: string;
  // Pricing & Logistics
  shippingPrice: number;
  freeShippingThreshold: number;
  taxRate: number;
  birthdayBonusPoints: number;
};

const siteSettingsSchema = new mongoose.Schema(
  {
    supportPhone: { type: String, default: '+91-XXXX-XXXXXX' },
    whatsappNumber: { type: String, default: '' }, // Falls back to supportPhone if empty
    supportEmail: { type: String, default: 'aethravia@gmail.com' },
    shopAddress: {
      type: String,
      default:
        'H.no. 46, Mohalla Mohammad Wasil, Near Hadri Masjid, Pilibhit, Uttar Pradesh, India, 262001',
    },
    // Pricing & Logistics
    shippingPrice: { type: Number, default: 200 }, // Default shipping cost in INR
    freeShippingThreshold: { type: Number, default: 2000 }, // Free shipping above this amount
    taxRate: { type: Number, default: 18 }, // Tax percentage (e.g. 18 = 18%)
    birthdayBonusPoints: { type: Number, default: 100 }, // Points awarded on user's birthday
  },
  { timestamps: true }
);

const SiteSettingsModel =
  mongoose.models.SiteSettings ||
  mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettingsModel;
