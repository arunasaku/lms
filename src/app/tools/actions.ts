"use server"

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateSystemSettings(formData: FormData) {
  const dailyFineRate = parseFloat(formData.get("dailyFineRate") as string);
  const borrowPeriodDays = parseInt(formData.get("borrowPeriodDays") as string, 10);
  const renewalPeriodDays = parseInt(formData.get("renewalPeriodDays") as string, 10);
  const reminderDaysBeforeDue = parseInt(formData.get("reminderDaysBeforeDue") as string, 10);
  const smtpEmail = formData.get("smtpEmail") as string | null;
  const smtpPassword = formData.get("smtpPassword") as string | null;

  if (isNaN(dailyFineRate) || isNaN(borrowPeriodDays) || isNaN(renewalPeriodDays) || isNaN(reminderDaysBeforeDue)) {
    return { success: false, error: "invalid values provided." };
  }

  try {
    await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: { dailyFineRate, borrowPeriodDays, renewalPeriodDays, reminderDaysBeforeDue, smtpEmail, smtpPassword },
      create: { id: 1, dailyFineRate, borrowPeriodDays, renewalPeriodDays, reminderDaysBeforeDue, smtpEmail, smtpPassword }
    });
    revalidatePath("/tools");
    revalidatePath("/circulation/reports");
    return { success: true, message: "Settings updated successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

