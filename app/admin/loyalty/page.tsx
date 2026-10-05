'use client';

import dynamic from 'next/dynamic';

const LoyaltyAdminTable = dynamic(() => import('@/components/admin/LoyaltyAdminTable'), { ssr: false });

export default function AdminLoyaltyPage() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Loyalty Program Management</h1>
        <p className="text-sm text-gray-500">Manage user loyalty points, ranks, birthday bonuses, and program settings.</p>
      </div>
      <LoyaltyAdminTable />
    </div>
  );
}
