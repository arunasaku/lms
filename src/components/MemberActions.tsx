"use client";

import { useTransition } from "react";
import Link from "next/link";
import { deleteMember } from "@/app/members/actions";

export function MemberActions({ memberId, userRole, targetRole, currentUserId }: { memberId: string, userRole?: string, targetRole?: string, currentUserId?: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this member?")) {
      startTransition(async () => {
        await deleteMember(memberId);
      });
    }
  };

  // STAFF cannot edit other STAFF or LIBRARIAN
  // They can edit MEMBER, or themselves
  const canEdit = 
    userRole === 'ADMIN' || 
    userRole === 'LIBRARIAN' || 
    (userRole === 'STAFF' && (targetRole === 'MEMBER' || currentUserId === memberId));

  return (
    <>
      <Link href={`/members/${memberId}`} className="text-slate-600 hover:text-slate-900 font-medium mr-3">
        View
      </Link>
      {canEdit && (
        <Link href={`/members/edit/${memberId}`} className="text-indigo-600 hover:text-indigo-900 font-medium mr-3">
          Edit
        </Link>
      )}
      {(userRole === 'ADMIN' || userRole === 'LIBRARIAN') && (
        <button 
          onClick={handleDelete} 
          disabled={isPending}
          className="text-rose-600 hover:text-rose-900 font-medium disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Delete"}
        </button>
      )}
    </>
  );
}
