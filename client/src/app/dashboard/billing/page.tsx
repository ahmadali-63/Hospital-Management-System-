import DashboardSection from '@/components/DashboardSection';

export default function BillingPage() {
  return <DashboardSection title="Billing" description="Track charges, payments, and outstanding balances." items={["Open invoices", "Recent payments", "Billing reports"]} />;
}
