import DashboardSection from '@/components/DashboardSection';

export default function PatientsPage() {
  return <DashboardSection title="Patients" description="Review patient profiles and care history." items={["Patient directory", "Recent admissions", "Care alerts"]} />;
}
