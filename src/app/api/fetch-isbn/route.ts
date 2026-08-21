import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn");

  if (!isbn) {
    return NextResponse.json({ error: "ISBN is required" }, { status: 400 });
  }

  try {
    // Determine if the input is an ISBN or a Book Name
    const isName = /[a-zA-Z]{3,}/.test(isbn);
    
    // 1. Try Google Books API First
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
    } else {
      // 4. Use AI Fallback for Name Searches
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
          const prompt = `Provide the details for the book "${isbn}". 
Respond ONLY in this exact JSON format, nothing else:
{"title": "Book Name", "author": "Author Name", "publisher": "Publisher Name", "year": "YYYY"}
If you don't know the exact year or publisher, leave them blank. Make sure the author is accurate.`;
          
          const result = await model.generateContent(prompt);
          const response = await result.response;
          let text = response.text().trim();
          
          // clean up markdown json blocks if any
          text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const aiData = JSON.parse(text);
          
          if (aiData.title) {
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
    }
    
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching ISBN:", error);
    return NextResponse.json({ error: "Failed to fetch book info" }, { status: 500 });
  }
}
