const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data import from Excel...");
  const workbook = XLSX.readFile("E:\\\\Pen drive\\\\LMS\\\\Accession Ledger.xlsx");
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Skip header row
  const dataRows = rows.slice(1);
  let booksToInsert = [];

  for (const row of dataRows) {
    if (!row[1]) continue; // Skip if no Acc No
    
    booksToInsert.push({
      accNo: String(row[1]),
      dateAdded: row[0] ? String(row[0]) : null,
      title: row[2] ? String(row[2]) : "Untitled",
      author: row[3] ? String(row[3]) : null,
      publisher: row[4] ? String(row[4]) : null,
      year: row[5] ? String(row[5]) : null,
      vendor: row[6] ? String(row[6]) : null,
      price: row[7] ? parseFloat(row[7]) : null,
      billNo: row[8] ? String(row[8]) : null,
      status: "AVAILABLE"
    });
  }

  try {
    const result = await prisma.book.createMany({
      data: booksToInsert,
      skipDuplicates: true
    });
    console.log(`Import completed. Successfully imported ${result.count} books.`);
  } catch (e) {
    console.log(`Failed to import batch:`, e.message);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
