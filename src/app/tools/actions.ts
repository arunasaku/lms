"use server"

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateSystemSettings(formData: FormData) {
  const dailyFineRate = parseFloat(formData.get("dailyFineRate") as string);
  const borrowPeriodDays = parseInt(formData.get("borrowPeriodDays") as string, 10);

  if (isNaN(dailyFineRate) || isNaN(borrowPeriodDays)) {
    return { success: false, error: "invalid values provided." };
  }

  try {
    await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: { dailyFineRate, borrowPeriodDays },
      create: { id: 1, dailyFineRate, borrowPeriodDays }
    });
    revalidatePath("/tools");
    revalidatePath("/circulation/reports");
    return { success: true, message: "Settings updated successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

