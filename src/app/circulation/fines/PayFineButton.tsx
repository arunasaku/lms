"use client";

import { useState } from "react";
import { markFineAsPaid } from "../actions";

export default function PayFineButton({ loanId }: { loanId: string }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [receiptNo, setReceiptNo] = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await markFineAsPaid(loanId, receiptNo);
    if (!res.success) {
      alert(res.error || "Failed to mark as paid");
      setLoading(false);
    } else {
      setIsOpen(false);
      setReceiptNo("");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className="px-4 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition disabled:opacity-50 inline-flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Collect Fine
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>Collect Fine</span>
                <span className="text-xs font-normal text-slate-500">(දඩ මුදල ලබාගැනීම)</span>
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Receipt Number / රිසිට්පත් අංකය
                </label>
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="e.g. REC-2026-001"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">
                  Optional: Enter official receipt number for record keeping.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel (අවලංගු කරන්න)
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Payment (තහවුරු කරන්න)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
