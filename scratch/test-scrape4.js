async function test() {
  const res = await fetch(`https://grantha.lk/catalogsearch/result/?q=senkottan`);
  const html = await res.text();
  const index = html.indexOf('product-item-link');
  if (index !== -1) {
    console.log(html.substring(index, index + 500));
  }
}
test();
