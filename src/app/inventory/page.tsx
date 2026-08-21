"use client";

import { useState, useRef, useEffect } from "react";
import { verifyBook, verifyBorrowedBook, getBookTitle } from "./actions";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && (session?.user as any)?.role === "MEMBER")) {
      router.push("/");
    }
  }, [status, session, router]);

  const [activeTab, setActiveTab] = useState<"PHYSICAL" | "BORROWED">("PHYSICAL");

  const [accNo, setAccNo] = useState("");
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [bookStatus, setBookStatus] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success?: boolean, message?: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input for barcode scanners
  useEffect(() => {
    inputRef.current?.focus();
  }, [result, activeTab]);

  // Fetch Book Title
  useEffect(() => {
    const fetchBook = async () => {
      if (accNo.length > 0) {
        const bookData = await getBookTitle(accNo);
        if (bookData) {
          setBookTitle(bookData.title);
          setBookStatus(bookData.status);
        } else {
          setBookTitle(null);
          setBookStatus(null);
        }
      } else {
        setBookTitle(null);
        setBookStatus(null);
      }
    };
    const timeoutId = setTimeout(fetchBook, 300);
    return () => clearTimeout(timeoutId);
  }, [accNo]);

  const executeVerification = async (statusToSet: string) => {
    if (!accNo || !bookTitle) return;
    
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("accNo", accNo);
    formData.append("status", statusToSet);

    const res = await verifyBook(formData);
    setResult({
      success: res.success,
      message: res.success ? res.message : res.error
    });

    if (res.success) {
      setAccNo(""); // Clear input for next scan
      setBookTitle(null);
      setBookStatus(null);
    }

    setLoading(false);
  };

  const executeBorrowedVerification = async () => {
    if (!accNo || !bookTitle) return;
    
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("accNo", accNo);

    const res = await verifyBorrowedBook(formData);
    setResult({
      success: res.success,
      message: res.success ? res.message : res.error
    });

    if (res.success) {
      setAccNo("");
      setBookTitle(null);
      setBookStatus(null);
    }

    setLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "PHYSICAL") {
      executeVerification("AVAILABLE");
    } else {
      executeBorrowedVerification();
    }
  };

  // Warning flags
  const isPhysicalBlocked = activeTab === "PHYSICAL" && bookStatus === "BORROWED";
  const isBorrowedBlocked = activeTab === "BORROWED" && bookStatus !== "BORROWED" && bookStatus !== null;

  const isReady = accNo.length > 0 && bookTitle !== null && !loading && !isPhysicalBlocked && !isBorrowedBlocked;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Verification</h2>
        <Link href="/inventory/reports" className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
          View Reports
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => { setActiveTab("PHYSICAL"); setResult(null); setAccNo(""); setBookTitle(null); setBookStatus(null); }}
            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'PHYSICAL' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            Scan Physical Books
          </button>
          <button 
            onClick={() => { setActiveTab("BORROWED"); setResult(null); setAccNo(""); setBookTitle(null); setBookStatus(null); }}
            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'BORROWED' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            Verify Borrowed Cards
          </button>
        </div>

        <div className="p-8">
          <p className="text-slate-500 mb-6 text-center">
            {activeTab === "PHYSICAL" 
              ? "Scan or type the Accession Number to verify a book's physical presence on the shelves." 
              : "Scan the Accession Number of a borrowed book (from the loan card) to verify it is actively issued."}
          </p>
          
          <form onSubmit={handleFormSubmit} className="space-y-6 max-w-lg mx-auto">
            {/* Hidden submit for Barcode Scanner Enter Key */}
            <button type="submit" className="hidden">Submit</button>

            {result && (
              <div className={`p-4 rounded-lg text-sm border-l-4 ${result.success ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-rose-500 text-rose-800'}`}>
                {result.message}
              </div>
            )}
            
            <div className="space-y-2 relative">
              <div className="flex justify-between">
                <label htmlFor="accNo" className="block text-sm font-medium text-slate-700">Book Accession Number</label>
                {bookTitle && <span className="text-sm font-medium text-indigo-600">{bookTitle}</span>}
              </div>
              <input 
                ref={inputRef}
                type="text" 
                id="accNo" 
                value={accNo}
                onChange={(e) => setAccNo(e.target.value)}
                required 
                placeholder="e.g. 21697"
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-xl font-mono text-center"
              />
            </div>

            {/* Warning banners */}
            {isPhysicalBlocked && (
              <div className="p-4 rounded-lg text-sm border-l-4 bg-amber-50 border-amber-500 text-amber-800">
                Warning: This book is currently <strong>BORROWED</strong>. You cannot verify it in Physical Mode. Please switch to the "Verify Borrowed Cards" tab.
              </div>
            )}

            {isBorrowedBlocked && (
              <div className="p-4 rounded-lg text-sm border-l-4 bg-amber-50 border-amber-500 text-amber-800">
                Warning: This book is <strong>{bookStatus}</strong>, NOT borrowed. Please switch to the "Physical Books" tab.
              </div>
            )}

            {activeTab === "PHYSICAL" ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 text-center mb-4">Click a status below to verify this book</label>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => executeVerification('AVAILABLE')}
                    disabled={!isReady}
                    className="flex-1 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "..." : "Available"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => executeVerification('REPAIR')}
                    disabled={!isReady}
                    className="flex-1 p-4 rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "..." : "Needs Repair"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => executeVerification('DISCARDED')}
                    disabled={!isReady}
                    className="flex-1 p-4 rounded-xl border-2 border-rose-500 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "..." : "Discard"}
                  </button>
                </div>
                <p className="text-xs text-center text-slate-400 mt-4">
                  Tip: If you are using a Barcode Scanner, scanning will automatically verify the book as "Available".
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <button 
                  type="button" 
                  onClick={() => executeBorrowedVerification()}
                  disabled={!isReady}
                  className="w-full p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? "Verifying..." : "Verify as Borrowed Book"}
                </button>
                <p className="text-xs text-center text-slate-400 mt-4">
                  Tip: Scanning with a Barcode Scanner will automatically verify the book.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
