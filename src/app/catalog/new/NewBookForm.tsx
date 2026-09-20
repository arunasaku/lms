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
  const [loading, setLoading] = useState(false);
  const [suggestingDdc, setSuggestingDdc] = useState(false);

  const subdivisionsMap: Record<string, string[]> = {
    "0": ["020 - පුස්තකාල විද්යාව", "060 - සාමාන්ය සංවිධාන", "070 - ප්රවෘත්ති මාධ්ය, පුවත්පත් කලාව, ප්රකාශනය", "080 - එකතු"],
    "1": ["120 - ඥාන විභාගය, හේතුඵලවාදය, මාව වර්ගයා", "140 - විශේෂ දාර්ශනික මත", "150 - මනෝ විද්යාව", "160 - තර්ක ශාස්ත්රය", "170 - ආචාර ධර්ම"],
    "2": ["230 - ක්රිස්තියානි ධර්මය", "290 - වෙනත් ආගම්"],
    "3": ["320 - දේශපාලන විද්යාව", "330 - ආර්ථික විද්යාව", "340 - නීතිය", "350 - පරිපාලනය", "360 - සමාජ ප්රශ්න, සමාජ සේවා සහ සංවිධාන", "370 - අධ්යාපන", "380 - වාණිජ්ය විද්යා, සන්නිවේදනය හා ප්රවාහන සේවා", "390 - සිරිත් විරිත්, ජනශ්රැති"],
    "4": ["420 - ඉංග්රීසි භාෂාව", "490 - වෙනත් භාෂා"],
    "5": ["510 ගණිතය", "520 - තාරකා විද්යාව හා අනුබද්ධ විද්යා", "530 - භෞතික විද්යාව", "540 - රසායන විද්යාව", "550 - භූ විද්යාව", "560 - පාෂාණිධාතු විද්යාව", "570 - ජෛවීය විද්යාව", "580 - ශාක", "590 - සත්ත්වයෝ"],
    "6": ["610 - වෛද්ය විද්යා", "620 - ඉංජිනේරු විද්යා", "630 - කෘෂිකර්මය හා ඒ ආශ්රිත තාක්ෂණය", "640 - ගෘහ විද්යාව", "650 - කළමනාකරණ සේවා", "660 - රසායණික ඉංජිනේරු විද්යාව", "670 - නිශ්පාදන", "680 - වෙනත් ශිල්පීය නිශ්පාදන", "690 - ගොඩනැගිලි"],
    "7": ["720 - ගෘහ නීර්මාණ ශිල්පය", "730 - ප්රතිමා ශිල්පය සහ කැටයම් කලාව", "740 - ඇඳීම සහ සැරසිලි කලාව", "750 - සිතුවම් කලාව", "760 - ග්රැෆික් කලාව", "770 - ඡායාරූප ශිල්පය", "780 - සංගීතය", "790 - විනෝදය හා ක්රීඩා"],
    "8": ["820 - ඉංග්රීසි සාහිත්යය", "890 - වෙනත් භාෂා සාහිත්යය", "සිංහල කතා / සාහිත්‍යය"],
    "9": ["910 - භූගෝල විද්ය හා චාරිකා", "920 - චරිතාපදාන, වංශාවලි, නම්", "930 - පැරණි ඉතිහාසය", "940 - යුරෝපා ඉතිහාසය", "950 - ආසියාව"]
  };
  
  const currentMainClassPrefix = mainClass ? mainClass.charAt(0) : "";
  const availableSubdivisions = currentMainClassPrefix ? (subdivisionsMap[currentMainClassPrefix] || []) : [];
  
  // Ensure the dynamically fetched subdivision is also included if it isn't in the map
  const subdivisionOptions = [...availableSubdivisions];
  if (subdivision1 && !subdivisionOptions.includes(subdivision1)) {
    subdivisionOptions.unshift(subdivision1);
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
            <label htmlFor="pages" className="block text-sm font-medium text-slate-700">Pages / Physical Details</label>
            <input 
              type="text" 
              id="pages" 
              name="pages" 
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="e.g. 138 p."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="itemType" className="block text-sm font-medium text-slate-700">Item Type</label>
            <select 
              id="itemType" 
              name="itemType" 
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            >
              <option value="LENDING">Lending</option>
              <option value="REFERENCE">Reference</option>
              <option value="MAGAZINE">Magazine / Journal</option>
              <option value="MEDIA">Media / CD / DVD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category / Genre</label>
            <input 
              type="text" 
              id="category" 
              name="category" 
              list="category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Select or type category (e.g. Fiction, Science)..."
              className="w-full px-4 py-2.5 bg-white text-slate-900 font-semibold placeholder:text-slate-400 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
            <datalist id="category-list">
              <option value="General Collection" />
              <option value="Novels / Fiction" />
              <option value="Short Stories" />
              <option value="Children's Collection" />
              <option value="Translations" />
              <option value="Science & Technology" />
              <option value="History & Biography" />
              <option value="Religion & Philosophy" />
              <option value="Language & Literature" />
              <option value="Arts & Culture" />
              <option value="Social Sciences" />
              <option value="Reference Collection" />
              <option value="Magazines & Periodicals" />
            </datalist>
          </div>

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <option value="000 - පරිගණක විද්යාව, තොරතුරු හා සාමාන්ය කෘති">000 - පරිගණක විද්යාව, තොරතුරු හා සාමාන්ය කෘති</option>
              <option value="100 - දර්ශනය">100 - දර්ශනය</option>
              <option value="200 - ආගම්">200 - ආගම්</option>
              <option value="300 - සමාජ ශාස්ත්ර">300 - සමාජ ශාස්ත්ර</option>
              <option value="400 - භාෂාව">400 - භාෂාව</option>
              <option value="500 - ස්වභාවික විද්යා සහ ගණිතය">500 - ස්වභාවික විද්යා සහ ගණිතය</option>
              <option value="600 - තාක්ෂණ විද්යා">600 - තාක්ෂණ විද්යා</option>
              <option value="700 - කලා ශිල්ප">700 - කලා ශිල්ප</option>
              <option value="800 - සාහිත්ය">800 - සාහිත්ය</option>
              <option value="900 - ඉතිහාසය සහ භූගෝල විද්යාව">900 - ඉතිහාසය සහ භූගෝල විද්යාව</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <label htmlFor="subdivision1" className="block text-sm font-medium text-slate-700">Subdivision 1 (අනු කොටස 1)</label>
              <select 
                id="subdivision1" 
                name="subdivision1" 
                value={subdivision1}
                onChange={(e) => setSubdivision1(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-slate-800"
              >
                <option value="">-- අනු කොටස තෝරන්න --</option>
                {subdivisionOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="subdivision2" className="block text-sm font-medium text-slate-700">Subdivision 2 (අනු කොටස 2)</label>
              <input 
                type="text" 
                id="subdivision2" 
                name="subdivision2" 
                value={subdivision2}
                onChange={(e) => setSubdivision2(e.target.value)}
                placeholder="Subdivision 2 enter..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subdivision3" className="block text-sm font-medium text-slate-700">Subdivision 3 (අනු කොටස 3)</label>
              <input 
                type="text" 
                id="subdivision3" 
                name="subdivision3" 
                value={subdivision3}
                onChange={(e) => setSubdivision3(e.target.value)}
                placeholder="Subdivision 3 enter..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
              />
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
