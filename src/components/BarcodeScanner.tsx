"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent multiple initializations
    if (scannerRef.current) return;

    try {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 100 },
          aspectRatio: 1.0,
          supportedScanTypes: [0] // Support camera scan only
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner.clear();
          onClose();
        },
        (errorMessage) => {
          // Ignore frequent error messages during scanning
        }
      );
    } catch (err: any) {
      setError(err.message || "Failed to initialize scanner");
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800">Scan Barcode</h3>
          <button 
            onClick={() => {
              if (scannerRef.current) {
                scannerRef.current.clear();
              }
              onClose();
            }}
            className="text-slate-500 hover:text-rose-600 font-bold text-xl px-2"
          >
            &times;
          </button>
        </div>
        <div className="p-4 relative">
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <div id="reader" className="w-full"></div>
        </div>
      </div>
    </div>
  );
}
