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
  const whatsappTemplate = formData.get("whatsappTemplate") as string | null;
  const libraryName = formData.get("libraryName") as string | null;
  const instituteName = formData.get("instituteName") as string | null;

  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("@/lib/auth");
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (userRole !== 'ADMIN' && userRole !== 'LIBRARIAN') {
    return { success: false, error: "Unauthorized" };
  }

  if (isNaN(dailyFineRate) || isNaN(borrowPeriodDays) || isNaN(renewalPeriodDays) || isNaN(reminderDaysBeforeDue)) {
    return { success: false, error: "invalid values provided." };
  }

  try {
    const existingConfig = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    
    // Only admins can update SMTP settings. For others, keep existing values.
    const finalSmtpEmail = userRole === 'ADMIN' ? smtpEmail : existingConfig?.smtpEmail;
    const finalSmtpPassword = userRole === 'ADMIN' ? smtpPassword : existingConfig?.smtpPassword;

    await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: { dailyFineRate, borrowPeriodDays, renewalPeriodDays, reminderDaysBeforeDue, smtpEmail: finalSmtpEmail, smtpPassword: finalSmtpPassword, whatsappTemplate, libraryName, instituteName },
      create: { id: 1, dailyFineRate, borrowPeriodDays, renewalPeriodDays, reminderDaysBeforeDue, smtpEmail: finalSmtpEmail, smtpPassword: finalSmtpPassword, whatsappTemplate, libraryName, instituteName }
    });
    revalidatePath("/tools");
    revalidatePath("/");
    return { success: true, message: "Settings updated successfully." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

