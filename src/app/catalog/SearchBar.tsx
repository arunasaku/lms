"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SinglishSearchInput from "@/components/SinglishSearchInput";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        if (query) {
          router.push(`/catalog?q=${encodeURIComponent(query)}`);
        } else {
          router.push(`/catalog`);
        }
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query, router, initialQuery]);

  const handleSearch = (q: string) => {
    if (q) {
      router.push(`/catalog?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/catalog`);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <SinglishSearchInput 
        initialQuery={initialQuery}
        placeholder="Search by Title, Author, or Accession No..."
        onSearch={handleSearch}
        onChange={(q) => setQuery(q)}
      />
    </div>
  );
}
