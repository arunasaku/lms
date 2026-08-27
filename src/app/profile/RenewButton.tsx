"use client";

import { useTransition } from "react";
import { renewLoan } from "@/app/circulation/actions";

interface RenewButtonProps {
  loanId: string;
  canRenew: boolean;
  renewalsCount: number;
}

export default function RenewButton({ loanId, canRenew, renewalsCount }: RenewButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleRenew = () => {
    if (confirm("Are you sure you want to renew this book?")) {
      startTransition(async () => {
        const res = await renewLoan(loanId);
        if (!res.success) {
          alert(res.error);
        } else {
          alert(res.message);
        }
      });
    }
  };

  return (
    <button
      onClick={handleRenew}
      disabled={isPending || !canRenew}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition shadow-sm ${
        canRenew
          ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
          : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
      }`}
    >
      {isPending ? "Renewing..." : `Renew (${renewalsCount}/2)`}
    </button>
  );
}
