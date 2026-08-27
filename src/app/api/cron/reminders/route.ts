import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Simple auth for cron: you can add an authorization header check here
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'secret123'}`) {
    // For development/testing, we'll allow it if CRON_SECRET is not set in env,
    // but in production you should enforce this.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    const reminderDaysBeforeDue = config?.reminderDaysBeforeDue || 1;
    
    const today = new Date();
    // Get active loans where dueDate is past or within the reminder window, and user has an email
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: "ACTIVE",
        dueDate: {
          lte: new Date(today.getTime() + reminderDaysBeforeDue * 24 * 60 * 60 * 1000)
        },
        user: {
          email: { not: null }
        },
        // Don't remind if we already reminded them in the last 3 days
        OR: [
          { lastReminded: null },
          { lastReminded: { lt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) } }
        ]
      },
      include: {
        user: true,
        book: true,
      }
    });

    if (overdueLoans.length === 0) {
      return NextResponse.json({ message: "No reminders to send." });
    }

    // Configure Nodemailer
    // NOTE: For Gmail, you must use an App Password, not your regular password.
    const smtpEmail = config?.smtpEmail || process.env.EMAIL_USER;
    const smtpPassword = config?.smtpPassword || process.env.EMAIL_PASS;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    let sentCount = 0;

    for (const loan of overdueLoans) {
      if (!loan.user.email) continue;
      
      const isOverdue = loan.dueDate < today;
      const subject = isOverdue ? `OVERDUE: Return "${loan.book.title}"` : `Reminder: "${loan.book.title}" is due soon`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Library Notice</h2>
          <p>Dear ${loan.user.name},</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Book Title:</strong> ${loan.book.title}</p>
            <p><strong>Accession No:</strong> ${loan.book.accNo}</p>
            <p><strong>Due Date:</strong> ${loan.dueDate.toLocaleDateString()}</p>
          </div>
          
          <p style="color: ${isOverdue ? '#e11d48' : '#ca8a04'}; font-weight: bold;">
            ${isOverdue ? 'This book is currently OVERDUE. Please return it as soon as possible to avoid further fines.' : 'This book is due very soon. Please return it on time.'}
          </p>
          
          <p>Thank you,</p>
          <p>The Library Team</p>
        </div>
      `;

      try {
        // Only attempt to send if environment variables or db config are configured
        if (smtpEmail && smtpPassword) {
          await transporter.sendMail({
            from: `"Library System" <${smtpEmail}>`,
            to: loan.user.email,
            subject: subject,
            html: html,
          });
        } else {
          console.log(`[SIMULATED EMAIL] To: ${loan.user.email}, Subject: ${subject}`);
        }

        // Update lastReminded regardless of simulated or real
        await prisma.loan.update({
          where: { id: loan.id },
          data: { lastReminded: new Date() }
        });
        
        sentCount++;
      } catch (error) {
        console.error(`Failed to send email to ${loan.user.email}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${sentCount} reminders.`,
      simulated: !(smtpEmail && smtpPassword)
    });

  } catch (error: any) {
    console.error("Cron Reminder Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
