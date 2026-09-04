"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function createBook(formData: FormData) {
  const accNo = formData.get("accNo") as string;
  const title = formData.get("title") as string;
  const author = formData.get("author") as string | null;
  const publisher = formData.get("publisher") as string | null;
  const year = formData.get("year") as string | null;
  const vendor = formData.get("vendor") as string | null;
  const priceStr = formData.get("price") as string | null;
  const billNo = formData.get("billNo") as string | null;
  const isbn = formData.get("isbn") as string | null;
  const ddc = formData.get("ddc") as string | null;
  const pages = formData.get("pages") as string | null;
  const height = formData.get("height") as string | null;
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
      author,
      publisher,
      year,
      vendor,
      price: isNaN(price as number) ? null : price,
      billNo,
      isbn,
      ddc,
      pages,
      height,
      itemType: itemType || "LENDING",
      category,
      shelfLoc,
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
  const author = formData.get("author") as string | null;
  const publisher = formData.get("publisher") as string | null;
  const year = formData.get("year") as string | null;
  const vendor = formData.get("vendor") as string | null;
  const priceStr = formData.get("price") as string | null;
  const billNo = formData.get("billNo") as string | null;
  const isbn = formData.get("isbn") as string | null;
  const ddc = formData.get("ddc") as string | null;
  const pages = formData.get("pages") as string | null;
  const height = formData.get("height") as string | null;
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
      author: author || null,
      publisher: publisher || null,
      year: year || null,
      vendor: vendor || null,
      price: isNaN(price as number) ? null : price,
      billNo: billNo || null,
      isbn: isbn || null,
      ddc: ddc || null,
      pages: pages || null,
      height: height || null,
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
