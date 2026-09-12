import Link from 'next/link';
import { Users, Activity, Calendar, FileText, LogOut, Bed } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="flex flex-col w-64 h-screen bg-gray-900 text-gray-100">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider text-white flex items-center gap-2">
          <Activity className="h-6 w-6 text-indigo-400" />
          HMS Admin
        </h1>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-800 hover:text-white group">
            <Activity className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-400" />
            Dashboard
          </Link>
          <Link href="/dashboard/patients" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-800 hover:text-white group">
            <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-400" />
            Patients
          </Link>
          <Link href="/dashboard/doctors" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-800 hover:text-white group">
            <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-400" />
            Doctors
          </Link>
          <Link href="/dashboard/appointments" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-800 hover:text-white group">
            <Calendar className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-400" />
            Appointments
          </Link>
          <Link href="/dashboard/beds" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-800 hover:text-white group">
            <Bed className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-400" />
            Bed Management
          </Link>
          <Link href="/dashboard/billing" className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-800 hover:text-white group">
            <FileText className="mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-400" />
            Billing
          </Link>
        </nav>
      </div>
      <div className="flex-shrink-0 p-4 border-t border-gray-800">
        <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-400 rounded-md hover:bg-gray-800 hover:text-white group">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
