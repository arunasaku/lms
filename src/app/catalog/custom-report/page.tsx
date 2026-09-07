'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Printer, Download, CheckSquare, Square, ArrowLeft, Filter } from 'lucide-react';

interface ColumnOption {
  key: string;
  label: string;
  defaultSelected: boolean;
}

const ALL_COLUMNS: ColumnOption[] = [
  { key: 'accNo', label: 'Accession No', defaultSelected: true },
  { key: 'title', label: 'Title 1', defaultSelected: true },
  { key: 'title2', label: 'Title 2 (Parallel / Subtitle)', defaultSelected: false },
  { key: 'author', label: 'Author 1', defaultSelected: true },
  { key: 'author2', label: 'Author 2', defaultSelected: false },
  { key: 'author3', label: 'Author 3', defaultSelected: false },
  { key: 'publisher', label: 'Publisher', defaultSelected: true },
  { key: 'pubPlace', label: 'Publication Place', defaultSelected: false },
  { key: 'year', label: 'Year', defaultSelected: true },
  { key: 'isbn', label: 'ISBN', defaultSelected: false },
  { key: 'ddc', label: 'DDC Class', defaultSelected: true },
  { key: 'pages', label: 'Pages / Physical', defaultSelected: false },
  { key: 'height', label: 'Size / Height', defaultSelected: false },
  { key: 'acquisitionType', label: 'Acquisition Source (Buy/Gift)', defaultSelected: false },
  { key: 'vendor', label: 'Vendor / Source', defaultSelected: false },
  { key: 'price', label: 'Price (Rs.)', defaultSelected: true },
  { key: 'billNo', label: 'Bill No', defaultSelected: false },
  { key: 'category', label: 'Category', defaultSelected: true },
  { key: 'shelfLoc', label: 'Shelf Location', defaultSelected: false },
  { key: 'itemType', label: 'Item Type', defaultSelected: false },
  { key: 'status', label: 'Status', defaultSelected: true },
  { key: 'dateAdded', label: 'Date Added', defaultSelected: false },
];

export default function CustomReportPage() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    ALL_COLUMNS.filter(c => c.defaultSelected).map(c => c.key)
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [acquisitionFilter, setAcquisitionFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [books, setBooks] = useState<any[]>([]);
  const [libraryName, setLibraryName] = useState<string>('Library');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/system-config')
      .then(res => res.json())
      .then(data => {
        if (data.libraryName) setLibraryName(data.libraryName);
      })
      .catch(console.error);

    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/custom-report');
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (e) {
      console.error('Failed to fetch books for report:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleColumn = (key: string) => {
    if (selectedKeys.includes(key)) {
      if (selectedKeys.length === 1) return;
      setSelectedKeys(selectedKeys.filter(k => k !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  const selectAllColumns = () => {
    setSelectedKeys(ALL_COLUMNS.map(c => c.key));
  };

  const resetColumns = () => {
    setSelectedKeys(ALL_COLUMNS.filter(c => c.defaultSelected).map(c => c.key));
  };

  const filteredBooks = books.filter(book => {
    if (categoryFilter && book.category !== categoryFilter) return false;
    if (statusFilter && book.status !== statusFilter) return false;
    if (acquisitionFilter && book.acquisitionType !== acquisitionFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchAcc = book.accNo?.toLowerCase().includes(q);
      const matchTitle = book.title?.toLowerCase().includes(q);
      const matchAuthor = book.author?.toLowerCase().includes(q);
      const matchPublisher = book.publisher?.toLowerCase().includes(q);
      if (!matchAcc && !matchTitle && !matchAuthor && !matchPublisher) return false;
    }
    return true;
  });

  const activeColumns = ALL_COLUMNS.filter(c => selectedKeys.includes(c.key));

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const headers = activeColumns.map(c => c.label);
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const s = String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    let csvStr = '\uFEFF' + headers.join(',') + '\n';
    filteredBooks.forEach(b => {
      const row = activeColumns.map(c => {
        let val = b[c.key];
        if (c.key === 'acquisitionType') {
          val = val === 'GIFT' ? 'Gift / Donation' : 'Purchased';
        }
        return escapeCsv(val);
      });
      csvStr += row.join(',') + '\n';
    });

    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${libraryName}_Catalog_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const uniqueCategories = Array.from(new Set(books.map(b => b.category).filter(Boolean))).sort();

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 print:p-0 print:max-w-none print:m-0">
      
      {/* --- NON-PRINTABLE CONTROLS --- */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <Link href="/catalog" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Back to Catalog
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Custom Catalog Report Generator</h1>
            <p className="text-sm text-slate-500 mt-1">Select columns, apply filters, and generate printable catalog reports.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              disabled={filteredBooks.length === 0}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={18} /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              disabled={filteredBooks.length === 0}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Printer size={18} /> Print Report
            </button>
          </div>
        </div>

        {/* Column Selectors */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare size={18} className="text-indigo-600" /> Select Columns to Display & Print
            </h3>
            <div className="flex gap-3 text-xs">
              <button onClick={selectAllColumns} className="text-indigo-600 hover:underline font-medium">Select All</button>
              <button onClick={resetColumns} className="text-slate-500 hover:underline">Reset Defaults</button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ALL_COLUMNS.map(col => {
              const isSelected = selectedKeys.includes(col.key);
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleColumn(col.key)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium text-left transition ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? <CheckSquare size={16} className="text-indigo-600 shrink-0" /> : <Square size={16} className="text-slate-400 shrink-0" />}
                  <span className="truncate">{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Filter size={18} className="text-indigo-600" /> Report Filters & Search
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Search Keywords</label>
              <input
                type="text"
                placeholder="Title, author, acc no..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Book Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BORROWED">BORROWED</option>
                <option value="LOST">LOST</option>
                <option value="DISCARDED">DISCARDED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Acquisition Source</label>
              <select
                value={acquisitionFilter}
                onChange={e => setAcquisitionFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Sources (Buy & Gift)</option>
                <option value="PURCHASED">Purchased (මිලදී ගත්)</option>
                <option value="GIFT">Gift / Donation (තෑගි / පරිත්‍යාග)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- REPORT PRINTABLE CONTAINER --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6 print:border-none print:shadow-none print:p-0">
        
        {/* Printable Header */}
        <div className="border-b border-slate-300 pb-4 mb-6 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-900">{libraryName}</h2>
          <h3 className="text-lg font-semibold text-slate-700 mt-1">Book Catalog Custom Report</h3>
          <div className="flex justify-between items-center text-xs text-slate-500 mt-3 px-2">
            <span>Generated Date: {new Date().toLocaleDateString()}</span>
            <span>Total Records: <strong className="text-slate-800">{filteredBooks.length}</strong></span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading catalog report data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs print:text-[10px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                  <th className="p-2 font-bold border-r border-slate-200 w-8">#</th>
                  {activeColumns.map(col => (
                    <th key={col.key} className="p-2 font-bold border-r border-slate-200">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBooks.map((book, idx) => (
                  <tr key={book.id || idx} className="hover:bg-slate-50">
                    <td className="p-2 text-slate-400 font-mono border-r border-slate-200">{idx + 1}</td>
                    {activeColumns.map(col => {
                      let val = book[col.key];
                      if (col.key === 'acquisitionType') {
                        val = val === 'GIFT' ? 'Gift' : 'Purchased';
                      }
                      if (col.key === 'price' && val) {
                        val = `Rs. ${val.toFixed(2)}`;
                      }
                      return (
                        <td key={col.key} className="p-2 text-slate-700 border-r border-slate-200">
                          {val || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {filteredBooks.length === 0 && (
                  <tr>
                    <td colSpan={activeColumns.length + 1} className="p-8 text-center text-slate-500">
                      No books found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
