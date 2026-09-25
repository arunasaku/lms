"use client";

import { useState } from "react";
import { ShieldCheck, Banknote, UserCheck } from "lucide-react";

interface GuaranteeSectionProps {
  defaultGuarantorName?: string;
  defaultGuarantorPhone?: string;
  defaultGuarantorAddress?: string;
  defaultDepositAmount?: number | string | null;
  defaultDepositReceiptNo?: string;
}

export function GuaranteeSection({
  defaultGuarantorName = "",
  defaultGuarantorPhone = "",
  defaultGuarantorAddress = "",
  defaultDepositAmount = "",
  defaultDepositReceiptNo = "",
}: GuaranteeSectionProps) {
  // Determine initial guarantee mode
  const initialMode = defaultDepositAmount || defaultDepositReceiptNo
    ? "DEPOSIT"
    : defaultGuarantorName || defaultGuarantorPhone || defaultGuarantorAddress
    ? "GUARANTOR"
    : "GUARANTOR";

  const [mode, setMode] = useState<"GUARANTOR" | "DEPOSIT" | "NONE">(initialMode);
  const [guarantorName, setGuarantorName] = useState(defaultGuarantorName);
  const [guarantorPhone, setGuarantorPhone] = useState(defaultGuarantorPhone);
  const [guarantorAddress, setGuarantorAddress] = useState(defaultGuarantorAddress);
  const [depositAmount, setDepositAmount] = useState(
    defaultDepositAmount !== null && defaultDepositAmount !== undefined ? String(defaultDepositAmount) : ""
  );
  const [depositReceiptNo, setDepositReceiptNo] = useState(defaultDepositReceiptNo);

  return (
    <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200/80 space-y-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
        <h4 className="font-bold text-amber-950 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          Member Security & Guarantor (සාමාජික ඇපකර / තැන්පතු තොරතුරු)
        </h4>

        {/* Mode Selector Tabs */}
        <div className="inline-flex bg-amber-100/80 p-1 rounded-lg border border-amber-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("GUARANTOR")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              mode === "GUARANTOR"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-amber-800 hover:text-amber-950 hover:bg-amber-200/50"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Guarantor (ඇපකරු)
          </button>
          <button
            type="button"
            onClick={() => setMode("DEPOSIT")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              mode === "DEPOSIT"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-amber-800 hover:text-amber-950 hover:bg-amber-200/50"
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            Deposit (තැන්පතුව)
          </button>
          <button
            type="button"
            onClick={() => setMode("NONE")}
            className={`px-3 py-1.5 rounded-md transition ${
              mode === "NONE"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-amber-800 hover:text-amber-950 hover:bg-amber-200/50"
            }`}
          >
            None (නැත)
          </button>
        </div>
      </div>

      {/* Mode 1: Guarantor Form */}
      {mode === "GUARANTOR" && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-xs text-amber-800/80 font-medium">
            * ණයට පොත් ලබාදීම සඳහා ඇපකරුවෙකුගේ විස්තර ඇතුළත් කරන්න.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="guarantorName" className="block text-sm font-medium text-slate-700">
                Guarantor Name (ඇපකරුගේ නම)
              </label>
              <input
                type="text"
                id="guarantorName"
                name="guarantorName"
                value={guarantorName}
                onChange={(e) => setGuarantorName(e.target.value)}
                autoComplete="off"
                placeholder="Guarantor's full name..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-slate-800 font-medium shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="guarantorPhone" className="block text-sm font-medium text-slate-700">
                Guarantor Phone / WhatsApp No
              </label>
              <input
                type="text"
                id="guarantorPhone"
                name="guarantorPhone"
                value={guarantorPhone}
                onChange={(e) => setGuarantorPhone(e.target.value)}
                autoComplete="off"
                placeholder="e.g. 0771234567"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-slate-800 font-medium shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="guarantorAddress" className="block text-sm font-medium text-slate-700">
              Guarantor Address (ඇපකරුගේ ලිපිනය)
            </label>
            <input
              type="text"
              id="guarantorAddress"
              name="guarantorAddress"
              value={guarantorAddress}
              onChange={(e) => setGuarantorAddress(e.target.value)}
              autoComplete="off"
              placeholder="Guarantor's address..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-slate-800 font-medium shadow-sm"
            />
          </div>
          {/* Keep hidden deposit inputs so form submits clear values if mode switched */}
          <input type="hidden" name="depositAmount" value="" />
          <input type="hidden" name="depositReceiptNo" value="" />
        </div>
      )}

      {/* Mode 2: Security Deposit Form */}
      {mode === "DEPOSIT" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-amber-100/60 p-3 rounded-lg border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900 font-medium">
            <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
            <span>ඇපකරුවෙකු නොමැති විට තැන්පත් කළ මුදල සහ රිසිට්පත් අංකය ඇතුළත් කරන්න.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="depositAmount" className="block text-sm font-medium text-slate-700">
                Deposit Amount (තැන්පත් මුදල - Rs.) *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-500 font-semibold text-sm">Rs.</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="depositAmount"
                  name="depositAmount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="1500.00"
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-slate-900 font-bold shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="depositReceiptNo" className="block text-sm font-medium text-slate-700">
                Receipt Number (රිසිට් පත් අංකය) *
              </label>
              <input
                type="text"
                id="depositReceiptNo"
                name="depositReceiptNo"
                value={depositReceiptNo}
                onChange={(e) => setDepositReceiptNo(e.target.value)}
                autoComplete="off"
                placeholder="e.g. DEP-2026-0045"
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-slate-900 font-semibold shadow-sm"
              />
            </div>
          </div>

          {/* Keep hidden guarantor inputs so form submits clear values if mode switched */}
          <input type="hidden" name="guarantorName" value="" />
          <input type="hidden" name="guarantorPhone" value="" />
          <input type="hidden" name="guarantorAddress" value="" />
        </div>
      )}

      {/* Mode 3: None */}
      {mode === "NONE" && (
        <div className="p-3 text-center text-xs font-medium text-slate-500 italic bg-white/60 rounded-lg border border-slate-200">
          No guarantor or security deposit registered for this member.
          <input type="hidden" name="guarantorName" value="" />
          <input type="hidden" name="guarantorPhone" value="" />
          <input type="hidden" name="guarantorAddress" value="" />
          <input type="hidden" name="depositAmount" value="" />
          <input type="hidden" name="depositReceiptNo" value="" />
        </div>
      )}
    </div>
  );
}
