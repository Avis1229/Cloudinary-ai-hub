import { Metadata } from 'next';

import AdminCoupons from './AdminCoupons';

export const metadata: Metadata = {
  title: 'Coupon Management - Admin | BeautyP',
  description: 'Manage discount coupons and promotional codes',
};

export default function CouponsPage() {
  return (
    <AdminCoupons />
  );
}
