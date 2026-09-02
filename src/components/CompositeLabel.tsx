import React from 'react';
import Barcode from 'react-barcode';

interface CompositeLabelProps {
  accessionNo: string;
  ddc?: string;
  author?: string;
  year?: string;
  category?: string;
  libraryName?: string;
}

export default function CompositeLabel({ 
  accessionNo, 
  ddc = '', 
  author = '', 
  year = '', 
  category = 'General Collection',
  libraryName = 'My Library'
}: CompositeLabelProps) {
  
  if (!accessionNo) return null;

  let ddcLine1 = ddc;
  let ddcLine2 = '';
  if (ddc.includes('.')) {
    const parts = ddc.split('.');
    ddcLine1 = parts[0] + '.';
    ddcLine2 = parts[1];
  }

  let authorMark = '';
  if (author) {
    authorMark = author.substring(0, 3).toUpperCase();
  }

  return (
    <div className="flex border border-gray-400 bg-white m-1" style={{ width: '70mm', height: '35mm' }}>
      <div className="flex flex-col justify-between w-2/3 border-r border-gray-300 p-1">
        <div className="text-[7px] text-center uppercase text-gray-700 font-medium border-b border-gray-200 pb-[1px] overflow-hidden text-ellipsis whitespace-nowrap">
          {category || 'General Collection'}
        </div>
        <div className="flex flex-col items-center justify-center flex-1 py-1">
          {ddcLine1 && <div className="text-[12px] font-bold leading-tight">{ddcLine1}</div>}
          {ddcLine2 && <div className="text-[12px] font-bold leading-tight">{ddcLine2}</div>}
          {authorMark && <div className="text-[11px] font-bold leading-tight mt-[1px]">{authorMark}</div>}
          {year && <div className="text-[10px] font-semibold leading-tight mt-[1px]">{year}</div>}
        </div>
        <div className="text-[6px] text-center uppercase text-gray-600 border-t border-gray-200 pt-[1px] overflow-hidden text-ellipsis whitespace-nowrap">
          {libraryName}
        </div>
      </div>
      <div className="w-1/3 flex items-center justify-center relative overflow-hidden">
        <div className="absolute flex items-center justify-center" style={{ transform: 'rotate(-90deg)' }}>
          <Barcode 
            value={accessionNo} 
            format="CODE128"
            width={1.2}
            height={30}
            fontSize={10}
            margin={0}
            displayValue={true}
          />
        </div>
      </div>
    </div>
  );
}
