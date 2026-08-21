"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface SinglishSearchInputProps {
  initialQuery: string;
  placeholder: string;
  onSearch: (query: string) => void;
  onChange?: (query: string) => void;
  className?: string;
  buttonClassName?: string;
}

export default function SinglishSearchInput({ initialQuery, placeholder, onSearch, onChange, className, buttonClassName }: SinglishSearchInputProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onChange) onChange(val);
  };

  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className || ''}`}>
      <div className="relative flex-1">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 md:py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSearch(query);
            }
          }}
        />
      </div>
      <button 
        type="button" 
        onClick={() => onSearch(query)}
        className={buttonClassName || "bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 md:py-3 rounded-xl font-medium transition shadow-sm flex items-center justify-center"}
      >
        Search
      </button>
    </div>
  );
}
