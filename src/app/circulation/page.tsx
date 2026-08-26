"use client";

import { useState, useEffect } from "react";
import { issueBook, returnBook, getMemberName, getBookTitle } from "./actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import BarcodeScanner from "@/components/BarcodeScanner";

export default function CirculationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && (session?.user as any)?.role === "MEMBER")) {
      router.push("/");
    }
  }, [status, session, router]);

  const [activeTab, setActiveTab] = useState<"ISSUE" | "RETURN">("ISSUE");
  
  // Scanner state
  const [showScanner, setShowScanner] = useState<"NONE" | "MEMBER" | "ISSUE_BOOK" | "RETURN_BOOK">("NONE");

  // Issue state
  const [issueMemberId, setIssueMemberId] = useState("");
  const [issueMemberName, setIssueMemberName] = useState<string | null>(null);
  
  const [issueAccNo, setIssueAccNo] = useState("");
  const [issueBookTitle, setIssueBookTitle] = useState<string | null>(null);
  
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueResult, setIssueResult] = useState<{success?: boolean, message?: string} | null>(null);

  // Return state
  const [returnAccNo, setReturnAccNo] = useState("");
  const [returnBookTitle, setReturnBookTitle] = useState<string | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnResult, setReturnResult] = useState<{success?: boolean, message?: string} | null>(null);

  // Fetch Member Name
  useEffect(() => {
    const fetchMember = async () => {
      if (issueMemberId.length > 2) {
        const name = await getMemberName(issueMemberId);
        setIssueMemberName(name);
      } else {
        setIssueMemberName(null);
      }
    };
    const timeoutId = setTimeout(fetchMember, 300);
    return () => clearTimeout(timeoutId);
  }, [issueMemberId]);

  // Fetch Book Title (Issue)
  useEffect(() => {
    const fetchBook = async () => {
      if (issueAccNo.length > 0) {
        const bookTitle = await getBookTitle(issueAccNo);
        setIssueBookTitle(bookTitle || null);
      } else {
        setIssueBookTitle(null);
      }
    };
    const timeoutId = setTimeout(fetchBook, 300);
    return () => clearTimeout(timeoutId);
  }, [issueAccNo]);

  // Fetch Book Title (Return)
  useEffect(() => {
    const fetchBook = async () => {
      if (returnAccNo.length > 0) {
        const bookTitle = await getBookTitle(returnAccNo);
        setReturnBookTitle(bookTitle || null);
      } else {
        setReturnBookTitle(null);
      }
    };
    const timeoutId = setTimeout(fetchBook, 300);
    return () => clearTimeout(timeoutId);
  }, [returnAccNo]);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueLoading(true);
    setIssueResult(null);

    const formData = new FormData();
    formData.append("memberId", issueMemberId);
    formData.append("accNo", issueAccNo);

    const res = await issueBook(formData);
    setIssueResult({
      success: res.success,
      message: res.success ? res.message : res.error
    });
    
    if (res.success) {
      setIssueAccNo("");
      setIssueMemberId("");
      setIssueMemberName(null);
      setIssueBookTitle(null);
    }
    
    setIssueLoading(false);
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setReturnLoading(true);
    setReturnResult(null);

    const formData = new FormData();
    formData.append("accNo", returnAccNo);

    const res = await returnBook(formData);
    setReturnResult({
      success: res.success,
      message: res.success ? res.message : res.error
    });

    if (res.success) {
      setReturnAccNo("");
      setReturnBookTitle(null);
    }

    setReturnLoading(false);
  };

  const onScanSuccess = (decodedText: string) => {
    if (showScanner === "MEMBER") {
      setIssueMemberId(decodedText);
    } else if (showScanner === "ISSUE_BOOK") {
      setIssueAccNo(decodedText);
    } else if (showScanner === "RETURN_BOOK") {
      setReturnAccNo(decodedText);
    }
    setShowScanner("NONE");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Circulation Desk</h2>
          <p className="text-slate-500 mt-1">Issue and return books, and manage circulation.</p>
        </div>
        <div className="flex gap-3">
          <a href="/circulation/fines" className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-sm font-medium transition">
            Unpaid Fines
          </a>
          <a href="/circulation/reports" className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium transition">
            Fines Report
          </a>
        </div>
      </div>

      {showScanner !== "NONE" && (
        <BarcodeScanner 
          onScan={onScanSuccess} 
          onClose={() => setShowScanner("NONE")} 
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab("ISSUE")}
            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'ISSUE' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            Issue Book
          </button>
          <button 
            onClick={() => setActiveTab("RETURN")}
            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'RETURN' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            Return Book
          </button>
        </div>

        <div className="p-8">
          {/* ISSUE TAB */}
          {activeTab === "ISSUE" && (
            <form onSubmit={handleIssue} className="space-y-6 max-w-lg mx-auto">
              {issueResult && (
                <div className={`p-4 rounded-lg text-sm border-l-4 ${issueResult.success ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-rose-500 text-rose-800'}`}>
                  {issueResult.message}
                </div>
              )}
              
              <div className="space-y-2 relative">
                <div className="flex justify-between">
                   <label htmlFor="memberId" className="block text-sm font-medium text-slate-700">Member ID</label>
                   {issueMemberName && <span className="text-sm font-medium text-indigo-600">{issueMemberName}</span>}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="memberId" 
                    value={issueMemberId}
                    onChange={(e) => setIssueMemberId(e.target.value)}
                    required 
                    placeholder="Scan or type Member ID..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-lg font-mono"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowScanner("MEMBER")}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                    title="Scan with Camera"
                  >
                    <Camera size={24} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 relative">
                <div className="flex justify-between">
                   <label htmlFor="accNo" className="block text-sm font-medium text-slate-700">Book Accession Number</label>
                   {issueBookTitle && <span className="text-sm font-medium text-indigo-600">{issueBookTitle}</span>}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="accNo" 
                    value={issueAccNo}
                    onChange={(e) => setIssueAccNo(e.target.value)}
                    required 
                    placeholder="Scan or type Book Acc No..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-lg font-mono"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowScanner("ISSUE_BOOK")}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                    title="Scan with Camera"
                  >
                    <Camera size={24} />
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={issueLoading || (!issueMemberName && issueMemberId.length > 0) || (!issueBookTitle && issueAccNo.length > 0)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed text-lg mt-4"
              >
                {issueLoading ? "Processing..." : "Issue Book"}
              </button>
            </form>
          )}

          {/* RETURN TAB */}
          {activeTab === "RETURN" && (
            <form onSubmit={handleReturn} className="space-y-6 max-w-lg mx-auto">
              {returnResult && (
                <div className={`p-4 rounded-lg text-sm border-l-4 ${returnResult.success ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-rose-500 text-rose-800'}`}>
                  {returnResult.message}
                </div>
              )}
              
              <div className="space-y-2 relative">
                <div className="flex justify-between">
                   <label htmlFor="returnAccNo" className="block text-sm font-medium text-slate-700">Book Accession Number</label>
                   {returnBookTitle && <span className="text-sm font-medium text-indigo-600">{returnBookTitle}</span>}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="returnAccNo" 
                    value={returnAccNo}
                    onChange={(e) => setReturnAccNo(e.target.value)}
                    required 
                    placeholder="Scan or type Book Acc No..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-lg font-mono"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowScanner("RETURN_BOOK")}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200"
                    title="Scan with Camera"
                  >
                    <Camera size={24} />
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={returnLoading || (!returnBookTitle && returnAccNo.length > 0)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed text-lg mt-4"
              >
                {returnLoading ? "Processing..." : "Return Book"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
