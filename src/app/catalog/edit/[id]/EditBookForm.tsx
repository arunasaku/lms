"use client";

import { updateBook } from "../../actions";
import Link from "next/link";
import { useState } from "react";
import { Search, Wand2 } from "lucide-react";

export default function EditBookForm({ book }: { book: any }) {
  const [isbnSearch, setIsbnSearch] = useState(book.isbn || "");
  const [isbn, setIsbn] = useState(book.isbn || "");
  const [title, setTitle] = useState(book.title || "");
  const [title2, setTitle2] = useState(book.title2 || "");
  const [author, setAuthor] = useState(book.author || "");
  const [author2, setAuthor2] = useState(book.author2 || "");
  const [author3, setAuthor3] = useState(book.author3 || "");
  const [publisher, setPublisher] = useState(book.publisher || "");
  const [pubPlace, setPubPlace] = useState(book.pubPlace || "");
  const [year, setYear] = useState(book.year || "");
  const [ddc, setDdc] = useState(book.ddc || "");
  const [price, setPrice] = useState(book.price ? String(book.price) : "");
  const initialPages = book.pages || "";
  const initialParts = initialPages.includes(":") ? initialPages.split(":") : [initialPages, ""];
  const [pageCount, setPageCount] = useState(initialParts[0].trim());
  const [physicalDetails, setPhysicalDetails] = useState(initialParts.slice(1).join(":").trim());
  const pages = pageCount ? (physicalDetails ? `${pageCount} : ${physicalDetails}` : pageCount) : physicalDetails;
  const [height, setHeight] = useState(book.height || "");
  const [category, setCategory] = useState(book.category || "");
  const [acquisitionType, setAcquisitionType] = useState(book.acquisitionType || "PURCHASED");
  const [mainClass, setMainClass] = useState(book.mainClass || "");
  const [subdivision1, setSubdivision1] = useState(book.subdivision1 || "");
  const [subdivision2, setSubdivision2] = useState(book.subdivision2 || "");
  const [subdivision3, setSubdivision3] = useState(book.subdivision3 || "");
  const [subdivision4, setSubdivision4] = useState(book.subdivision4 || "");
  const [loading, setLoading] = useState(false);
  const [suggestingDdc, setSuggestingDdc] = useState(false);
  const [isCustomSub1, setIsCustomSub1] = useState(false);
  const [isCustomSub2, setIsCustomSub2] = useState(false);
  const [isCustomSub3, setIsCustomSub3] = useState(false);
  const [isCustomSub4, setIsCustomSub4] = useState(false);

  const subdivisionsMap: Record<string, string[]> = {
    "0": ["020 - පුස්තකාල විද්‍යාව", "060 - සාමාන්‍ය සංවිධාන", "070 - ප්‍රවෘත්ති මාධ්‍ය, පුවත්පත් කලාව, ප්‍රකාශනය", "080 - එකතු"],
    "1": ["120 - ඥාන විභාගය, හේතුඵලවාදය, මානව වර්ගයා", "140 - විශේෂ දාර්ශනික මත", "150 - මනෝ විද්‍යාව", "160 - තර්ක ශාස්ත්‍රය", "170 - ආචාර ධර්ම"],
    "2": ["230 - ක්‍රිස්තියානි ධර්මය", "290 - වෙනත් ආගම්"],
    "3": ["320 - දේශපාලන විද්‍යාව", "330 - ආර්ථික විද්‍යාව", "340 - නීතිය", "350 - පරිපාලනය", "360 - සමාජ ප්‍රශ්න, සමාජ සේවා සහ සංවිධාන", "370 - අධ්‍යාපන", "380 - වාණිජ්‍ය විද්‍යා, සන්නිවේදනය හා ප්‍රවාහන සේවා", "390 - සිරිත් විරිත්, ජනශ්‍රැති"],
    "4": ["420 - ඉංග්‍රීසි භාෂාව", "490 - වෙනත් භාෂා"],
    "5": ["510 - ගණිතය", "520 - තාරකා විද්‍යාව හා අනුබද්ධ විද්‍යා", "530 - භෞතික විද්‍යාව", "540 - රසායන විද්‍යාව", "550 - භූ විද්‍යාව", "560 - පාෂාණිධාතු විද්‍යාව", "570 - ජෛවීය විද්‍යාව", "580 - ශාක", "590 - සත්ත්වයෝ"],
    "6": ["610 - වෛද්‍ය විද්‍යා", "620 - ඉංජිනේරු විද්‍යා", "630 - කෘෂිකර්මය හා ඒ ආශ්‍රිත තාක්ෂණය", "640 - ගෘහ විද්‍යාව", "650 - කළමනාකරණ සේවා", "660 - රසායනික ඉංජිනේරු විද්‍යාව", "670 - නිෂ්පාදන", "680 - වෙනත් ශිල්පීය නිෂ්පාදන", "690 - ගොඩනැගිලි"],
    "7": ["720 - ගෘහ නිර්මාණ ශිල්පය", "730 - ප්‍රතිමා ශිල්පය සහ කැටයම් කලාව", "740 - ඇඳීම සහ සැරසිලි කලාව", "750 - සිතුවම් කලාව", "760 - ග්‍රැෆික් කලාව", "770 - ඡායාරූප ශිල්පය", "780 - සංගීතය", "790 - විනෝදය හා ක්‍රීඩා"],
    "8": ["820 - ඉංග්‍රීසි සාහිත්‍යය", "890 - වෙනත් භාෂා සාහිත්‍යය", "සිංහල කතා / සාහිත්‍යය"],
    "9": ["910 - භූගෝල විද්‍යා හා චාරිකා", "920 - චරිතාපදාන, වංශාවලි, නම්", "930 - පැරණි ඉතිහාසය", "940 - යුරෝපා ඉතිහාසය", "950 - ආසියාව"]
  };
  
  const currentMainClassPrefix = mainClass ? mainClass.charAt(0) : "";
  const availableSubdivisions = currentMainClassPrefix ? (subdivisionsMap[currentMainClassPrefix] || []) : [];
  
  const subdivisionOptions = [...availableSubdivisions];
  if (subdivision1 && !subdivisionOptions.includes(subdivision1)) {
    subdivisionOptions.unshift(subdivision1);
  }

  const subdivision2Map: Record<string, string[]> = {
    "290": ["294.3 - බුද්ධාගම", "294.5 - හින්දු ආගම"],
    "490": ["495.1 - චීන", "495.6 - ජපන්", "495.7 - කොරියන්"],
    "890": ["891.48 - සිංහල", "894.811 - දෙමළ"]
  };

  const subdivision3Map: Record<string, string[]> = {
    "891.48": ["891.481 - පද්‍ය", "891.482 - නාට්‍ය", "891.483 - ප්‍රබන්ධ", "891.484 - රචනා", "891.485 - කථා", "891.486 - ලිපි", "891.487 - හාස්‍ය හා උපහාසය"]
  };

  const subdivision4Map: Record<string, string[]> = {
    "891.483": ["891.48301 - කෙටිකතා", "891.483081 - ඓතිහාසික ප්‍රබන්ධ", "891.483083 - මනෝවිද්‍යාත්මක, යථාර්ථවාදී, සමාජ විද්‍යාත්මක ප්‍රබන්ධ", "891.483085 - ප්‍රේම කතා", "891.483087 - වික්‍රමාන්විත ප්‍රබන්ධ", "891.4830872 - රහස් පරීක්ෂක, අද්භූත ප්‍රබන්ධ", "891.48308729 - ගොතික් ප්‍රබන්ධ", "891.48308733 - අවතාර ප්‍රබන්ධ", "891.48308738 - ත්‍රාසජනක ප්‍රබන්ධ", "891.48308762 - විද්‍යා ප්‍රබන්ධ", "891.48308766 - ෆැන්ටසි ප්‍රබන්ධ"]
  };

  const currentSub1Prefix = subdivision1 ? subdivision1.substring(0, 3) : "";
  const availableSubdivisions2 = currentSub1Prefix ? (subdivision2Map[currentSub1Prefix] || []) : [];

  const subdivision2Options = [...availableSubdivisions2];
  if (subdivision2 && !subdivision2Options.includes(subdivision2)) {
    subdivision2Options.unshift(subdivision2);
  }

  const currentSub2Prefix = subdivision2 ? subdivision2.split(" ")[0] : "";
  const availableSubdivisions3 = currentSub2Prefix ? (subdivision3Map[currentSub2Prefix] || []) : [];
  
  const subdivision3Options = [...availableSubdivisions3];
  if (subdivision3 && !subdivision3Options.includes(subdivision3)) {
    subdivision3Options.unshift(subdivision3);
  }

  const currentSub3Prefix = subdivision3 ? subdivision3.split(" ")[0] : "";
  const availableSubdivisions4 = currentSub3Prefix ? (subdivision4Map[currentSub3Prefix] || []) : [];
  
  const subdivision4Options = [...availableSubdivisions4];
  if (subdivision4 && !subdivision4Options.includes(subdivision4)) {
    subdivision4Options.unshift(subdivision4);
  }

  const deriveMainClass = (ddcStr: string) => {
    if (!ddcStr) return "";
    const match = ddcStr.match(/\d{3}/);
    if (!match) return "";
    const num = parseInt(match[0], 10);
    if (num >= 0 && num < 100) return "000 - පරිගණක විද්යාව, තොරතුරු හා සාමාන්ය කෘති";
    if (num >= 100 && num < 200) return "100 - දර්ශනය";
    if (num >= 200 && num < 300) return "200 - ආගම්";
    if (num >= 300 && num < 400) return "300 - සමාජ ශාස්ත්ර";
    if (num >= 400 && num < 500) return "400 - භාෂාව";
    if (num >= 500 && num < 600) return "500 - ස්වභාවික විද්යා සහ ගණිතය";
    if (num >= 600 && num < 700) return "600 - තාක්ෂණ විද්යා";
    if (num >= 700 && num < 800) return "700 - කලා ශිල්ප";
    if (num >= 800 && num < 900) return "800 - සාහිත්ය";
    if (num >= 900 && num < 1000) return "900 - ඉතිහාසය සහ භූගෝල විද්යාව";
    return "";
  };

  const fetchIsbnInfo = async () => {
    if (!isbnSearch) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/fetch-isbn?isbn=${encodeURIComponent(isbnSearch)}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title || "");
        setAuthor(data.author || "");
        setPublisher(data.publisher || "");
        setPubPlace(data.pubPlace || "");
        setYear(data.year || "");
        setDdc(data.ddc || "");
        
        const derived = data.ddc ? deriveMainClass(data.ddc) : "";
        setMainClass(data.mainClass || derived || "");
        
        setSubdivision1(data.subdivision1 || "");
        setSubdivision2(data.subdivision2 || "");
        setSubdivision3(data.subdivision3 || "");
        setPrice(data.price || "");
        if (data.pages) {
          if (data.pages.includes(":")) {
            const parts = data.pages.split(":");
            setPageCount(parts[0].trim());
            setPhysicalDetails(parts.slice(1).join(":").trim());
          } else {
            setPageCount(data.pages);
            setPhysicalDetails("");
          }
        } else {
          setPageCount("");
          setPhysicalDetails("");
        }
        setHeight(data.height || "");
        setIsbn(data.isbn || isbnSearch);
        
        if (data.title && !data.ddc) {
          suggestDdc(data.title, data.author, data.publisher);
        }
      } else {
        alert("Book not found for this ISBN.");
      }
    } catch (e) {
      console.error(e);
      alert("Error fetching book info.");
    } finally {
      setLoading(false);
    }
  };

  const suggestDdc = async (t?: string, a?: string, p?: string) => {
    const targetTitle = t || title;
    if (!targetTitle) {
      alert("Please enter a title first to get a DDC suggestion.");
      return;
    }
    setSuggestingDdc(true);
    try {
      const res = await fetch("/api/ddc-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: targetTitle, author: a || author, publisher: p || publisher }),
      });
      const data = await res.json();
      if (data.ddc) {
        setDdc(data.ddc);
        const derived = deriveMainClass(data.ddc);
        if (derived) setMainClass(derived);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSuggestingDdc(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <form action={updateBook} className="p-8 space-y-6">
        <input type="hidden" name="id" value={book.id} />

        {/* ISBN Fetch Section */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2 w-full">
            <label htmlFor="isbnSearch" className="block text-sm font-medium text-indigo-900">ISBN / Book Name (Auto-fill)</label>
            <input 
              type="text" 
              id="isbnSearch" 
              value={isbnSearch}
              onChange={(e) => setIsbnSearch(e.target.value)}
              placeholder="Enter ISBN or Book Name to auto-fill..."
              className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <button 
            type="button" 
            onClick={fetchIsbnInfo}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition shadow-sm flex items-center gap-2 h-[46px]"
          >
            <Search size={18} />
            {loading ? "Fetching..." : "Fetch Info"}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="accNo" className="block text-sm font-medium text-slate-700">Accession Number *</label>
            <input 
              type="text" 
              id="accNo" 
              name="accNo" 
              required
              defaultValue={book.accNo}
              placeholder="e.g. 21697"
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="isbn" className="block text-sm font-medium text-slate-700">ISBN Number</label>
            <input 
              type="text" 
              id="isbn" 
              name="isbn" 
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="e.g. 9789556583359"
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="acquisitionType" className="block text-sm font-medium text-slate-700">Acquisition Source (Buy / Gift) *</label>
            <select 
              id="acquisitionType" 
              name="acquisitionType" 
              value={acquisitionType}
              onChange={(e) => setAcquisitionType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-medium text-slate-800"
            >
              <option value="PURCHASED">🛒 මිලදී ගත් පොතක් (Purchased)</option>
              <option value="GIFT">🎁 තෑගි / පරිත්‍යාගයක් (Gift / Donation)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title 1 *</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Main Book title..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="title2" className="block text-sm font-medium text-slate-700">Title 2 (Parallel / Sub Title)</label>
            <input 
              type="text" 
              id="title2" 
              name="title2" 
              value={title2}
              onChange={(e) => setTitle2(e.target.value)}
              placeholder="Secondary title or Subtitle..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="author" className="block text-sm font-medium text-slate-700">Author 1</label>
            <input 
              type="text" 
              id="author" 
              name="author" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Main Author name..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="author2" className="block text-sm font-medium text-slate-700">Author 2</label>
            <input 
              type="text" 
              id="author2" 
              name="author2" 
              value={author2}
              onChange={(e) => setAuthor2(e.target.value)}
              placeholder="Second Author name..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="author3" className="block text-sm font-medium text-slate-700">Author 3</label>
            <input 
              type="text" 
              id="author3" 
              name="author3" 
              value={author3}
              onChange={(e) => setAuthor3(e.target.value)}
              placeholder="Third Author name..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="publisher" className="block text-sm font-medium text-slate-700">Publisher</label>
            <input 
              type="text" 
              id="publisher" 
              name="publisher" 
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="Publisher name..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pubPlace" className="block text-sm font-medium text-slate-700">Publication Place</label>
            <input 
              type="text" 
              id="pubPlace" 
              name="pubPlace" 
              value={pubPlace}
              onChange={(e) => setPubPlace(e.target.value)}
              placeholder="e.g. Colombo, Kandy..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="year" className="block text-sm font-medium text-slate-700">Publication Year</label>
            <input 
              type="text" 
              id="year" 
              name="year" 
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2023"
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="pageCount" className="block text-sm font-medium text-slate-700">Pages</label>
            <input 
              type="text" 
              id="pageCount" 
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              placeholder="e.g. 138 p."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="physicalDetails" className="block text-sm font-medium text-slate-700">Physical Details</label>
            <div className="relative flex items-center">
              <input 
                type="text" 
                id="physicalDetails" 
                value={physicalDetails}
                onChange={(e) => setPhysicalDetails(e.target.value)}
                placeholder="e.g. ill., col. maps"
                className="w-full pl-4 pr-28 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
              />
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  const val = e.target.value;
                  if (!physicalDetails) {
                    setPhysicalDetails(val);
                  } else if (!physicalDetails.includes(val)) {
                    setPhysicalDetails(physicalDetails + `, ${val}`);
                  }
                  e.target.value = "";
                }}
                className="absolute right-2 px-2 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium cursor-pointer hover:bg-slate-200 focus:outline-none"
                title="Quick add physical details"
              >
                <option value="">+ Details</option>
                <option value="ill.">ill. (Illustrations)</option>
                <option value="col. ill.">col. ill. (Coloured Ill.)</option>
                <option value="pictures">pictures (Photos)</option>
                <option value="col. pic.">col. pic. (Coloured Photos)</option>
                <option value="charts">charts (Charts)</option>
                <option value="maps">maps (Maps)</option>
                <option value="tables">tables (Tables)</option>
                <option value="music">music (Music Notes)</option>
                <option value="port.">port. (Portraits)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="height" className="block text-sm font-medium text-slate-700">Book Height / Size</label>
            <input 
              type="text" 
              id="height" 
              name="height" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 18 cm"
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>
          <input type="hidden" name="pages" value={pages} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">Types of Materials</label>
            <select 
              id="category" 
              name="category" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            >
              <option value="">-- Select Material Type --</option>
              <option value="Books">Books</option>
              <option value="Magazine / Journal / Periodicals">Magazine / Journal / Periodicals</option>
              <option value="CD / DVD">CD / DVD</option>
              <option value="Maps">Maps</option>
              <option value="Pamphlet">Pamphlet</option>
              <option value="Paper Cuttings">Paper Cuttings</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="shelfLoc" className="block text-sm font-medium text-slate-700">Shelf Location</label>
            <input 
              type="text" 
              id="shelfLoc" 
              name="shelfLoc" 
              defaultValue={book.shelfLoc || ""}
              placeholder="e.g. A3, Row 2"
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="vendor" className="block text-sm font-medium text-slate-700">Vendor / Source</label>
            <input 
              type="text" 
              id="vendor" 
              name="vendor" 
              defaultValue={book.vendor || ""}
              placeholder="Where was it bought?"
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="billNo" className="block text-sm font-medium text-slate-700">Bill Number</label>
            <input 
              type="text" 
              id="billNo" 
              name="billNo" 
              defaultValue={book.billNo || ""}
              placeholder="Receipt / Bill No..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="itemType" className="block text-sm font-medium text-slate-700">Item Type</label>
            <select 
              id="itemType" 
              name="itemType" 
              defaultValue={book.itemType || "LENDING"}
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            >
              <option value="LENDING">Lending</option>
              <option value="CHILDREN">Children's Section</option>
              <option value="REFERENCE">Reference</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-medium text-slate-700">Price (Rs.)</label>
            <input 
              type="number" 
              id="price" 
              name="price" 
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="ddc" className="block text-sm font-medium text-slate-700">
              Dewey Decimal (DDC) {suggestingDdc && <span className="text-indigo-600 font-normal text-xs ml-2 animate-pulse">Auto-suggesting...</span>}
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                id="ddc" 
                name="ddc" 
                value={ddc}
                onChange={(e) => setDdc(e.target.value)}
                placeholder="e.g. 800"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <button 
                type="button" 
                onClick={() => suggestDdc()}
                disabled={suggestingDdc}
                className="px-3 py-2.5 bg-indigo-100 hover:bg-indigo-200 disabled:bg-slate-100 text-indigo-700 disabled:text-slate-400 rounded-lg font-medium transition shadow-sm flex items-center gap-1 border border-indigo-200 text-sm"
                title="Suggest DDC with AI"
              >
                <Wand2 size={16} />
                {suggestingDdc ? "Thinking..." : "Suggest"}
              </button>
            </div>
          </div>
        </div>

        {/* Collection Section */}
        <div className="border border-indigo-100 bg-indigo-50/40 p-5 rounded-xl space-y-4">
          <h3 className="text-base font-semibold text-indigo-950 flex items-center gap-2 border-b border-indigo-100 pb-2">
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded font-medium">Collection</span>
            Classification
          </h3>

          <div className="space-y-2">
            <label htmlFor="mainClass" className="block text-sm font-medium text-slate-700">Call Number *</label>
            <select 
              id="mainClass" 
              name="mainClass" 
              value={mainClass}
              onChange={(e) => setMainClass(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-slate-800"
            >
              <option value="">-- Select Call Number --</option>
              <option value="000 - Computer Science, Information & General Works">000 - Computer Science, Information & General Works</option>
              <option value="100 - Philosophy">100 - Philosophy</option>
              <option value="200 - Religion">200 - Religion</option>
              <option value="300 - Social Sciences">300 - Social Sciences</option>
              <option value="400 - Language">400 - Language</option>
              <option value="500 - Natural Sciences & Mathematics">500 - Natural Sciences & Mathematics</option>
              <option value="600 - Technology">600 - Technology</option>
              <option value="700 - Arts & Recreation">700 - Arts & Recreation</option>
              <option value="800 - Literature">800 - Literature</option>
              <option value="900 - History & Geography">900 - History & Geography</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Subdivision 1 */}
            <div className="space-y-2">
              <label htmlFor="subdivision1" className="block text-sm font-medium text-slate-700">Subdivision 1</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  id="subdivision1"
                  name="subdivision1"
                  list="subdivision1-list"
                  value={subdivision1}
                  onChange={(e) => setSubdivision1(e.target.value)}
                  placeholder="Select or type Subdivision 1..."
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800 shadow-sm"
                />
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setSubdivision1(e.target.value);
                    }
                  }}
                  className="absolute right-2.5 px-1 py-1 text-slate-400 hover:text-slate-600 bg-transparent cursor-pointer focus:outline-none"
                  title="Select Subdivision 1 from list"
                >
                  <option value="" disabled hidden>▼</option>
                  {subdivisionOptions.map((opt, idx) => (
                    <option key={idx} value={opt} className="text-slate-800 bg-white">{opt}</option>
                  ))}
                </select>
                <datalist id="subdivision1-list">
                  {subdivisionOptions.map((opt, idx) => (
                    <option key={idx} value={opt} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Subdivision 2 */}
            <div className="space-y-2">
              <label htmlFor="subdivision2" className="block text-sm font-medium text-slate-700">Subdivision 2</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  id="subdivision2"
                  name="subdivision2"
                  list="subdivision2-list"
                  value={subdivision2}
                  onChange={(e) => setSubdivision2(e.target.value)}
                  placeholder="Select or type Subdivision 2..."
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800 shadow-sm"
                />
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setSubdivision2(e.target.value);
                    }
                  }}
                  className="absolute right-2.5 px-1 py-1 text-slate-400 hover:text-slate-600 bg-transparent cursor-pointer focus:outline-none"
                  title="Select Subdivision 2 from list"
                >
                  <option value="" disabled hidden>▼</option>
                  {subdivision2Options.map((opt, idx) => (
                    <option key={idx} value={opt} className="text-slate-800 bg-white">{opt}</option>
                  ))}
                </select>
                <datalist id="subdivision2-list">
                  {subdivision2Options.map((opt, idx) => (
                    <option key={idx} value={opt} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Subdivision 3 */}
            <div className="space-y-2">
              <label htmlFor="subdivision3" className="block text-sm font-medium text-slate-700">Subdivision 3</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  id="subdivision3"
                  name="subdivision3"
                  list="subdivision3-list"
                  value={subdivision3}
                  onChange={(e) => setSubdivision3(e.target.value)}
                  placeholder="Select or type Subdivision 3..."
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800 shadow-sm"
                />
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setSubdivision3(e.target.value);
                    }
                  }}
                  className="absolute right-2.5 px-1 py-1 text-slate-400 hover:text-slate-600 bg-transparent cursor-pointer focus:outline-none"
                  title="Select Subdivision 3 from list"
                >
                  <option value="" disabled hidden>▼</option>
                  {subdivision3Options.map((opt, idx) => (
                    <option key={idx} value={opt} className="text-slate-800 bg-white">{opt}</option>
                  ))}
                </select>
                <datalist id="subdivision3-list">
                  {subdivision3Options.map((opt, idx) => (
                    <option key={idx} value={opt} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Subdivision 4 */}
            <div className="space-y-2">
              <label htmlFor="subdivision4" className="block text-sm font-medium text-slate-700">Subdivision 4</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  id="subdivision4"
                  name="subdivision4"
                  list="subdivision4-list"
                  value={subdivision4}
                  onChange={(e) => setSubdivision4(e.target.value)}
                  placeholder="Select or type Subdivision 4..."
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800 shadow-sm"
                />
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setSubdivision4(e.target.value);
                    }
                  }}
                  className="absolute right-2.5 px-1 py-1 text-slate-400 hover:text-slate-600 bg-transparent cursor-pointer focus:outline-none"
                  title="Select Subdivision 4 from list"
                >
                  <option value="" disabled hidden>▼</option>
                  {subdivision4Options.map((opt, idx) => (
                    <option key={idx} value={opt} className="text-slate-800 bg-white">{opt}</option>
                  ))}
                </select>
                <datalist id="subdivision4-list">
                  {subdivision4Options.map((opt, idx) => (
                    <option key={idx} value={opt} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Link href="/catalog" className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition shadow-sm">
            Cancel
          </Link>
          <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">
            Update Book
          </button>
        </div>
        
      </form>
    </div>
  );
}
