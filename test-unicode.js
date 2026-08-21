const { convert } = require('sinhala-unicode-coverter');

const legacy = 'lsysß jkh iy ;j;a l;d';
// The package might export differently, we'll try a few ways
try {
  console.log("convert:", convert(legacy));
} catch (e) {
  try {
    const converter = require('sinhala-unicode-coverter');
    console.log("direct function call?", converter(legacy));
  } catch (e2) {
    console.log("Could not convert. Module keys:", Object.keys(require('sinhala-unicode-coverter')));
  }
}
