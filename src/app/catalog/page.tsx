import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

import { buildSearchConditions } from '@/lib/searchUtils'

import SearchBar from './SearchBar'
import BookActions from '@/components/BookActions'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const permCatalog = (session?.user as any)?.permCatalog;
  const canManageCatalog = role === "ADMIN" || role === "LIBRARIAN" || permCatalog;
  const params = await searchParams
  const query = params.q || ''
  
  const page = parseInt(params.page || '1', 10)
  const limit = 20
  const skip = (page - 1) * limit

  // Query database
  const where = query ? buildSearchConditions(query, ['title', 'author', 'accNo']) : {}

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
        <h2 className="text-3xl font-bold text-slate-800">Library Catalog</h2>
        <div className="flex gap-3">
          {canManageCatalog && (
            <Link href="/catalog/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center">
              + Add New Book
            </Link>
          )}
          {canManageCatalog && (
            <a href="/api/export/accession-register" download className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Export Accession Register
            </a>
          )}
        </div>
      </div>
      
      {/* Search Bar */}
      <SearchBar />

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Acc No</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Author</th>
                <th className="p-4 font-semibold">Status</th>
                {canManageCatalog && <th className="p-4 font-semibold text-right">Actions</th>}
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
                      book.status === 'BORROWED' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {book.status}
                    </span>
                  </td>
                  {canManageCatalog && (
                    <BookActions bookId={book.id} canDelete={role === 'ADMIN' || role === 'LIBRARIAN'} />
                  )}
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={canManageCatalog ? 5 : 4} className="p-8 text-center text-slate-500">
                    No books found matching your search.
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
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span> ({total} results)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/catalog?q=${query}&page=${page - 1}`} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-50">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/catalog?q=${query}&page=${page + 1}`} className="px-3 py-1 bg-white border border-slate-200 rounded text-sm hover:bg-slate-50">
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
