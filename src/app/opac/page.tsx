import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import OpacSearchBar from "./OpacSearchBar";

import { buildSearchConditions } from '@/lib/searchUtils'

const prisma = new PrismaClient();

export default async function OpacPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  let books: any[] = [];
  let recentBooks: any[] = [];
  
  if (query) {
    books = await prisma.book.findMany({
      where: buildSearchConditions(query, ['title', 'author', 'accNo']),
      orderBy: { title: "asc" },
      take: 50,
    });
  } else {
    // If no query, show new arrivals
    recentBooks = await prisma.book.findMany({
      orderBy: { dateAdded: "desc" },
      take: 6,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-indigo-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Library Catalog
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
            Search our collection of books, journals, and resources.
          </p>
          
          <OpacSearchBar initialQuery={query} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            {query ? `Search Results for "${query}"` : "New Arrivals"}
          </h2>
          <Link href="/login" className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-5 py-2 rounded-lg font-medium transition shadow-sm text-sm">
            Staff Login
          </Link>
        </div>

        {query && books.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xl text-slate-500">No books found matching your search.</h3>
          </div>
        )}

        {/* Search Results */}
        {query && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Link href={`/opac/book/${book.id}`} key={book.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition block group">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                    book.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 
                    book.status === 'BORROWED' ? 'bg-amber-100 text-amber-700' : 
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {book.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono group-hover:text-indigo-500 transition">{book.accNo}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-indigo-600 transition" title={book.title}>{book.title}</h3>
                <p className="text-slate-600 mb-4">{book.author || "Unknown Author"}</p>
                
                <div className="text-sm text-slate-500 space-y-1">
                  <p>Publisher: <span className="text-slate-700">{book.publisher || "-"}</span></p>
                  <p>Year: <span className="text-slate-700">{book.year || "-"}</span></p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* New Arrivals Showcase */}
        {!query && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentBooks.map((book) => (
              <Link href={`/opac/book/${book.id}`} key={book.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition block group overflow-hidden">
                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-200">
                  {book.isbn ? (
                    <img 
                      src={`https://books.google.com/books/publisher/content/images/frontcover/${book.isbn}?fife=w400-h600&source=gbs_api`}
                      alt={book.title}
                      className="h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center text-slate-400 p-6 text-center ${book.isbn ? 'hidden' : ''}`}>
                    <span className="text-sm font-medium line-clamp-3">{book.title}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      book.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 
                      book.status === 'BORROWED' ? 'bg-amber-100 text-amber-700' : 
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {book.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono group-hover:text-indigo-500 transition">{book.accNo}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-indigo-600 transition" title={book.title}>{book.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-1">{book.author || "Unknown Author"}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
