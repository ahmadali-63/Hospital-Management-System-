import DashboardSection from '@/components/DashboardSection';

export default function AppointmentsPage() {
  return <DashboardSection title="Appointments" description="Keep the day moving with a clear appointment schedule." items={["Today's schedule", "Upcoming visits", "Booking requests"]} />;
}
