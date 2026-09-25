import { createMember } from "../actions";
import Link from "next/link";
import { RoleSelector } from "@/components/RoleSelector";
import { GuaranteeSection } from "@/components/GuaranteeSection";

export default function NewMemberPage() {
  const todayStr = new Date().toISOString().split('T')[0];

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
          
          {/* Member Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <label htmlFor="salutation" className="block text-sm font-medium text-slate-700">Title / Salutation</label>
              <select 
                id="salutation" 
                name="salutation" 
                defaultValue="Mr."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="Mr.">Mr. (මහතා)</option>
                <option value="Mrs.">Mrs. (මහත්මිය)</option>
                <option value="Miss.">Miss. (මෙනෙවිය)</option>
                <option value="Rev.">Rev. (පූජ්‍ය / පූජක)</option>
                <option value="Dr.">Dr. (වෛද්‍ය / ආචාර්ය)</option>
                <option value="Master.">Master. (ළමා)</option>
                <option value="Hon.">Hon. (ගරු)</option>
                <option value="Other">Other (වෙනත්)</option>
              </select>
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

            <div className="space-y-2">
              <label htmlFor="memberType" className="block text-sm font-medium text-slate-700">Member Type *</label>
              <select 
                id="memberType" 
                name="memberType" 
                defaultValue="ADULT"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="ADULT">Adult (වැඩිහිටි)</option>
                <option value="CHILDREN">Child / Student (ළමා / ශිෂ්‍ය)</option>
                <option value="SENIOR">Senior Citizen (ජ්‍යෙෂ්ඨ පුරවැසි - පොත් 5ක්)</option>
              </select>
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
                  defaultValue={todayStr}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="renewedDate" className="block text-sm font-medium text-slate-700">Renewed Date</label>
                <input 
                  type="date" 
                  id="renewedDate" 
                  name="renewedDate" 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                  id="mobileNo" 
                  name="mobileNo" 
                  autoComplete="off"
                  placeholder="e.g. 0771234567"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="whatsappNo" className="block text-sm font-medium text-slate-700">WhatsApp No</label>
                <input 
                  type="text" 
                  id="whatsappNo" 
                  name="whatsappNo" 
                  autoComplete="off"
                  placeholder="e.g. 0771234567"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="homeNo" className="block text-sm font-medium text-slate-700">Home Number</label>
                <input 
                  type="text" 
                  id="homeNo" 
                  name="homeNo" 
                  autoComplete="off"
                  placeholder="e.g. 0112345678"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
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
              <label htmlFor="nic" className="block text-sm font-medium text-slate-700">NIC / Guardian's NIC</label>
              <input 
                type="text" 
                id="nic" 
                name="nic" 
                autoComplete="off"
                placeholder="e.g. 199012345678"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="homeAddress" className="block text-sm font-medium text-slate-700">Home Address</label>
            <input 
              type="text" 
              id="homeAddress" 
              name="address" 
              autoComplete="off"
              placeholder="Full address..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="occupation" className="block text-sm font-medium text-slate-700">Occupation</label>
              <select 
                id="occupation" 
                name="occupation" 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                id="customOccupation" 
                name="customOccupation" 
                autoComplete="off"
                placeholder="e.g. Engineer"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Guarantor & Deposit Information */}
          <GuaranteeSection />

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
