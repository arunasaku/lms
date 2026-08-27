"use client";

import { useState, useTransition } from "react";
import { addReview } from "../../actions";

export default function ReviewForm({ bookId }: { bookId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await addReview(bookId, rating, comment);
      if (res.success) {
        alert("Review saved!");
        setComment("");
        setRating(5);
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
        <div className="flex gap-2 cursor-pointer">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`w-8 h-8 focus:outline-none transition-transform hover:scale-110`}
            >
              <svg className={`w-full h-full ${star <= rating ? 'text-amber-400 fill-current' : 'text-slate-300'}`} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">Review (Optional)</label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Share your thoughts about this book..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition shadow-sm disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
