async function test() {
  const res = await fetch(`https://grantha.lk/catalogsearch/result/?q=senkottan`);
  const html = await res.text();
  
  const titleMatch = html.match(/class="product-item-link"\s*href="[^"]+">\s*([^<]+)\s*<\/a>/i);
  if (titleMatch) {
    console.log("Title:", titleMatch[1].trim());
  } else {
    console.log("Not found product-item-link");
    // Find anything with Senkottan
    console.log(html.match(/.{0,50}Senkottan.{0,50}/i)?.[0]);
  }
}
test();
