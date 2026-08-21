"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteMember } from "@/app/members/actions";

export function MemberActions({ memberId }: { memberId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this member?")) {
      startTransition(async () => {
        await deleteMember(memberId);
      });
    }
  };

  return (
    <>
      <Link href={`/members/edit/${memberId}`} className="text-indigo-600 hover:text-indigo-900 font-medium mr-3">
        Edit
      </Link>
      <button 
        onClick={handleDelete} 
        disabled={isPending}
        className="text-rose-600 hover:text-rose-900 font-medium disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
    </>
  );
}
