"use client";

export function OpenChatButton({ label = "Open Communications →" }: { label?: string }) {
  return (
    <button
      onClick={() => {
        window.dispatchEvent(new Event("open-admin-chat"));
      }}
      className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition shadow-sm cursor-pointer"
    >
      {label}
    </button>
  );
}
