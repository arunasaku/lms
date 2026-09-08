import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OpacSearchBar from "./OpacSearchBar";
import { buildSearchConditions } from "@/lib/searchUtils";

export default async function OpacPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const page = parseInt(resolvedParams.page || "1", 10);
  const limit = 24;
  const skip = (page - 1) * limit;

  const where = query ? buildSearchConditions(query, ["title", "author", "accNo"]) : {};

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { accNoInt: "asc" },
    }),
    prisma.book.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-indigo-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Library Catalog
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
            Explore our collection of books, journals, and educational resources.
          </p>

          <OpacSearchBar initialQuery={query} />
        </div>
      </div>

      {/* Catalog Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {query ? `Search Results for "${query}"` : "Full Catalog Collection"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Showing {total === 0 ? 0 : skip + 1} - {Math.min(skip + limit, total)} of {total} items
            </p>
          </div>
          <Link
            href="/login"
            className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-5 py-2.5 rounded-lg font-medium transition shadow-sm text-sm shrink-0"
          >
            Staff Login
          </Link>
        </div>

        {/* Empty State */}
        {books.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-600">No books found</h3>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search terms or filters.</p>
          </div>
        )}

        {/* Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <Link
              href={`/opac/book/${book.id}`}
              key={book.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 block group overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-200 shrink-0">
                {book.isbn ? (
                  <img
                    src={`https://books.google.com/books/publisher/content/images/frontcover/${book.isbn}?fife=w400-h600&source=gbs_api`}
                    alt={book.title}
                    className="h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center ${book.isbn ? "hidden" : ""}`}>
                  <svg className="w-10 h-10 mb-1 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-xs font-medium text-slate-500 line-clamp-2">{book.title}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        book.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-700"
                          : book.status === "BORROWED"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {book.status}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded group-hover:text-indigo-600 transition">
                      Acc: {book.accNo}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-slate-800 mb-1 line-clamp-2 group-hover:text-indigo-600 transition"
                    title={book.title}
                  >
                    {book.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-1 mb-2">{book.author || "Unknown Author"}</p>
                </div>
                <div className="text-xs text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
                  <span>{book.publisher || "-"}</span>
                  <span>{book.year || "-"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-10 p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-slate-600">
              Showing Page <span className="font-semibold text-slate-800">{page}</span> of{" "}
              <span className="font-semibold text-slate-800">{totalPages}</span> ({total} Total Books)
            </span>
            <div className="flex gap-2 items-center">
              {page > 1 && (
                <>
                  <Link
                    href={`/opac?q=${query}&page=1`}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium transition"
                  >
                    First
                  </Link>
                  <Link
                    href={`/opac?q=${query}&page=${page - 1}`}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium transition"
                  >
                    Previous
                  </Link>
                </>
              )}
              {page < totalPages && (
                <>
                  <Link
                    href={`/opac?q=${query}&page=${page + 1}`}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium transition"
                  >
                    Next
                  </Link>
                  <Link
                    href={`/opac?q=${query}&page=${totalPages}`}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium transition"
                  >
                    Last
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
