"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function createMember(formData: FormData) {
  const memberId = formData.get("memberId") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const email = formData.get("email") as string | null;
  const passwordRaw = formData.get("password") as string;
  const phone = formData.get("phone") as string | null;
  const department = formData.get("department") as string | null;
  const address = formData.get("address") as string | null;

  const permCirculation = formData.get("permCirculation") === "on";
  const permCatalog = formData.get("permCatalog") === "on";
  const permMembers = formData.get("permMembers") === "on";
  const permInventory = formData.get("permInventory") === "on";
  const permDashboard = formData.get("permDashboard") === "on";

  if (!memberId || !name || !passwordRaw) {
    throw new Error("Member ID, Name, and Password are required");
  }

  // Hash the password securely
  const password = await bcrypt.hash(passwordRaw, 10);

  // Check if member exists
  const existingMember = await prisma.user.findUnique({
    where: { memberId }
  });

  if (existingMember) {
    throw new Error(`Member ID ${memberId} already exists!`);
  }

  await prisma.user.create({
    data: {
      memberId,
      name: name.trim(),
      role: role || "MEMBER",
      email: email?.trim() || null,
      password,
      phone: phone?.trim() || null,
      department: department?.trim() || null,
      address: address?.trim() || null,
      permCirculation,
      permCatalog,
      permMembers,
      permInventory,
      permDashboard,
    },
  });

  revalidatePath("/members");
  redirect("/members");
}

export async function updateMember(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const department = formData.get("department") as string | null;
  const address = formData.get("address") as string | null;
  const passwordRaw = formData.get("password") as string | null;

  const permCirculation = formData.get("permCirculation") === "on";
  const permCatalog = formData.get("permCatalog") === "on";
  const permMembers = formData.get("permMembers") === "on";
  const permInventory = formData.get("permInventory") === "on";
  const permDashboard = formData.get("permDashboard") === "on";

  if (!id || !name) {
    throw new Error("ID and Name are required");
  }

  const updateData: any = {
    name: name.trim(),
    role: role || "MEMBER",
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    department: department?.trim() || null,
    address: address?.trim() || null,
    permCirculation,
    permCatalog,
    permMembers,
    permInventory,
    permDashboard,
  };

  if (passwordRaw) {
    updateData.password = await bcrypt.hash(passwordRaw, 10);
  }

  await prisma.user.update({
    where: { id },
    data: updateData
  });

  revalidatePath("/members");
  redirect("/members");
}

export async function deleteMember(id: string) {
  await prisma.user.delete({
    where: { id }
  });
  revalidatePath("/members");
}
