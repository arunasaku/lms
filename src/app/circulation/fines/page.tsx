import { getUnpaidFines } from "../actions";
import Link from "next/link";
import PayFineButton from "./PayFineButton";

export const dynamic = 'force-dynamic';

export default async function UnpaidFinesPage() {
  const fines = await getUnpaidFines();
  const totalUnpaid = fines.reduce((sum, loan) => sum + loan.fine, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <Link href="/circulation" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition mb-2 inline-block">
          &larr; Back to Circulation
        </Link>
        <h2 className="text-3xl font-bold text-slate-800">Unpaid Fines</h2>
        <p className="text-slate-500">Manage and collect pending fines from members.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Pending Fines</h3>
          <div className="text-xl font-bold text-rose-600">
            Total Pending: Rs. {totalUnpaid.toFixed(2)}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {fines.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No unpaid fines found. All clear!
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 text-sm">
                  <th className="p-3 font-medium">Return Date</th>
                  <th className="p-3 font-medium">Member</th>
                  <th className="p-3 font-medium">Book</th>
                  <th className="p-3 font-medium text-right">Fine Amount</th>
                  <th className="p-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50">
                    <td className="p-3 text-sm text-slate-600">
                      {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{loan.user?.name}</div>
                      <div className="text-xs text-slate-500">{loan.user?.memberId}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-slate-800 line-clamp-1">{loan.book?.title}</div>
                      <div className="text-xs text-slate-500">{loan.book?.accNo}</div>
                    </td>
                    <td className="p-3 font-semibold text-rose-600 text-right">
                      Rs. {loan.fine.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      <PayFineButton loanId={loan.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
