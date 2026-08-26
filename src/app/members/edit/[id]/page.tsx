import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { updateMember } from '@/app/members/actions'
import { RoleSelector } from '@/components/RoleSelector'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient()

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.user.findUnique({ where: { id } })

  if (!member) {
    redirect('/members')
  }

  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (userRole !== 'ADMIN' && member.role === 'ADMIN') {
    redirect('/members')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/members" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition mb-2 inline-block">
            &larr; Back to Directory
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Edit Member</h2>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form action={updateMember} className="p-8 space-y-6">
          <input type="hidden" name="id" value={member.id} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="memberId" className="block text-sm font-medium text-slate-700">Member ID</label>
              <input 
                type="text" 
                id="memberId"
                disabled
                value={member.memberId}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Member ID cannot be changed.</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name *</label>
              <input 
                type="text" 
                name="name" 
                id="name" 
                defaultValue={member.name}
                required 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            
            <RoleSelector 
              defaultRole={member.role} 
              defaultPermissions={{
                permCirculation: member.permCirculation,
                permCatalog: member.permCatalog,
                permMembers: member.permMembers,
                permInventory: member.permInventory,
                permDashboard: member.permDashboard
              }} 
            />
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                autoComplete="off"
                defaultValue={member.email || ""}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                id="phone" 
                autoComplete="off"
                defaultValue={member.phone || ""}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium text-slate-700">Department / Grade</label>
              <input 
                type="text" 
                name="department" 
                id="department"
                autoComplete="off"
                defaultValue={member.department || ""}
                placeholder="e.g. Grade 10, Science Faculty"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
            <textarea 
              name="address" 
              id="address" 
              rows={3}
              autoComplete="off"
              defaultValue={member.address || ""}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">New Password (Leave blank to keep current)</label>
            <input 
              type="password" 
              name="password" 
              id="password" 
              autoComplete="new-password"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          
          <div className="pt-6 border-t border-slate-200 flex justify-end gap-3">
            <Link href="/members" className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition">
              Cancel
            </Link>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition shadow-sm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
