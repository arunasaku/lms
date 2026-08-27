import { PrismaClient } from "@prisma/client";
import { updateSystemSettings } from "./actions";
import { createMember } from "../members/actions";
import { RoleSelector } from "@/components/RoleSelector";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function ToolsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role || 'MEMBER';
  const isAdmin = userRole === 'ADMIN';

  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  const dailyFineRate = config?.dailyFineRate || 5.0;
  const borrowPeriodDays = config?.borrowPeriodDays || 14;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div>
        <h2 className="text-3|e font-bold text-slate-800">System Tools</h2>
        <p className="text-slate-500 mt-1">Access day-to-day utilities and manage configurations.</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Tools</h3>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 flex justify-between items-center hover:bg-slate-50 transition">
            <div>
              <h4 className="text-lg font-semibold text-slate-800">Members</h4>
              <p className="text-sm text-slate-500 mt-1">View, search, and register members.</p>
            </div>
            <a href="/members" className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition shadow-sm">
              Open Members &rarr;
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 flex justify-between items-center hover:bg-slate-50 transition">
            <div>
              <h4 className="text-lg font-semibold text-slate-800">Print Labels</h4>
              <p className="text-sm text-slate-500 mt-1">Generate and print barcodes and spine labels for books.</p>
            </div>
            <a href="/catalog/labels" className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition shadow-sm">
              Open Print Labels &rarr;
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 flex justify-between items-center hover:bg-slate-50 transition">
            <div>
              <h4 className="text-lg font-semibold text-slate-800">Reports & Analytics</h4>
              <p className="text-sm text-slate-500 mt-1">View advanced reports like Weeding, Popular Books, and Inactive Members.</p>
            </div>
            <a href="/reports" className="px-5 py-2.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium transition shadow-sm">
              Open Reports &rarr;
            </a>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-6 pt-6">
          <h3 className="text-xl font-semibold text-slate-800 border-b pb-2">Admin Settings</h3>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50">
              <h4 className="text-lg font-semibold text-slate-800">Add Staff / Librarian</h4>
              <p className="text-sm text-slate-500 mt-1">Register new administrative users with elevated privileges.</p>
            </div>
            <form action={createMember as any} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="memberId" className="block text-sm font-medium text-slate-700">User ID *</label>
                  <input type="text" id="memberId" name="memberId" required placeholder="e.g. S0015" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name *</label>
                  <input type="text" id="name" name="name" required placeholder="User's full name..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
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
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">Register User</button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50">
              <h4 className="text-lg font-semibold text-slate-800">System Configuration</h4>
            </div>
            <form action={updateSystemSettings as any} className="p-8 space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="renewalPeriodDays" className="block text-sm font-medium text-slate-700">Renewal Period (Days)</label>
                  <input type="number" id="renewalPeriodDays" name="renewalPeriodDays" defaultValue={config?.renewalPeriodDays || 14} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="reminderDaysBeforeDue" className="block text-sm font-medium text-slate-700">Send Email Reminder (Days Before Due)</label>
                  <input type="number" id="reminderDaysBeforeDue" name="reminderDaysBeforeDue" defaultValue={config?.reminderDaysBeforeDue || 1} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h5 className="text-md font-semibold text-slate-700 mb-4">Email Notifications (Cron)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="smtpEmail" className="block text-sm font-medium text-slate-700">Gmail Address</label>
                    <input type="email" id="smtpEmail" name="smtpEmail" defaultValue={config?.smtpEmail || ""} placeholder="e.g. library@gmail.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="smtpPassword" className="block text-sm font-medium text-slate-700">Gmail App Password</label>
                    <input type="password" id="smtpPassword" name="smtpPassword" defaultValue={config?.smtpPassword || ""} placeholder="16-character app password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

