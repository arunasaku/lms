import { NextResponse } from "next/server";

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
    
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching ISBN:", error);
    return NextResponse.json({ error: "Failed to fetch book info" }, { status: 500 });
  }
}
