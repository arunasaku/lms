"use client";

import { createBook } from "../actions";
import Link from "next/link";
import { useState } from "react";
import { Search, Wand2 } from "lucide-react";

export default function NewBookForm() {
  const [isbnSearch, setIsbnSearch] = useState("");
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [title2, setTitle2] = useState("");
  const [author, setAuthor] = useState("");
  const [author2, setAuthor2] = useState("");
  const [author3, setAuthor3] = useState("");
  const [publisher, setPublisher] = useState("");
  const [pubPlace, setPubPlace] = useState("");
  const [year, setYear] = useState("");
  const [ddc, setDdc] = useState("");
  const [price, setPrice] = useState("");
  const [pages, setPages] = useState("");
  const [height, setHeight] = useState("");
  const [category, setCategory] = useState("");
  const [acquisitionType, setAcquisitionType] = useState("PURCHASED");
  const [mainClass, setMainClass] = useState("");
  const [subdivision1, setSubdivision1] = useState("");
  const [subdivision2, setSubdivision2] = useState("");
  const [subdivision3, setSubdivision3] = useState("");
  const [subdivision4, setSubdivision4] = useState("");
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
  
  // Ensure the dynamically fetched subdivision is also included if it isn't in the map
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
        setPages(data.pages || "");
        setHeight(data.height || "");
        setIsbn(data.isbn || isbnSearch);
        
        // Auto suggest DDC if not provided by source
        if (data.title && !data.ddc) {
          suggestDdc(data.title, data.author, data.publisher);
        }
      } else {
        alert("Book not found for this ISBN in global databases or local stores.");
      }
    } catch (e) {
      console.error(e);
      alert("Error fetching book info.");
    } finally {
      setLoading(false);
    }
  };

  const suggestDdc = async (t: string, a?: string, p?: string) => {
    setSuggestingDdc(true);
    try {
      const res = await fetch("/api/ddc-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, author: a, publisher: p }),
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
      <form action={createBook} className="p-8 space-y-6">
        
        {/* ISBN Fetch Section */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2 w-full">
            <label htmlFor="isbnSearch" className="block text-sm font-medium text-indigo-900">ISBN / Book Name (Auto-fill)</label>
            <input 
              type="text" 
              id="isbnSearch" 
              value={isbnSearch}
              onChange={(e) => setIsbnSearch(e.target.value)}
              placeholder="Enter ISBN or Book Name..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition shadow-sm"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="accNo" className="block text-sm font-medium text-slate-700">Accession Number *</label>
            <input 
              type="text" 
              id="accNo" 
              name="accNo" 
              required 
              placeholder="e.g. 21697"
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
          <div className="space-y-2 md:col-span-1">
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

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <label htmlFor="pages" className="block text-sm font-medium text-slate-700">Pages / Physical Details</label>
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  const val = e.target.value;
                  if (!pages) {
                    setPages(val);
                  } else if (!pages.includes(val)) {
                    setPages(pages + (pages.includes(":") ? `, ${val}` : ` : ${val}`));
                  }
                  e.target.value = "";
                }}
                className="px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-xs font-medium cursor-pointer"
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
            <input 
              type="text" 
              id="pages" 
              name="pages" 
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="e.g. 138 p. : col. ill."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div className="space-y-2">
            <label htmlFor="itemType" className="block text-sm font-medium text-slate-700">Item Type</label>
            <select 
              id="itemType" 
              name="itemType" 
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            >
              <option value="LENDING">Lending</option>
              <option value="CHILDREN">Children's Section</option>
              <option value="REFERENCE">Reference</option>
            </select>
          </div>

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="shelfLoc" className="block text-sm font-medium text-slate-700">Shelf Location</label>
            <input 
              type="text" 
              id="shelfLoc" 
              name="shelfLoc" 
              placeholder="e.g. A3, Row 2"
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="vendor" className="block text-sm font-medium text-slate-700">Vendor / Source</label>
            <input 
              type="text" 
              id="vendor" 
              name="vendor" 
              placeholder="Where was it bought?"
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label htmlFor="billNo" className="block text-sm font-medium text-slate-700">Bill Number</label>
            <input 
              type="text" 
              id="billNo" 
              name="billNo" 
              placeholder="Receipt / Bill No..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="ddc" className="block text-sm font-medium text-slate-700">
              Dewey Decimal (DDC) {suggestingDdc && <span className="text-indigo-600 font-normal text-xs ml-2 animate-pulse">Auto-suggesting...</span>}
            </label>
            <input 
              type="text" 
              id="ddc" 
              name="ddc" 
              value={ddc}
              onChange={(e) => setDdc(e.target.value)}
              placeholder="e.g. 800"
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        {/* Collection Section */}
        <div className="border border-indigo-100 bg-indigo-50/40 p-5 rounded-xl space-y-4">
          <h3 className="text-base font-semibold text-indigo-950 flex items-center gap-2 border-b border-indigo-100 pb-2">
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded font-medium">Collection</span>
            එකතුව / ඛණ්ඩ වර්ගීකරණය (Classification)
          </h3>

          <div className="space-y-2">
            <label htmlFor="mainClass" className="block text-sm font-medium text-slate-700">Call Number (ප්‍රධාන පන්තිය) *</label>
            <select 
              id="mainClass" 
              name="mainClass" 
              value={mainClass}
              onChange={(e) => setMainClass(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium text-slate-800"
            >
              <option value="">-- Call Number එක තෝරන්න (Select Call Number) --</option>
              <option value="000 - පරිගණක විද්‍යාව, තොරතුරු හා සාමාන්‍ය කෘති">000 - පරිගණක විද්‍යාව, තොරතුරු හා සාමාන්‍ය කෘති</option>
              <option value="100 - දර්ශනය">100 - දර්ශනය</option>
              <option value="200 - ආගම්">200 - ආගම්</option>
              <option value="300 - සමාජ ශාස්ත්‍ර">300 - සමාජ ශාස්ත්‍ර</option>
              <option value="400 - භාෂාව">400 - භාෂාව</option>
              <option value="500 - ස්වභාවික විද්‍යා සහ ගණිතය">500 - ස්වභාවික විද්‍යා සහ ගණිතය</option>
              <option value="600 - තාක්ෂණ විද්‍යා">600 - තාක්ෂණ විද්‍යා</option>
              <option value="700 - කලා ශිල්ප">700 - කලා ශිල්ප</option>
              <option value="800 - සාහිත්‍ය">800 - සාහිත්‍ය</option>
              <option value="900 - ඉතිහාසය සහ භූගෝල විද්‍යාව">900 - ඉතිහාසය සහ භූගෝල විද්‍යාව</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Subdivision 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="subdivision1" className="block text-sm font-medium text-slate-700">Subdivision 1</label>
                <button
                  type="button"
                  onClick={() => setIsCustomSub1(!isCustomSub1)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline transition"
                >
                  {isCustomSub1 ? "📋 Select List" : "✏️ Custom Input"}
                </button>
              </div>
              {isCustomSub1 ? (
                <input
                  type="text"
                  id="subdivision1"
                  name="subdivision1"
                  value={subdivision1}
                  onChange={(e) => setSubdivision1(e.target.value)}
                  placeholder="Enter custom Subdivision 1..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800"
                />
              ) : (
                <select 
                  id="subdivision1" 
                  name="subdivision1" 
                  value={subdivision1}
                  onChange={(e) => {
                    if (e.target.value === "__CUSTOM__") {
                      setIsCustomSub1(true);
                      setSubdivision1("");
                    } else {
                      setSubdivision1(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800"
                >
                  <option value="">-- Select Subdivision --</option>
                  {subdivisionOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                  <option value="__CUSTOM__">-- ✏️ Custom (Enter Manually) --</option>
                </select>
              )}
            </div>

            {/* Subdivision 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="subdivision2" className="block text-sm font-medium text-slate-700">Subdivision 2</label>
                <button
                  type="button"
                  onClick={() => setIsCustomSub2(!isCustomSub2)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline transition"
                >
                  {isCustomSub2 ? "📋 Select List" : "✏️ Custom Input"}
                </button>
              </div>
              {isCustomSub2 ? (
                <input
                  type="text"
                  id="subdivision2"
                  name="subdivision2"
                  value={subdivision2}
                  onChange={(e) => setSubdivision2(e.target.value)}
                  placeholder="Enter custom Subdivision 2..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800"
                />
              ) : (
                <select 
                  id="subdivision2" 
                  name="subdivision2" 
                  value={subdivision2}
                  onChange={(e) => {
                    if (e.target.value === "__CUSTOM__") {
                      setIsCustomSub2(true);
                      setSubdivision2("");
                    } else {
                      setSubdivision2(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800"
                >
                  <option value="">-- Select Subdivision --</option>
                  {subdivision2Options.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                  <option value="__CUSTOM__">-- ✏️ Custom (Enter Manually) --</option>
                </select>
              )}
            </div>

            {/* Subdivision 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="subdivision3" className="block text-sm font-medium text-slate-700">Subdivision 3</label>
                <button
                  type="button"
                  onClick={() => setIsCustomSub3(!isCustomSub3)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline transition"
                >
                  {isCustomSub3 ? "📋 Select List" : "✏️ Custom Input"}
                </button>
              </div>
              {isCustomSub3 ? (
                <input
                  type="text"
                  id="subdivision3"
                  name="subdivision3"
                  value={subdivision3}
                  onChange={(e) => setSubdivision3(e.target.value)}
                  placeholder="Enter custom Subdivision 3..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800"
                />
              ) : (
                <select 
                  id="subdivision3" 
                  name="subdivision3" 
                  value={subdivision3}
                  onChange={(e) => {
                    if (e.target.value === "__CUSTOM__") {
                      setIsCustomSub3(true);
                      setSubdivision3("");
                    } else {
                      setSubdivision3(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800"
                >
                  <option value="">-- Select Subdivision --</option>
                  {subdivision3Options.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                  <option value="__CUSTOM__">-- ✏️ Custom (Enter Manually) --</option>
                </select>
              )}
            </div>

            {/* Subdivision 4 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="subdivision4" className="block text-sm font-medium text-slate-700">Subdivision 4</label>
                <button
                  type="button"
                  onClick={() => setIsCustomSub4(!isCustomSub4)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline transition"
                >
                  {isCustomSub4 ? "📋 Select List" : "✏️ Custom Input"}
                </button>
              </div>
              {isCustomSub4 ? (
                <input
                  type="text"
                  id="subdivision4"
                  name="subdivision4"
                  value={subdivision4}
                  onChange={(e) => setSubdivision4(e.target.value)}
                  placeholder="Enter custom Subdivision 4..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800"
                />
              ) : (
                <select 
                  id="subdivision4" 
                  name="subdivision4" 
                  value={subdivision4}
                  onChange={(e) => {
                    if (e.target.value === "__CUSTOM__") {
                      setIsCustomSub4(true);
                      setSubdivision4("");
                    } else {
                      setSubdivision4(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800"
                >
                  <option value="">-- Select Subdivision --</option>
                  {subdivision4Options.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                  <option value="__CUSTOM__">-- ✏️ Custom (Enter Manually) --</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Link href="/catalog" className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition shadow-sm">
            Cancel
          </Link>
          <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">
            Save Book
          </button>
        </div>
        
      </form>
    </div>
  );
}
