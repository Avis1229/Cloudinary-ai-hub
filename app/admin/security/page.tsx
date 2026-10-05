import { Metadata } from 'next';
import AdminSecurity from './AdminSecurity';

export const metadata: Metadata = {
  title: 'Security Hub - Admin | Aethravia',
  description: 'Manage application security settings and view threats',
};

export default function SecurityPage() {
  return <AdminSecurity />;
}
