"use client";

import { useTransition } from "react";
import { reserveBook } from "../actions";

export default function ActionButtons({ bookId, status, isLoggedIn }: { bookId: string, status: string, isLoggedIn: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleReserve = () => {
    if (!isLoggedIn) {
      alert("Please login to reserve a book.");
      return;
    }
    
    if (confirm("Reserve this book? You will be notified when it is returned.")) {
      startTransition(async () => {
        const res = await reserveBook(bookId);
        if (res.success) {
          alert(res.message);
        } else {
          alert(res.error);
        }
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      {status === "BORROWED" && (
        <button 
          onClick={handleReserve}
          disabled={isPending}
          className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3 rounded-lg font-bold transition shadow-md disabled:opacity-50"
        >
          {isPending ? "Reserving..." : "Reserve Book (Place Hold)"}
        </button>
      )}
      
      {status === "AVAILABLE" && (
        <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-50 px-6 py-3 rounded-lg font-medium">
          This book is currently on the shelf! Visit the library to borrow it.
        </div>
      )}
    </div>
  );
}
