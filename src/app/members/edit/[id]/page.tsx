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
  const currentUserId = (session?.user as any)?.id || (session?.user as any)?.memberId;

  if (userRole !== 'ADMIN' && member.role === 'ADMIN') {
    redirect('/members')
  }
  
  if (userRole === 'STAFF') {
    if (member.role === 'STAFF' && member.id !== currentUserId) {
      redirect('/members')
    }
    if (member.role === 'LIBRARIAN') {
      redirect('/members')
    }
  }

  const registeredDateStr = member.registeredDate 
    ? new Date(member.registeredDate).toISOString().split('T')[0]
    : new Date(member.createdAt).toISOString().split('T')[0];

  const renewedDateStr = member.renewedDate 
    ? new Date(member.renewedDate).toISOString().split('T')[0]
    : '';

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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="space-y-2">
              <label htmlFor="memberType" className="block text-sm font-medium text-slate-700">Member Type</label>
              <select 
                id="memberType" 
                name="memberType" 
                defaultValue={member.memberType || "ADULT"}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="ADULT">Adult</option>
                <option value="CHILDREN">Child / Student</option>
              </select>
            </div>
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

          {/* Registration & Renewal Dates */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-semibold text-slate-800 text-sm">Registration Dates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="registeredDate" className="block text-sm font-medium text-slate-700">Registration Date</label>
                <input 
                  type="date" 
                  id="registeredDate" 
                  name="registeredDate" 
                  defaultValue={registeredDateStr}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="renewedDate" className="block text-sm font-medium text-slate-700">Renewed Date</label>
                <input 
                  type="date" 
                  id="renewedDate" 
                  name="renewedDate" 
                  defaultValue={renewedDateStr}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Contact Numbers (Mobile, WhatsApp, Home) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-semibold text-slate-800 text-sm">Contact Numbers</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="mobileNo" className="block text-sm font-medium text-slate-700">Mobile No</label>
                <input 
                  type="text" 
                  name="mobileNo" 
                  id="mobileNo" 
                  autoComplete="off"
                  defaultValue={member.mobileNo || member.phone || ""}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="whatsappNo" className="block text-sm font-medium text-slate-700">WhatsApp No</label>
                <input 
                  type="text" 
                  name="whatsappNo" 
                  id="whatsappNo" 
                  autoComplete="off"
                  defaultValue={member.whatsappNo || ""}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="homeNo" className="block text-sm font-medium text-slate-700">Home Number</label>
                <input 
                  type="text" 
                  name="homeNo" 
                  id="homeNo" 
                  autoComplete="off"
                  defaultValue={member.homeNo || ""}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label htmlFor="nic" className="block text-sm font-medium text-slate-700">NIC / Guardian's NIC</label>
              <input 
                type="text" 
                name="nic" 
                id="nic"
                autoComplete="off"
                defaultValue={member.nic || ""}
                placeholder="e.g. 199012345678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
            <input 
              type="text" 
              name="address" 
              id="address"
              autoComplete="off"
              defaultValue={member.address || ""}
              placeholder="Full address..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="occupation" className="block text-sm font-medium text-slate-700">Occupation</label>
              <select 
                id="occupation" 
                name="occupation" 
                defaultValue={["Student", "Government", "Other"].includes(member.occupation || "") ? member.occupation || "" : (member.occupation ? "Custom" : "")}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="">Please Select</option>
                <option value="Student">Student</option>
                <option value="Government">Government</option>
                <option value="Other">Other</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="customOccupation" className="block text-sm font-medium text-slate-700">If Custom, specify here:</label>
              <input 
                type="text" 
                name="customOccupation" 
                id="customOccupation"
                autoComplete="off"
                defaultValue={!["Student", "Government", "Other"].includes(member.occupation || "") ? member.occupation || "" : ""}
                placeholder="e.g. Engineer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Guarantor Details Section */}
          <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200 space-y-4">
            <h4 className="font-semibold text-amber-900 text-base flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Guarantor Information (ඇපකරුගේ තොරතුරු)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="guarantorName" className="block text-sm font-medium text-slate-700">Guarantor Name</label>
                <input 
                  type="text" 
                  id="guarantorName" 
                  name="guarantorName" 
                  autoComplete="off"
                  defaultValue={member.guarantorName || ""}
                  placeholder="Guarantor's full name..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="guarantorPhone" className="block text-sm font-medium text-slate-700">Guarantor Phone / WhatsApp No</label>
                <input 
                  type="text" 
                  id="guarantorPhone" 
                  name="guarantorPhone" 
                  autoComplete="off"
                  defaultValue={member.guarantorPhone || ""}
                  placeholder="e.g. 0771234567"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="guarantorAddress" className="block text-sm font-medium text-slate-700">Guarantor Address</label>
              <input 
                type="text" 
                id="guarantorAddress" 
                name="guarantorAddress" 
                autoComplete="off"
                defaultValue={member.guarantorAddress || ""}
                placeholder="Guarantor's address..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>
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
