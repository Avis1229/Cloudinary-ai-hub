import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile - BeautyP',
  description: 'Manage your BeautyP account profile, orders, and preferences',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
