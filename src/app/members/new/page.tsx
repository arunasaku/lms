import { createMember } from "../actions";
import Link from "next/link";
import { RoleSelector } from "@/components/RoleSelector";

export default function NewMemberPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/members" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition mb-2 inline-block">
            &larr; Back to Members
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Add New Member</h2>
          <p className="text-slate-500 text-sm mt-1">Register a new member or staff in the library system.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form action={createMember} className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="memberId" className="block text-sm font-medium text-slate-700">Member ID *</label>
              <input 
                type="text" 
                id="memberId" 
                name="memberId" 
                required 
                placeholder="e.g. M0015"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Member's full name..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Initial Password *</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                required
                placeholder="Enter a secure password..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <RoleSelector />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                autoComplete="off"
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input 
                type="text" 
                id="phone" 
                name="phone" 
                autoComplete="off"
                placeholder="e.g. 0771234567"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium text-slate-700">Department / Class</label>
              <input 
                type="text" 
                id="department" 
                name="department" 
                autoComplete="off"
                placeholder="e.g. Grade 10 / IT Dept"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">Home Address</label>
              <input 
                type="text" 
                id="address" 
                name="address" 
                autoComplete="off"
                placeholder="Full address..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Link href="/members" className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition shadow-sm">
              Cancel
            </Link>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">
              Register Member
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
