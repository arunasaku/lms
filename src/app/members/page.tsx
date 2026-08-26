import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { MemberActions } from '@/components/MemberActions'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MemberSearchBar from './MemberSearchBar';
import { buildSearchConditions } from '@/lib/searchUtils'

const prisma = new PrismaClient()

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role === "MEMBER") {
    redirect("/");
  }
  const params = await searchParams
  const query = params.q || ''
  
  const page = parseInt(params.page || '1', 10)
  const limit = 20
  const skip = (page - 1) * limit

  // Query database
  let where: any = query ? buildSearchConditions(query, ['name', 'memberId', 'department']) : {}
  const userRole = (session?.user as any)?.role;
  
  if (userRole !== "ADMIN") {
    where = { ...where, role: { not: "ADMIN" } }
  }

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/tools" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition mb-2 inline-block">
            &larr; Back to Tools
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Members Directory</h2>
        </div>
        <Link href="/tools" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
          + Add New Member
        </Link>
      </div>
      
      {/* Search Bar */}
      <MemberSearchBar initialQuery={query} />

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold w-16">Profile</th>
                <th className="p-4 font-semibold">Member ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                     <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        {member.name.substring(0, 2).toUpperCase()}
                     </div>
                  </td>
                  <td className="p-4 text-sm font-mono text-slate-600">{member.memberId}</td>
                  <td className="p-4 font-medium text-slate-800">{member.name}</td>
                  <td className="p-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        member.role === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{member.department || '-'}</td>
                  <td className="p-4 text-right text-sm">
                    <MemberActions memberId={member.id} userRole={userRole} />
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span> ({total} members)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/members?q=${query}&page=${page - 1}`} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-50">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/members?q=${query}&page=${page + 1}`} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-50">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

