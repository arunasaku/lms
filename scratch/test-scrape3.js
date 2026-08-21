async function test() {
  const res = await fetch(`https://grantha.lk/catalogsearch/result/?q=senkottan`);
  const html = await res.text();
  
  const blockMatch = html.match(/class="product-item-info"[\s\S]*?<\/div>\s*<\/div>/i);
  if (blockMatch) {
    console.log("Block:", blockMatch[0]);
  }
}
test();
