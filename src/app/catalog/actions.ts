"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBook(formData: FormData) {
  const accNo = formData.get("accNo") as string;
  const title = formData.get("title") as string;
  const title2 = formData.get("title2") as string | null;
  const author = formData.get("author") as string | null;
  const author2 = formData.get("author2") as string | null;
  const author3 = formData.get("author3") as string | null;
  const publisher = formData.get("publisher") as string | null;
  const pubPlace = formData.get("pubPlace") as string | null;
  const year = formData.get("year") as string | null;
  const vendor = formData.get("vendor") as string | null;
  const priceStr = formData.get("price") as string | null;
  const billNo = formData.get("billNo") as string | null;
  const isbn = formData.get("isbn") as string | null;
  const ddc = formData.get("ddc") as string | null;
  const pages = formData.get("pages") as string | null;
  const height = formData.get("height") as string | null;
  const acquisitionType = formData.get("acquisitionType") as string | null;
  const itemType = formData.get("itemType") as string | null;
  const category = formData.get("category") as string | null;
  const shelfLoc = formData.get("shelfLoc") as string | null;

  if (!accNo || !title) {
    throw new Error("Accession Number and Title are required");
  }

  const accNoInt = parseInt(accNo, 10);
  const price = priceStr ? parseFloat(priceStr) : null;
  
  const today = new Date();
  const dateAdded = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;

  await prisma.book.create({
    data: {
      accNo,
      accNoInt: isNaN(accNoInt) ? null : accNoInt,
      title,
      title2: title2 || null,
      author: author || null,
      author2: author2 || null,
      author3: author3 || null,
      publisher: publisher || null,
      pubPlace: pubPlace || null,
      year: year || null,
      vendor: vendor || null,
      price: isNaN(price as number) ? null : price,
      billNo: billNo || null,
      isbn: isbn || null,
      ddc: ddc || null,
      pages: pages || null,
      height: height || null,
      acquisitionType: acquisitionType || "PURCHASED",
      itemType: itemType || "LENDING",
      category: category || null,
      shelfLoc: shelfLoc || null,
      dateAdded,
      status: "AVAILABLE",
    },
  });

  revalidatePath("/catalog");
  redirect("/catalog");
}

export async function updateBook(formData: FormData) {
  const id = formData.get("id") as string;
  const accNo = formData.get("accNo") as string;
  const title = formData.get("title") as string;
  const title2 = formData.get("title2") as string | null;
  const author = formData.get("author") as string | null;
  const author2 = formData.get("author2") as string | null;
  const author3 = formData.get("author3") as string | null;
  const publisher = formData.get("publisher") as string | null;
  const pubPlace = formData.get("pubPlace") as string | null;
  const year = formData.get("year") as string | null;
  const vendor = formData.get("vendor") as string | null;
  const priceStr = formData.get("price") as string | null;
  const billNo = formData.get("billNo") as string | null;
  const isbn = formData.get("isbn") as string | null;
  const ddc = formData.get("ddc") as string | null;
  const pages = formData.get("pages") as string | null;
  const height = formData.get("height") as string | null;
  const acquisitionType = formData.get("acquisitionType") as string | null;
  const itemType = formData.get("itemType") as string | null;
  const category = formData.get("category") as string | null;
  const shelfLoc = formData.get("shelfLoc") as string | null;
  const status = formData.get("status") as string;

  if (!id || !accNo || !title) {
    throw new Error("ID, Accession Number, and Title are required");
  }

  const accNoInt = parseInt(accNo, 10);
  const price = priceStr ? parseFloat(priceStr) : null;

  await prisma.book.update({
    where: { id },
    data: {
      accNo,
      accNoInt: isNaN(accNoInt) ? null : accNoInt,
      title,
      title2: title2 || null,
      author: author || null,
      author2: author2 || null,
      author3: author3 || null,
      publisher: publisher || null,
      pubPlace: pubPlace || null,
      year: year || null,
      vendor: vendor || null,
      price: isNaN(price as number) ? null : price,
      billNo: billNo || null,
      isbn: isbn || null,
      ddc: ddc || null,
      pages: pages || null,
      height: height || null,
      acquisitionType: acquisitionType || "PURCHASED",
      itemType: itemType || "LENDING",
      category: category || null,
      shelfLoc: shelfLoc || null,
      status: status || "AVAILABLE",
    },
  });
  revalidatePath("/catalog");
  redirect("/catalog");
}

export async function deleteBook(id: string) {
  await prisma.book.delete({
    where: { id }
  });
  revalidatePath("/catalog");
}
