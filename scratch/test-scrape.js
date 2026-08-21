async function test() {
  const isbn = "978955302970";
  const res = await fetch(`https://grantha.lk/catalogsearch/result/?q=${isbn}`);
  const html = await res.text();
  
  // Let's try some regexes based on standard Magento
  const titleMatch = html.match(/<a\s+class="product-item-link"\s+href="[^"]+">\s*(.+?)\s*<\/a>/i);
  if (titleMatch) {
    console.log("Found product-item-link:", titleMatch[1].trim());
  } else {
    // Try another standard class
    const titleMatch2 = html.match(/<h2\s+class="product-name">\s*<a\s+href="[^"]+"\s+title="([^"]+)"/i);
    if (titleMatch2) {
      console.log("Found product-name title attribute:", titleMatch2[1].trim());
    } else {
        const titleMatch3 = html.match(/title="([^"]+)"/i);
        console.log("No standard match found. Snippet:", html.substring(html.indexOf("product-name")-50, html.indexOf("product-name")+200));
    }
  }
}
test();
