const XLSX = require('xlsx');

const workbook = XLSX.readFile("E:\\\\Pen drive\\\\LMS\\\\Accession Ledger.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

for (let i = 1; i < rows.length; i++) {
  if (rows[i][1] == 9990) {
    console.log("Acc No 9990 Original Title:", rows[i][2]);
    console.log("Acc No 9990 Original Author:", rows[i][3]);
    break;
  }
}
