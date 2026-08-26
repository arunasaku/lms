'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BarcodeLabel from '@/components/BarcodeLabel';
import { Printer, Plus, Trash2 } from 'lucide-react';

export default function LabelCreatorPage() {
  const [accessionInputs, setAccessionInputs] = useState<string>('');
  const [labels, setLabels] = useState<{ id: string; accessionNo: string; title: string }[]>([]);

  const handleGenerate = async (type: 'books' | 'members') => {
    if (!accessionInputs.trim()) return;
    
    // Split by comma, space, or newline
    const newNumbers = accessionInputs
      .split(/[\n, ]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
      
    if (newNumbers.length === 0) return;

    try {
      const endpoint = type === 'books' ? '/api/books/by-accno' : '/api/members/by-id';
      const bodyParam = type === 'books' ? { accNos: newNumbers } : { memberIds: newNumbers };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyParam)
      });
      
      const fetchedItems = await response.json();

      const newLabels = newNumbers.map(num => {
        let title = '';
        if (type === 'books') {
          const book = fetchedItems.find((b: any) => b.accNo === num);
          title = book ? book.title : '';
        } else {
          const member = fetchedItems.find((m: any) => m.memberId === num);
          title = member ? member.name : '';
        }
        return {
          id: crypto.randomUUID(),
          accessionNo: num,
          title: title,
        };
      });

      setLabels(prev => [...prev, ...newLabels]);
      setAccessionInputs('');
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
      alert(`Failed to fetch ${type}. Please try again.`);
    }
  };

  const removeLabel = (id: string) => {
    setLabels(labels.filter(label => label.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen print:p-0 print:m-0 print:max-w-none">
      
      {/* --- NON-PRINTABLE AREA (Controls) --- */}
      <div className="print:hidden mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <Link href="/tools" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition mb-4 inline-block">
          &larr; Back to Tools
        </Link>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Barcode Label Creator</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter Book Accession Numbers or Member IDs (separated by commas, spaces, or new lines) to generate labels.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <textarea
            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y min-h-[100px]"
            placeholder="e.g. 1001, 1002, M001, M002"
            value={accessionInputs}
            onChange={(e) => setAccessionInputs(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => handleGenerate('books')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Plus size={18} />
            Book Barcodes
          </button>

          <button 
            onClick={() => handleGenerate('members')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Plus size={18} />
            Member Barcodes
          </button>
          
          <button 
            onClick={handlePrint}
            disabled={labels.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={18} />
            Print Labels
          </button>
          
          <button 
            onClick={() => setLabels([])}
            disabled={labels.length === 0}
            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md font-medium transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={18} />
            Clear All
          </button>
        </div>
      </div>

      {/* --- PRINTABLE AREA --- */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 print:bg-white print:border-none print:p-0">
        <h2 className="text-lg font-semibold mb-4 print:hidden text-gray-700">
          Preview ({labels.length} labels)
        </h2>
        
        {labels.length === 0 ? (
          <div className="text-center py-12 text-gray-400 print:hidden">
            No labels generated yet. Enter accession numbers above.
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 print:gap-1 print:justify-start">
            {labels.map((label) => (
              <div key={label.id} className="relative group">
                <BarcodeLabel accessionNo={label.accessionNo} bookTitle={label.title} />
                <button 
                  onClick={() => removeLabel(label.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                  title="Remove label"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global styles for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
          }
          /* Ensure the app header/sidebar are hidden when printing */
          nav, header, footer, aside {
            display: none !important;
          }
          @page {
            margin: 0; /* Important for exact label sizing */
          }
        }
      `}} />
    </div>
  );
}

