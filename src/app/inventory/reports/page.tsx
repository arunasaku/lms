import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function InventoryReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string, since?: string, page?: string }>
}) {
  const params = await searchParams
  const reportType = params.type || 'AVAILABLE'
  const page = parseInt(params.page || '1', 10)
  const limit = 50
  const skip = (page - 1) * limit
  
  // Default 'since' to 30 days ago for filtering verified books
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const defaultSince = thirtyDaysAgo.toISOString().split('T')[0];
  
  const sinceStr = params.since || defaultSince;
  const sinceDate = new Date(sinceStr);

  let where = {};
  
  if (reportType === 'MISSING') {
    // Missing means it has never been verified OR it was last verified before the 'since' date
    where = {
      OR: [
        { lastVerified: null },
        { lastVerified: { lt: sinceDate } }
      ]
    }
  } else if (reportType === 'AVAILABLE' || reportType === 'REPAIR' || reportType === 'DISCARDED' || reportType === 'BORROWED') {
    // Other reports mean it WAS verified recently (on or after 'since') AND has this status
    where = {
      status: reportType,
      lastVerified: { gte: sinceDate }
    }
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { accNoInt: 'asc' }
    }),
    prisma.book.count({ where })
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/inventory" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition mb-2 inline-block">
            &larr; Back to Scanner
          </Link>
          <h2 className="text-3xl font-bold text-slate-800">Verification Reports</h2>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <form method="GET" action="/inventory/reports" className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Type</label>
            <select name="type" defaultValue={reportType} className="w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
              <option value="AVAILABLE">Verified (Available)</option>
              <option value="BORROWED">Verified (Borrowed)</option>
              <option value="REPAIR">Needs Repair</option>
              <option value="DISCARDED">Discarded</option>
              <option value="MISSING">Missing / Not Scanned</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Started On</label>
            <input type="date" name="since" defaultValue={sinceStr} className="w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          
          <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm h-[42px]">
            Generate
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">
            {reportType === 'MISSING' ? 'Missing Books' : 
             reportType === 'REPAIR' ? 'Books to Repair' : 
             reportType === 'DISCARDED' ? 'Discarded Books' : 
             reportType === 'BORROWED' ? 'Verified Borrowed Books' : 'Successfully Verified Books'}
             <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
               {total} Total
             </span>
          </h3>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Acc No</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Author</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Last Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.map(book => (
                <tr key={book.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-sm font-mono text-slate-600">{book.accNo}</td>
                  <td className="p-4 font-medium text-slate-800">{book.title}</td>
                  <td className="p-4 text-sm text-slate-600">{book.author || '-'}</td>
                  <td className="p-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      book.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                      book.status === 'REPAIR' ? 'bg-amber-100 text-amber-800' :
                      book.status === 'DISCARDED' ? 'bg-rose-100 text-rose-800' :
                      book.status === 'BORROWED' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {reportType === 'MISSING' ? 'MISSING' : book.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {book.lastVerified ? new Date(book.lastVerified).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No books found for this report.
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
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/inventory/reports?type=${reportType}&since=${sinceStr}&page=${page - 1}`} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-50">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/inventory/reports?type=${reportType}&since=${sinceStr}&page=${page + 1}`} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-50">
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
