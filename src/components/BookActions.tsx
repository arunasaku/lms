"use client";

import Link from "next/link";
import { deleteBook } from "@/app/catalog/actions";
import { useTransition } from "react";

export default function BookActions({ bookId, canDelete }: { bookId: string, canDelete: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      startTransition(() => {
        deleteBook(bookId);
      });
    }
  };

  return (
    <td className="p-4 text-right text-sm">
      <Link href={`/catalog/edit/${bookId}`} className="text-indigo-600 hover:text-indigo-900 font-medium mr-3">
        Edit
      </Link>
      {canDelete && (
        <button 
          onClick={handleDelete} 
          disabled={isPending}
          className="text-rose-600 hover:text-rose-900 font-medium disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Delete"}
        </button>
      )}
    </td>
  );
}
