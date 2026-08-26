"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SinglishSearchInput from "@/components/SinglishSearchInput";

export default function OpacSearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedQuery !== initialQuery) {
        if (debouncedQuery) {
          router.push(`/opac?q=${encodeURIComponent(debouncedQuery)}`);
        } else {
          router.push(`/opac`);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [debouncedQuery, initialQuery, router]);

  const handleSearch = (q: string) => {
    if (q) {
      router.push(`/opac?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/opac`);
    }
  };

  return (
    <div className="mt-8 max-w-2xl mx-auto shadow-lg rounded-xl overflow-hidden">
      <SinglishSearchInput 
        initialQuery={initialQuery}
        placeholder="Search by title, author, or accession number..."
        onSearch={handleSearch}
        onChange={(val) => setDebouncedQuery(val)}
        className="w-full bg-white"
        buttonClassName="bg-indigo-800 hover:bg-indigo-900 text-white px-8 font-medium transition flex items-center justify-center rounded-r-xl md:rounded-l-none"
      />
    </div>
  );
}
