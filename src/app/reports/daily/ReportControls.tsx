"use client"
import { useRouter } from 'next/navigation';

export default function ReportControls({ defaultDate }: { defaultDate: string }) {
  const router = useRouter();
  
  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
        <label htmlFor="report-date" className="text-sm font-medium text-slate-600">Date:</label>
        <input 
          id="report-date"
          type="date" 
          value={defaultDate}
          onChange={(e) => {
            if (e.target.value) {
              router.push(`/reports/daily?date=${e.target.value}`);
            }
          }}
          className="border-none outline-none text-sm font-semibold text-slate-800 bg-transparent"
        />
      </div>
      <button 
        onClick={() => window.print()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
        Print Report
      </button>
    </div>
  );
}
