const XLSX = require("xlsx");
const path = require("path");

const workbook = XLSX.readFile("E:\\\\Pen drive\\\\LMS\\\\Accession Ledger.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log("Headers:", json[0]);
console.log("Sample Row:", json[1]);
