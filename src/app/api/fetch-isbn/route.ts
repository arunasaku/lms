import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function fetchFromUnionCatalogue(isbnOrQuery: string) {
  try {
    const cleanQuery = isbnOrQuery.replace(/[- ]/g, '');
    const searchUrl = `https://unioncatalogue.dlp.gov.lk/Search/Results?lookfor=${encodeURIComponent(cleanQuery)}&type=AllFields`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const html = await res.text();

    const recordHrefs = [...html.matchAll(/href="([^"]+)"/g)]
      .map(m => m[1].replace(/&#x2F;/g, '/').replace(/&#x3F;/g, '?').replace(/&#x3D;/g, '=').replace(/&amp;/g, '&'))
      .filter(h => h.startsWith('/Record/') && !h.includes('/Save'));

    const uniqueRecords = [...new Set(recordHrefs.map(h => h.split('?')[0]))];
    if (uniqueRecords.length === 0) return null;

    const recordId = uniqueRecords[0].replace('/Record/', '');
    const marcUrl = `https://unioncatalogue.dlp.gov.lk/Record/${recordId}/Export?style=MARCXML`;
    const marcRes = await fetch(marcUrl);
    if (!marcRes.ok) return null;
    const marcXml = await marcRes.text();

    const titleMatch = marcXml.match(/<datafield tag="245"[\s\S]*?<subfield code="a">([\s\S]*?)<\/subfield>/i);
    const authorMatch = marcXml.match(/<datafield tag="100"[\s\S]*?<subfield code="a">([\s\S]*?)<\/subfield>/i);
    const ddcMatch = marcXml.match(/<datafield tag="082"[\s\S]*?<subfield code="a">([\s\S]*?)<\/subfield>/i);
    const publisherMatch = marcXml.match(/<datafield tag="260"[\s\S]*?<subfield code="b">([\s\S]*?)<\/subfield>/i);
    const yearMatch = marcXml.match(/<datafield tag="260"[\s\S]*?<subfield code="c">([\s\S]*?)<\/subfield>/i);
    const priceMatch = marcXml.match(/<datafield tag="300"[\s\S]*?<subfield code="b">([\s\S]*?)<\/subfield>/i);

    let title = titleMatch ? titleMatch[1].replace(/\s*\/\s*$/, '').trim() : '';
    let author = authorMatch ? authorMatch[1].trim() : '';
    let publisher = publisherMatch ? publisherMatch[1].replace(/[,:]\s*$/, '').trim() : '';
    let year = yearMatch ? yearMatch[1].replace(/[^0-9]/g, '').trim() : '';
    let ddc = ddcMatch ? ddcMatch[1].trim() : '';
    
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
        price,
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

  try {
    // 0. Try National Virtual Union Catalogue of Sri Lanka First
    const unionCatData = await fetchFromUnionCatalogue(isbn);
    if (unionCatData) {
      return NextResponse.json(unionCatData);
    }

    // Determine if the input is an ISBN or a Book Name
    const isName = /[a-zA-Z]{3,}/.test(isbn);
    
    // 1. Try Google Books API
    const googleQuery = isName ? `intitle:${encodeURIComponent(isbn)}` : `isbn:${isbn}`;
    let res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${googleQuery}&maxResults=1`);
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

    if (!isName) {
      // ... existing code for ISBN fallback ...
      // 2. Try OpenLibrary API as a fallback (Only for ISBNs)
      res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
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

      // 3. Web Scraping for Grantha.lk (Only for ISBNs)
      try {
        const granthaRes = await fetch(`https://grantha.lk/catalogsearch/result/?q=${isbn}`);
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
      } catch (e) {
        console.log("Grantha scrape failed:", e);
      }
    }
    
    // 4. Use AI Fallback for both Name and ISBN searches as a last resort
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
        const prompt = `Provide the details for the book with ISBN or Name "${isbn}". If it is an ISBN of a Sri Lankan / Sinhala book, provide its Sinhala or transliterated details.
Respond ONLY in this exact JSON format, nothing else:
{"title": "Book Name", "author": "Author Name", "publisher": "Publisher Name", "year": "YYYY"}
If you don't know the exact year or publisher, leave them blank. Make sure the author is accurate. If you absolutely cannot find it, respond with {"error": "not found"}.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        // Extract JSON block in case AI added extra text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          text = jsonMatch[0];
        }
        
        const aiData = JSON.parse(text);
        
        if (aiData.title && !aiData.error) {
          return NextResponse.json({
            title: aiData.title,
            author: aiData.author || "",
            publisher: aiData.publisher || "",
            year: aiData.year || "",
            source: "AI Knowledge Base"
          });
        }
      }
    } catch (e) {
      console.log("AI Search failed:", e);
    }
    
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching ISBN:", error);
    return NextResponse.json({ error: "Failed to fetch book info" }, { status: 500 });
  }
}
