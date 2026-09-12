type DashboardSectionProps = {
  title: string;
  description: string;
  items: string[];
};

export default function DashboardSection({ title, description, items }: DashboardSectionProps) {
  return (
    <section className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">{description}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-gray-900">{item}</p>
            <p className="mt-2 text-sm text-gray-500">Ready for records and updates.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
