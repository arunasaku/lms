import { PrismaClient } from "@prisma/client";
import { updateSystemSettings } from "./actions";
import { createMember } from "../members/actions";
import { RoleSelector } from "@/components/RoleSelector";

const prisma = new PrismaClient();

export default async function SettingsPage() {
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  const dailyFineRate = config?.dailyFineRate || 5.0;
  const borrowPeriodDays = config?.borrowPeriodDays || 14;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">System Settings</h2>
        <p id="subtitle" className="text-slate-500 mt-1">Manage global system configurations and users.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xl font-semibold text-slate-800">Circulation Settings</h3>
        </div>
        <form action={updateSystemSettings} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="dailyFineRate" className="block text-sm font-medium text-slate-700">Daily Fine Rate (Rs.)</label>
              <input type="number" step="0.5" id="dailyFineRate" name="dailyFineRate" defaultValue={dailyFineRate} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
            <div className="space-y-2">
              <label htmlFor="borrowPeriodDays" className="block text-sm font-medium text-slate-700">Borrow Period (Days)</label>
              <input type="number" id="borrowPeriodDays" name="borrowPeriodDays" defaultValue={borrowPeriodDays} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">Save Settings</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xl font-semibold text-slate-800">Add New User / Member</h3>
        </div>
        <form action={createMember} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="memberId" className="block text-sm font-medium text-slate-700">Member ID *</label>
              <input type="text" id="memberId" name="memberId" required placeholder="e.g. M0015" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name *</label>
              <input type="text" id="name" name="name" required placeholder="Member's full name..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Initial Password *</label>
              <input type="password" id="password" name="password" required placeholder="Enter a secure password..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
            <RoleSelector />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" id="email" name="email" autoComplete="off" placeholder="email@example.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input type="text" id="phone" name="phone" autoComplete="off" placeholder="e.g. 0771234567" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium text-slate-700">Department / Class</label>
              <input type="text" id="department" name="department" autoComplete="off" placeholder="e.g. Grade 10 / IT Dept" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">Home Address</label>
              <input type="text" id="address" name="address" autoComplete="off" placeholder="Full address..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">Register Member</button>
          </div>
        </form>
      </div>
    </div>
  );
}
