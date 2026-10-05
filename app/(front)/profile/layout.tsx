import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile - Aethravia',
  description: 'Manage your Aethravia account profile, orders, and preferences',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
