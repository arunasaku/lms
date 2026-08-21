"use client";

import { useRouter } from "next/navigation";
import SinglishSearchInput from "@/components/SinglishSearchInput";

export default function MemberSearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();

  const handleSearch = (q: string) => {
    if (q) {
      router.push(`/members?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/members`);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <SinglishSearchInput 
        initialQuery={initialQuery}
        placeholder="Search by Name, Member ID, or Department..."
        onSearch={handleSearch}
      />
    </div>
  );
}
