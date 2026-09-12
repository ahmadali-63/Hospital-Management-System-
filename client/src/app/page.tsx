import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20 lg:px-12">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Hospital Management System</p>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl">Care coordination, without the clutter.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Manage patients, appointments, clinical records, beds, emergencies, and billing from one focused workspace.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/auth/login" className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">Sign in</Link>
          <Link href="/auth/register" className="rounded-lg border border-slate-600 px-5 py-3 font-semibold hover:border-cyan-300 hover:text-cyan-200">Register as patient</Link>
        </div>
      </main>
    </div>
  );
}
