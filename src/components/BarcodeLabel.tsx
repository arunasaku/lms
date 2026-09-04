import React from 'react';
import dynamic from 'next/dynamic';

const Barcode = dynamic(() => import('react-barcode'), { ssr: false });

interface BarcodeLabelProps {
  accessionNo: string;
  bookTitle?: string;
}

export default function BarcodeLabel({ accessionNo, bookTitle }: BarcodeLabelProps) {
  if (!accessionNo) return null;

  return (
    <div className="flex flex-col items-center justify-center p-1 border border-gray-300 bg-white" style={{ width: '50mm', height: '35mm' }}>
      {bookTitle && (
        <div className="text-[10px] text-center font-bold uppercase overflow-hidden text-ellipsis whitespace-nowrap w-full mb-1">
          {bookTitle}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center">
        <Barcode 
          value={accessionNo} 
          format="CODE128"
          width={1.2}
          height={40}
          fontSize={11}
          margin={0}
          displayValue={true}
        />
      </div>
    </div>
  );
}
