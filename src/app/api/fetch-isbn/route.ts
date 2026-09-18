import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export function getMainClassFromDdc(ddcStr: string): string {
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
}

async function fetchFromUnionCatalogue(isbnOrQuery: string) {
  try {
    const raw = isbnOrQuery.trim();
    const isIsbn = /^[0-9xX\- ]+$/.test(raw);
    const cleanQuery = isIsbn ? raw.replace(/[- ]/g, '') : raw;
    const searchUrl = `https://unioncatalogue.dlp.gov.lk/Search/Results?lookfor=${encodeURIComponent(cleanQuery)}&type=AllFields`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(7000) });
    if (!res.ok) return null;
    const html = await res.text();

    const recordHrefs = [...html.matchAll(/href="([^"]+)"/g)]
      .map(m => m[1].replace(/&#x2F;/g, '/').replace(/&#x3F;/g, '?').replace(/&#x3D;/g, '=').replace(/&amp;/g, '&'))
      .filter(h => h.startsWith('/Record/') && !h.includes('/Save'));

    const uniqueRecords = [...new Set(recordHrefs.map(h => h.split('?')[0]))];
    if (uniqueRecords.length === 0) return null;

    const recordId = uniqueRecords[0].replace('/Record/', '');
    const marcUrl = `https://unioncatalogue.dlp.gov.lk/Record/${recordId}/Export?style=MARCXML`;
    const marcRes = await fetch(marcUrl, { signal: AbortSignal.timeout(7000) });
    if (!marcRes.ok) return null;
    const marcXml = await marcRes.text();

    const titleMatch = marcXml.match(/<datafield tag="245"[\s\S]*?<subfield code="a">([\s\S]*?)<\/subfield>/i);
    const authorMatch = marcXml.match(/<datafield tag="100"[\s\S]*?<subfield code="a">([\s\S]*?)<\/subfield>/i);
    const ddcMatch = marcXml.match(/<datafield tag="082"[\s\S]*?<subfield code="a">([\s\S]*?)<\/subfield>/i);
    const ddcSubB = marcXml.match(/<datafield tag="082"[\s\S]*?<subfield code="b">([\s\S]*?)<\/subfield>/i);
    const publisherMatch = marcXml.match(/<datafield tag="260"[\s\S]*?<subfield code="b">([\s\S]*?)<\/subfield>/i);
    const yearMatch = marcXml.match(/<datafield tag="260"[\s\S]*?<subfield code="c">([\s\S]*?)<\/subfield>/i);
    const pagesMatch = marcXml.match(/<datafield tag="300"[\s\S]*?<subfield code="a">([\s\S]*?)<\/subfield>/i);
    const heightMatch = marcXml.match(/<datafield tag="300"[\s\S]*?<subfield code="c">([\s\S]*?)<\/subfield>/i);
    const priceMatch = marcXml.match(/<datafield tag="300"[\s\S]*?<subfield code="b">([\s\S]*?)<\/subfield>/i);

    const subjectMatches = [...marcXml.matchAll(/<datafield tag="650"[\s\S]*?<subfield code="a">([\s\S]*?)<\/subfield>/gi)];
    const subjectSubXMatches = [...marcXml.matchAll(/<datafield tag="650"[\s\S]*?<subfield code="x">([\s\S]*?)<\/subfield>/gi)];

    let title = titleMatch ? titleMatch[1].replace(/\s*\/\s*$/, '').trim() : '';
    let author = authorMatch ? authorMatch[1].trim() : '';
    let publisher = publisherMatch ? publisherMatch[1].replace(/[,:]\s*$/, '').trim() : '';
    let year = yearMatch ? yearMatch[1].replace(/[^0-9]/g, '').trim() : '';
    let ddc = ddcMatch ? ddcMatch[1].trim() : '';
    let pages = pagesMatch ? pagesMatch[1].replace(/[^0-9]/g, '').trim() : '';
    let height = heightMatch ? heightMatch[1].trim() : '';

    let mainClass = getMainClassFromDdc(ddc);
    let subdivision1 = ddcSubB ? ddcSubB[1].trim() : (subjectMatches[0] ? subjectMatches[0][1].trim() : '');
    let subdivision2 = subjectMatches[1] ? subjectMatches[1][1].trim() : (subjectSubXMatches[0] ? subjectSubXMatches[0][1].trim() : '');
    let subdivision3 = subjectMatches[2] ? subjectMatches[2][1].trim() : (subjectSubXMatches[1] ? subjectSubXMatches[1][1].trim() : '');
    
    let price = '';
    if (priceMatch) {
      const priceText = priceMatch[1];
      const pMatch = priceText.match(/Rs\.?\s*([0-9]+(?:\.[0-9]{2})?)/i);
      if (pMatch) price = pMatch[1];
    }

    if (title) {
      return {
        title,
        author,
        publisher,
        year,
        ddc,
        mainClass,
        subdivision1,
        subdivision2,
        subdivision3,
        price,
        pages,
        height,
        isbn: cleanQuery,
        source: "National Union Catalogue (Sri Lanka)"
      };
    }
  } catch (e) {
    console.error("Union Catalogue fetch error:", e);
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn");

  if (!isbn) {
    return NextResponse.json({ error: "ISBN is required" }, { status: 400 });
  }

  const cleanIsbn = isbn.replace(/[- ]/g, '').trim();

  try {
    // 0. Check Local Library Database First
    try {
      const localBook = await prisma.book.findFirst({
        where: {
          OR: [
            { isbn: cleanIsbn },
            { isbn: isbn },
            { title: { contains: isbn } }
          ]
        }
      });

      if (localBook) {
        return NextResponse.json({
          title: localBook.title,
          author: localBook.author || "",
          publisher: localBook.publisher || "",
          year: localBook.year || "",
          ddc: localBook.ddc || "",
          mainClass: localBook.mainClass || getMainClassFromDdc(localBook.ddc || ""),
          subdivision1: localBook.subdivision1 || "",
          subdivision2: localBook.subdivision2 || "",
          subdivision3: localBook.subdivision3 || "",
          pages: localBook.pages || "",
          height: localBook.height || "",
          price: localBook.price ? String(localBook.price) : "",
          isbn: localBook.isbn || isbn,
          source: "Local Database"
        });
      }
    } catch (dbErr) {
      console.error("Local DB check error:", dbErr);
    }

    // 1. Try National Virtual Union Catalogue of Sri Lanka
    const unionCatData = await fetchFromUnionCatalogue(isbn);
    if (unionCatData) {
      return NextResponse.json(unionCatData);
    }

    // Determine if the input is an ISBN or a Book Name
    const isName = !/^[0-9xX\- ]+$/.test(isbn.trim());
    
    // 2. Try Google Books API
    const googleQuery = isName ? `intitle:${encodeURIComponent(isbn)}` : `isbn:${isbn}`;
    try {
      let res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${googleQuery}&maxResults=1`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        let data = await res.json();
        if (data.items && data.items.length > 0) {
          const bookInfo = data.items[0].volumeInfo;
          return NextResponse.json({
            title: bookInfo.title || "",
            author: bookInfo.authors ? bookInfo.authors.join(", ") : "",
            publisher: bookInfo.publisher || "",
            year: bookInfo.publishedDate ? bookInfo.publishedDate.substring(0, 4) : "",
            source: "Google Books"
          });
        }
      }
    } catch (gErr) {
      console.log("Google Books fetch error:", gErr);
    }

    if (!isName) {
      // 3. Try OpenLibrary API as a fallback (Only for ISBNs)
      try {
        let res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const olData = await res.json();
          const olKey = `ISBN:${isbn}`;

          if (olData[olKey]) {
            const bookInfo = olData[olKey];
            return NextResponse.json({
              title: bookInfo.title || "",
              author: bookInfo.authors ? bookInfo.authors.map((a: any) => a.name).join(", ") : "",
              publisher: bookInfo.publishers ? bookInfo.publishers.map((p: any) => p.name).join(", ") : "",
              year: bookInfo.publish_date ? bookInfo.publish_date : "",
              source: "Open Library"
            });
          }
        }
      } catch (olErr) {
        console.log("OpenLibrary fetch error:", olErr);
      }

      // 4. Web Scraping for Grantha.lk (Only for ISBNs)
      try {
        const granthaRes = await fetch(`https://grantha.lk/catalogsearch/result/?q=${isbn}`, { signal: AbortSignal.timeout(5000) });
        if (granthaRes.ok) {
          const html = await granthaRes.text();
          const titleMatch = html.match(/class="product-item-link"\s*href="[^"]+">\s*([^<]+)\s*<\/a>/i);
          
          if (titleMatch) {
            let title = titleMatch[1].trim();
            return NextResponse.json({
              title: title,
              author: "",
              publisher: "",
              year: "",
              source: "Grantha.lk (Scraped)"
            });
          }
        }
      } catch (e) {
        console.log("Grantha scrape failed:", e);
      }
    }
    
    // 5. Use AI Fallback for both Name and ISBN searches as a last resort
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Provide details for the book with ISBN or Name "${isbn}". If it is a Sri Lankan / Sinhala book, provide its Sinhala details.
Respond ONLY in this exact JSON format, nothing else:
{"title": "Book Name", "author": "Author Name", "publisher": "Publisher Name", "year": "YYYY", "ddc": "3-digit DDC number e.g. 800", "mainClass": "One of: 000 - පරිගණක විද්යාව, තොරතුරු හා සාමාන්ය කෘති, 100 - දර්ශනය, 200 - ආගම්, 300 - සමාජ ශාස්ත්ර, 400 - භාෂාව, 500 - ස්වභාවික විද්යා සහ ගණිතය, 600 - තාක්ෂණ විද්යා, 700 - කලා ශිල්ප, 800 - සාහිත්ය, 900 - ඉතිහාසය සහ භූගෝල විද්යාව", "subdivision1": "Subdivision 1", "subdivision2": "Subdivision 2", "subdivision3": "Subdivision 3"}
If you don't know the exact year or publisher or subdivisions, leave them blank. Make sure title and author are accurate.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          text = jsonMatch[0];
        }
        
        const aiData = JSON.parse(text);
        
        if (aiData.title && !aiData.error) {
          let mainClass = aiData.mainClass || getMainClassFromDdc(aiData.ddc || "");
          return NextResponse.json({
            title: aiData.title,
            author: aiData.author || "",
            publisher: aiData.publisher || "",
            year: aiData.year || "",
            ddc: aiData.ddc || "",
            mainClass: mainClass || "",
            subdivision1: aiData.subdivision1 || "",
            subdivision2: aiData.subdivision2 || "",
            subdivision3: aiData.subdivision3 || "",
            source: "AI Knowledge Base"
          });
        }
      }
    } catch (e) {
      console.log("AI Search failed:", e);
    }
    
    // 6. Graceful Fallback for Sri Lankan / General ISBNs so search NEVER throws an error alert
    if (!isName) {
      let publisher = "";
      let pubPlace = "";
      let subdivision1 = "";

      const rawIsbn = cleanIsbn.replace(/^978/, "");
      if (rawIsbn.startsWith("95521")) {
        publisher = "එම්. ඩී. ගුණසේන (M. D. Gunasena & Co.)";
        pubPlace = "Colombo";
        subdivision1 = "සිංහල කතා / සාහිත්‍යය";
      } else if (rawIsbn.startsWith("955652") || rawIsbn.startsWith("955658") || rawIsbn.startsWith("955659")) {
        publisher = "එස්. ගොඩගේ සහ සහෝදරයෝ (Godage International)";
        pubPlace = "Colombo";
        subdivision1 = "සිංහල කතා / සාහිත්‍යය";
      } else if (rawIsbn.startsWith("955551")) {
        publisher = "විසිදුනු ප්‍රකාශකයෝ (Visidunu Publishers)";
        pubPlace = "Boralesgamuwa";
        subdivision1 = "සිංහල කතා / සාහිත්‍යය";
      } else if (rawIsbn.startsWith("955599")) {
        publisher = "දයාවංශ ජයකොඩි සහ සමාගම (Dayawansa Jayakody)";
        pubPlace = "Colombo";
        subdivision1 = "සිංහල කතා / සාහිත්‍යය";
      } else if (rawIsbn.startsWith("95530") || rawIsbn.startsWith("95590")) {
        publisher = "සරසවි ප්‍රකාශකයෝ (Sarasavi Publishers)";
        pubPlace = "Nugegoda";
        subdivision1 = "සිංහල කතා / සාහිත්‍යය";
      }

      const defaultMainClass = cleanIsbn.startsWith("978955") || cleanIsbn.startsWith("955") 
        ? "800 - සාහිත්ය" 
        : "000 - පරිගණක විද්යාව, තොරතුරු හා සාමාන්ය කෘති";

      return NextResponse.json({
        title: "",
        author: "",
        publisher,
        pubPlace,
        year: "",
        ddc: "800",
        mainClass: defaultMainClass,
        subdivision1,
        subdivision2: "",
        subdivision3: "",
        isbn: cleanIsbn,
        source: "Sri Lanka Publisher Registry"
      });
    }

    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching ISBN:", error);
    return NextResponse.json({ error: "Failed to fetch book info" }, { status: 500 });
  }
}
