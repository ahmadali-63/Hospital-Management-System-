import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="neon-page relative flex h-screen overflow-hidden text-slate-100 selection:bg-cyan-400 selection:text-slate-950 bg-transparent">
      {/* Frosted Glass Sidebar */}
      <Sidebar />

      {/* Main Glass Content Viewport */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden relative z-10">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none scrollbar-thin scrollbar-thumb-white/10">
          <div className="py-6 px-6 sm:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
