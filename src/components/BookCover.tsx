"use client";

import { useEffect, useState } from "react";

interface BookCoverProps {
  title: string;
  author?: string | null;
  isbn?: string | null;
}

export default function BookCover({ title, author, isbn }: BookCoverProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCover() {
      // Create a unique cache key for this book to avoid spamming the API
      const cacheKey = `book_cover_${isbn || title}`;
      
      // Check cache first
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setCoverUrl(cached !== "null" ? cached : null);
        setLoading(false);
        return;
      }

      try {
        let query = "";
        if (isbn && isbn.trim() !== "") {
          query = `isbn:${isbn}`;
        } else {
          query = `intitle:${encodeURIComponent(title)}`;
          if (author && author.trim() !== "") {
            query += `+inauthor:${encodeURIComponent(author)}`;
          }
        }
        
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
        const data = await res.json();
        
        if (data.items && data.items.length > 0 && data.items[0].volumeInfo.imageLinks) {
          let url = data.items[0].volumeInfo.imageLinks.thumbnail;
          // Ensure HTTPS
          if (url.startsWith("http:")) url = url.replace("http:", "https:");
          setCoverUrl(url);
          localStorage.setItem(cacheKey, url);
        } else {
          setCoverUrl(null);
          // Cache the miss so we don't retry on every page load
          localStorage.setItem(cacheKey, "null"); 
        }
      } catch (error) {
        console.error("Failed to fetch cover", error);
        setCoverUrl(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCover();
  }, [title, author, isbn]);

  if (loading) {
    return (
      <div className="w-12 h-16 bg-slate-200 animate-pulse rounded flex-shrink-0 flex items-center justify-center">
        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>
    );
  }

  if (!coverUrl) {
    return (
      <div className="w-12 h-16 bg-slate-100 border border-slate-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
         <span className="text-[10px] font-medium text-slate-400 text-center px-1 leading-tight break-words line-clamp-3">
           {title}
         </span>
      </div>
    );
  }

  return (
    <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 border border-slate-200 bg-white shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={coverUrl} alt={`Cover of ${title}`} className="w-full h-full object-cover" />
    </div>
  );
}
