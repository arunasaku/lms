import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import ActionButtons from "./ActionButtons";
import ReviewForm from "./ReviewForm";

const prisma = new PrismaClient();

export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const memberId = (session?.user as any)?.memberId;
  const userRole = (session?.user as any)?.role;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Book Not Found</h2>
          <Link href="/opac" className="text-indigo-600 hover:underline mt-4 inline-block">Back to Catalog</Link>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = book.reviews.length > 0
    ? (book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length).toFixed(1)
    : "No ratings yet";

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-indigo-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/opac" className="text-indigo-100 hover:text-white transition text-sm flex items-center gap-2 mb-6">
            &larr; Back to Catalog
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 md:w-48 flex-shrink-0 bg-white p-2 rounded-xl shadow-lg">
              <div className="w-full aspect-[2/3] relative">
                {/* We use a modified BookCover here, but since BookCover is currently styled small, let's just use the small one or a custom one */}
                <BookCover title={book.title} author={book.author} isbn={book.isbn} />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                  book.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 
                  book.status === 'BORROWED' ? 'bg-amber-100 text-amber-700' : 
                  'bg-rose-100 text-rose-700'
                }`}>
                  {book.status}
                </span>
                <span className="bg-indigo-700/50 text-indigo-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider border border-indigo-500">
                  {book.itemType}
                </span>
                <span className="bg-indigo-700/50 text-indigo-100 px-3 py-1 rounded-full text-xs font-bold tracking-wider border border-indigo-500">
                  ⭐ {avgRating} ({book.reviews.length} reviews)
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                {book.title}
              </h1>
              <p className="text-xl text-indigo-100 font-medium">By {book.author || "Unknown Author"}</p>
              
              <div className="pt-6">
                <ActionButtons 
                  bookId={book.id} 
                  status={book.status} 
                  isLoggedIn={!!memberId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-2 space-y-8">
          {/* Reviews Section */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Reviews & Ratings</h3>
            
            {memberId ? (
              <ReviewForm bookId={book.id} />
            ) : (
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 text-center mb-8">
                <p className="text-slate-600 mb-3">Please log in to leave a review.</p>
                <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition inline-block">Login to Review</Link>
              </div>
            )}

            <div className="space-y-6 mt-8 divide-y divide-slate-100">
              {book.reviews.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No reviews yet. Be the first to review this book!</p>
              ) : (
                book.reviews.map(review => (
                  <div key={review.id} className="pt-6 first:pt-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-800">{review.user.name}</p>
                        <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex text-amber-400">
                        {Array(5).fill(0).map((_, i) => (
                          <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-slate-600 mt-3 whitespace-pre-wrap">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Book Details</h3>
            
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase">Accession No</dt>
                <dd className="font-mono font-medium text-slate-800">{book.accNo}</dd>
              </div>
              
              {book.isbn && (
                <div>
                  <dt className="text-xs font-semibold text-slate-500 uppercase">ISBN</dt>
                  <dd className="font-mono text-slate-800">{book.isbn}</dd>
                </div>
              )}
              
              {book.publisher && (
                <div>
                  <dt className="text-xs font-semibold text-slate-500 uppercase">Publisher</dt>
                  <dd className="text-slate-800">{book.publisher}</dd>
                </div>
              )}
              
              {book.year && (
                <div>
                  <dt className="text-xs font-semibold text-slate-500 uppercase">Year</dt>
                  <dd className="text-slate-800">{book.year}</dd>
                </div>
              )}
              
              {book.category && (
                <div>
                  <dt className="text-xs font-semibold text-slate-500 uppercase">Category</dt>
                  <dd className="text-slate-800">{book.category}</dd>
                </div>
              )}
              
              {book.ddc && (
                <div>
                  <dt className="text-xs font-semibold text-slate-500 uppercase">DDC Classification</dt>
                  <dd className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block mt-1">{book.ddc}</dd>
                </div>
              )}
              
              {book.shelfLoc && (
                <div>
                  <dt className="text-xs font-semibold text-slate-500 uppercase">Shelf Location</dt>
                  <dd className="text-slate-800 font-medium text-indigo-700">{book.shelfLoc}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

      </div>
    </div>
  );
}
