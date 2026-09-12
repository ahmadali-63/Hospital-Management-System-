'use client';

import { Users, UserPlus, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Mon', appointments: 40 },
  { name: 'Tue', appointments: 30 },
  { name: 'Wed', appointments: 45 },
  { name: 'Thu', appointments: 50 },
  { name: 'Fri', appointments: 35 },
  { name: 'Sat', appointments: 20 },
  { name: 'Sun', appointments: 10 },
];

export default function DashboardOverview() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Hospital Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900">1,248</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Available Doctors</p>
            <p className="text-2xl font-bold text-gray-900">42</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Today&apos;s Appointments</p>
            <p className="text-2xl font-bold text-gray-900">156</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-orange-50 text-orange-600 mr-4">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Available Beds</p>
            <p className="text-2xl font-bold text-gray-900">18 / 150</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Appointments Overview</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="appointments" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Admissions</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium mr-3">
                  P{i}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Patient #{1000 + i}</p>
                  <p className="text-xs text-gray-500">Admitted to General Ward</p>
                </div>
                <div className="ml-auto text-xs text-gray-400">
                  {i}h ago
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
