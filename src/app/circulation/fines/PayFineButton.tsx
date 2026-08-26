"use client";

import { useState } from "react";
import { markFineAsPaid } from "../actions";

export default function PayFineButton({ loanId }: { loanId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (confirm("Are you sure you want to mark this fine as paid?")) {
      setLoading(true);
      const res = await markFineAsPaid(loanId);
      if (!res.success) {
        alert(res.error || "Failed to mark as paid");
        setLoading(false);
      }
    }
  };

  return (
    <button 
      onClick={handlePay}
      disabled={loading}
      className="px-4 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-sm font-medium transition disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Collect Fine'}
    </button>
  );
}
