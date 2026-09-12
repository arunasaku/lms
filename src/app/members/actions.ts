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
  
  const memberType = (formData.get("memberType") as string) || "ADULT";
  const salutation = (formData.get("salutation") as string) || null;
  const civilStatus = (formData.get("civilStatus") as string) || null;
  const mobileNo = formData.get("mobileNo") as string | null;
  const whatsappNo = formData.get("whatsappNo") as string | null;
  const homeNo = formData.get("homeNo") as string | null;
  const phone = mobileNo?.trim() || whatsappNo?.trim() || (formData.get("phone") as string | null)?.trim() || null;
  
  const nic = formData.get("nic") as string | null;
  
  let occupation = formData.get("occupation") as string | null;
  const customOccupation = formData.get("customOccupation") as string | null;
  if (occupation === "Custom" && customOccupation) {
    occupation = customOccupation;
  }
  
  const address = formData.get("address") as string | null;

  const regDateRaw = formData.get("registeredDate") as string | null;
  const renewDateRaw = formData.get("renewedDate") as string | null;
  const registeredDate = regDateRaw ? new Date(regDateRaw) : new Date();
  const renewedDate = renewDateRaw ? new Date(renewDateRaw) : null;

  const guarantorName = formData.get("guarantorName") as string | null;
  const guarantorAddress = formData.get("guarantorAddress") as string | null;
  const guarantorPhone = formData.get("guarantorPhone") as string | null;

  const permCirculation = formData.get("permCirculation") === "on";
  const permCatalog = formData.get("permCatalog") === "on";
  const permMembers = formData.get("permMembers") === "on";
  const permInventory = formData.get("permInventory") === "on";
  const permDashboard = formData.get("permDashboard") === "on";

  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (userRole !== 'ADMIN' && role === 'ADMIN') {
    throw new Error("Unauthorized: Only admins can create admin users");
  }
  if (userRole === 'STAFF' && (role === 'LIBRARIAN' || role === 'STAFF')) {
    throw new Error("Unauthorized: Staff can only create regular members");
  }

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
      phone,
      mobileNo: mobileNo?.trim() || null,
      whatsappNo: whatsappNo?.trim() || null,
      homeNo: homeNo?.trim() || null,
      nic: nic?.trim() || null,
      occupation: occupation?.trim() || null,
      address: address?.trim() || null,
      memberType,
      salutation,
      civilStatus,
      registeredDate,
      renewedDate,
      guarantorName: guarantorName?.trim() || null,
      guarantorAddress: guarantorAddress?.trim() || null,
      guarantorPhone: guarantorPhone?.trim() || null,
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
  
  const memberType = (formData.get("memberType") as string) || "ADULT";
  const salutation = (formData.get("salutation") as string) || null;
  const civilStatus = (formData.get("civilStatus") as string) || null;
  const mobileNo = formData.get("mobileNo") as string | null;
  const whatsappNo = formData.get("whatsappNo") as string | null;
  const homeNo = formData.get("homeNo") as string | null;
  const phone = mobileNo?.trim() || whatsappNo?.trim() || (formData.get("phone") as string | null)?.trim() || null;
  
  const nic = formData.get("nic") as string | null;
  
  let occupation = formData.get("occupation") as string | null;
  const customOccupation = formData.get("customOccupation") as string | null;
  if (occupation === "Custom" && customOccupation) {
    occupation = customOccupation;
  }
  
  const address = formData.get("address") as string | null;
  const passwordRaw = formData.get("password") as string | null;

  const regDateRaw = formData.get("registeredDate") as string | null;
  const renewDateRaw = formData.get("renewedDate") as string | null;
  const registeredDate = regDateRaw ? new Date(regDateRaw) : undefined;
  const renewedDate = renewDateRaw ? new Date(renewDateRaw) : null;

  const guarantorName = formData.get("guarantorName") as string | null;
  const guarantorAddress = formData.get("guarantorAddress") as string | null;
  const guarantorPhone = formData.get("guarantorPhone") as string | null;

  const permCirculation = formData.get("permCirculation") === "on";
  const permCatalog = formData.get("permCatalog") === "on";
  const permMembers = formData.get("permMembers") === "on";
  const permInventory = formData.get("permInventory") === "on";
  const permDashboard = formData.get("permDashboard") === "on";

  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const currentUserId = (session?.user as any)?.id || (session?.user as any)?.memberId;

  const targetMember = await prisma.user.findUnique({ where: { id } });
  if (userRole !== 'ADMIN' && targetMember?.role === 'ADMIN') {
    throw new Error("Unauthorized: Cannot edit ADMIN");
  }
  if (userRole !== 'ADMIN' && role === 'ADMIN') {
    throw new Error("Unauthorized: Cannot change role to ADMIN");
  }
  if (userRole === 'STAFF') {
    if (targetMember?.role === 'STAFF' && targetMember.id !== currentUserId) {
      throw new Error("Unauthorized: Staff cannot edit other Staff");
    }
    if (targetMember?.role === 'LIBRARIAN' || role === 'LIBRARIAN') {
      throw new Error("Unauthorized: Staff cannot edit Librarian");
    }
  }

  if (!id || !name) {
    throw new Error("ID and Name are required");
  }

  const updateData: any = {
    name: name.trim(),
    role: role || "MEMBER",
    email: email?.trim() || null,
    phone,
    mobileNo: mobileNo?.trim() || null,
    whatsappNo: whatsappNo?.trim() || null,
    homeNo: homeNo?.trim() || null,
    nic: nic?.trim() || null,
    occupation: occupation?.trim() || null,
    address: address?.trim() || null,
    memberType,
    salutation,
    civilStatus,
    ...(registeredDate ? { registeredDate } : {}),
    renewedDate,
    guarantorName: guarantorName?.trim() || null,
    guarantorAddress: guarantorAddress?.trim() || null,
    guarantorPhone: guarantorPhone?.trim() || null,
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
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (userRole !== 'ADMIN' && userRole !== 'LIBRARIAN') {
    throw new Error("Unauthorized: Only admins and librarians can delete members");
  }

  const targetMember = await prisma.user.findUnique({ where: { id } });
  if (userRole === 'LIBRARIAN' && targetMember?.role === 'ADMIN') {
    throw new Error("Unauthorized: Librarians cannot delete admins");
  }

  await prisma.user.delete({
    where: { id }
  });
  revalidatePath("/members");
}
