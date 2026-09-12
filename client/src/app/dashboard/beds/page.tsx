import DashboardSection from '@/components/DashboardSection';

export default function BedsPage() {
  return <DashboardSection title="Bed management" description="See capacity and manage admissions by ward." items={["Available beds", "Occupied beds", "Ward capacity"]} />;
}
