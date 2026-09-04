"use client";

import { updateBook } from "../../actions";
import Link from "next/link";
import { useState } from "react";
import { Wand2 } from "lucide-react";

export default function EditBookForm({ book }: { book: any }) {
  const [title, setTitle] = useState(book.title || "");
  const [author, setAuthor] = useState(book.author || "");
  const [publisher, setPublisher] = useState(book.publisher || "");
  const [ddc, setDdc] = useState(book.ddc || "");
  const [suggestingDdc, setSuggestingDdc] = useState(false);

  const suggestDdc = async () => {
    if (!title) {
      alert("Please enter a title first to get a DDC suggestion.");
      return;
    }
    setSuggestingDdc(true);
    try {
      const res = await fetch("/api/ddc-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, publisher }),
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="isbn" className="block text-sm font-medium text-slate-700">ISBN Number</label>
            <input 
              type="text" 
              id="isbn" 
              name="isbn" 
              defaultValue={book.isbn || ""}
              placeholder="e.g. 9789556583359"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pages" className="block text-sm font-medium text-slate-700">Pages / Physical Details</label>
            <input 
              type="text" 
              id="pages" 
              name="pages" 
              defaultValue={book.pages || ""}
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
              defaultValue={book.height || ""}
              placeholder="e.g. 18 cm"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="year" className="block text-sm font-medium text-slate-700">Publication Year</label>
            <input 
              type="text" 
              id="year" 
              name="year" 
              defaultValue={book.year || ""}
              placeholder="e.g. 2023"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="ddc" className="block text-sm font-medium text-slate-700">Dewey Decimal (DDC)</label>
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
                onClick={suggestDdc}
                disabled={suggestingDdc}
                className="px-4 py-2.5 bg-indigo-100 hover:bg-indigo-200 disabled:bg-slate-100 text-indigo-700 disabled:text-slate-400 rounded-lg font-medium transition shadow-sm flex items-center gap-2 border border-indigo-200"
                title="Suggest DDC with AI"
              >
                <Wand2 size={18} />
                {suggestingDdc ? "Thinking..." : "Suggest"}
              </button>
            </div>
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
            <label htmlFor="price" className="block text-sm font-medium text-slate-700">Price (Rs.)</label>
            <input 
              type="number" 
              id="price" 
              name="price" 
              step="0.01"
              defaultValue={book.price || ""}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
            <select 
              id="status" 
              name="status" 
              defaultValue={book.status}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="BORROWED">BORROWED</option>
              <option value="LOST">LOST</option>
            </select>
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
