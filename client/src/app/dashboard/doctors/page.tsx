import DashboardSection from '@/components/DashboardSection';

export default function DoctorsPage() {
  return <DashboardSection title="Doctors" description="Manage clinicians, specialties, and availability." items={["Doctor directory", "Specialties", "Availability"]} />;
}
