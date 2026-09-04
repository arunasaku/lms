"use client";

import { updateBook } from "../../actions";
import Link from "next/link";
import { useState } from "react";
import { Search, Wand2 } from "lucide-react";

export default function EditBookForm({ book }: { book: any }) {
  const [isbnSearch, setIsbnSearch] = useState(book.isbn || "");
  const [isbn, setIsbn] = useState(book.isbn || "");
  const [title, setTitle] = useState(book.title || "");
  const [author, setAuthor] = useState(book.author || "");
  const [publisher, setPublisher] = useState(book.publisher || "");
  const [year, setYear] = useState(book.year || "");
  const [ddc, setDdc] = useState(book.ddc || "");
  const [price, setPrice] = useState(book.price ? String(book.price) : "");
  const [pages, setPages] = useState(book.pages || "");
  const [height, setHeight] = useState(book.height || "");
  const [loading, setLoading] = useState(false);
  const [suggestingDdc, setSuggestingDdc] = useState(false);

  const fetchIsbnInfo = async () => {
    if (!isbnSearch) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/fetch-isbn?isbn=${encodeURIComponent(isbnSearch)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) setTitle(data.title);
        if (data.author) setAuthor(data.author);
        if (data.publisher) setPublisher(data.publisher);
        if (data.year) setYear(data.year);
        if (data.ddc) setDdc(data.ddc);
        if (data.price) setPrice(data.price);
        if (data.pages) setPages(data.pages);
        if (data.height) setHeight(data.height);
        if (data.isbn) setIsbn(data.isbn);
        else if (!/[a-zA-Z]{3,}/.test(isbnSearch)) setIsbn(isbnSearch);
        
        if (data.title && !data.ddc) {
          suggestDdc(data.title, data.author, data.publisher);
        }
      } else {
        alert("Book not found for this ISBN.");
      }
    } catch (e) {
      console.error(e);
      alert("Error fetching book info.");
    } finally {
      setLoading(false);
    }
  };

  const suggestDdc = async (t?: string, a?: string, p?: string) => {
    const targetTitle = t || title;
    if (!targetTitle) {
      alert("Please enter a title first to get a DDC suggestion.");
      return;
    }
    setSuggestingDdc(true);
    try {
      const res = await fetch("/api/ddc-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: targetTitle, author: a || author, publisher: p || publisher }),
      });
      const data = await res.json();
      if (data.ddc) {
        setDdc(data.ddc);
      } else {
        alert(data.error || "Could not generate DDC.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating DDC.");
    } finally {
      setSuggestingDdc(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <form action={updateBook} className="p-8 space-y-6">
        <input type="hidden" name="id" value={book.id} />

        {/* ISBN Fetch Section */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2 w-full">
            <label htmlFor="isbnSearch" className="block text-sm font-medium text-indigo-900">ISBN / Book Name (Auto-fill)</label>
            <input 
              type="text" 
              id="isbnSearch" 
              value={isbnSearch}
              onChange={(e) => setIsbnSearch(e.target.value)}
              placeholder="Enter ISBN or Book Name to auto-fill..."
              className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <button 
            type="button" 
            onClick={fetchIsbnInfo}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition shadow-sm flex items-center gap-2 h-[46px]"
          >
            <Search size={18} />
            {loading ? "Fetching..." : "Fetch Info"}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="accNo" className="block text-sm font-medium text-slate-700">Accession Number *</label>
            <input 
              type="text" 
              id="accNo" 
              name="accNo" 
              required
              defaultValue={book.accNo}
              placeholder="e.g. 21697"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="isbn" className="block text-sm font-medium text-slate-700">ISBN Number</label>
            <input 
              type="text" 
              id="isbn" 
              name="isbn" 
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="e.g. 9789556583359"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title *</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Book title..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="author" className="block text-sm font-medium text-slate-700">Author</label>
            <input 
              type="text" 
              id="author" 
              name="author" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="publisher" className="block text-sm font-medium text-slate-700">Publisher</label>
            <input 
              type="text" 
              id="publisher" 
              name="publisher" 
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="Publisher..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="year" className="block text-sm font-medium text-slate-700">Publication Year</label>
            <input 
              type="text" 
              id="year" 
              name="year" 
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2023"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="pages" className="block text-sm font-medium text-slate-700">Pages / Physical Details</label>
            <input 
              type="text" 
              id="pages" 
              name="pages" 
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="e.g. 138 p."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="height" className="block text-sm font-medium text-slate-700">Book Height / Size</label>
            <input 
              type="text" 
              id="height" 
              name="height" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 18 cm"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium text-slate-700">Price (Rs.)</label>
            <input 
              type="number" 
              id="price" 
              name="price" 
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category / Genre</label>
            <input 
              type="text" 
              id="category" 
              name="category" 
              defaultValue={book.category || ""}
              placeholder="e.g. Fiction, Science, Kids"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="shelfLoc" className="block text-sm font-medium text-slate-700">Shelf Location</label>
            <input 
              type="text" 
              id="shelfLoc" 
              name="shelfLoc" 
              defaultValue={book.shelfLoc || ""}
              placeholder="e.g. A3, Row 2"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="vendor" className="block text-sm font-medium text-slate-700">Vendor / Source</label>
            <input 
              type="text" 
              id="vendor" 
              name="vendor" 
              defaultValue={book.vendor || ""}
              placeholder="Where was it bought?"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="billNo" className="block text-sm font-medium text-slate-700">Bill Number</label>
            <input 
              type="text" 
              id="billNo" 
              name="billNo" 
              defaultValue={book.billNo || ""}
              placeholder="Receipt / Bill No..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="itemType" className="block text-sm font-medium text-slate-700">Item Type</label>
            <select 
              id="itemType" 
              name="itemType" 
              defaultValue={book.itemType || "LENDING"}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="LENDING">Lending</option>
              <option value="REFERENCE">Reference</option>
              <option value="MAGAZINE">Magazine / Journal</option>
              <option value="MEDIA">Media / CD / DVD</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
            <select 
              id="status" 
              name="status" 
              defaultValue={book.status || "AVAILABLE"}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="BORROWED">BORROWED</option>
              <option value="LOST">LOST</option>
              <option value="DISCARDED">DISCARDED</option>
              <option value="REPAIR">REPAIR</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="ddc" className="block text-sm font-medium text-slate-700">
              Dewey Decimal (DDC) {suggestingDdc && <span className="text-indigo-600 font-normal text-xs ml-2 animate-pulse">Auto-suggesting...</span>}
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                id="ddc" 
                name="ddc" 
                value={ddc}
                onChange={(e) => setDdc(e.target.value)}
                placeholder="e.g. 800"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <button 
                type="button" 
                onClick={() => suggestDdc()}
                disabled={suggestingDdc}
                className="px-3 py-2.5 bg-indigo-100 hover:bg-indigo-200 disabled:bg-slate-100 text-indigo-700 disabled:text-slate-400 rounded-lg font-medium transition shadow-sm flex items-center gap-1 border border-indigo-200 text-sm"
                title="Suggest DDC with AI"
              >
                <Wand2 size={16} />
                {suggestingDdc ? "Thinking..." : "Suggest"}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Link href="/catalog" className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition shadow-sm">
            Cancel
          </Link>
          <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">
            Update Book
          </button>
        </div>
        
      </form>
    </div>
  );
}
