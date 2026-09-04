import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to");

  if (!to) {
    return NextResponse.json({ error: "Query parameter 'to' is required. Example: /api/test-email?to=your_email@gmail.com" }, { status: 400 });
  }

  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    const smtpEmail = config?.smtpEmail || process.env.EMAIL_USER;
    const smtpPassword = config?.smtpPassword || process.env.EMAIL_PASS;

    if (!smtpEmail || !smtpPassword) {
      return NextResponse.json({ 
        error: "SMTP Email or Password is not configured in Tools > System Configuration." 
      }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const info = await transporter.sendMail({
      from: `"${config?.libraryName || 'Library System'}" <${smtpEmail}>`,
      to: to,
      subject: `Test Email from ${config?.libraryName || 'Library LMS'}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #4f46e5; border-radius: 8px;">
          <h2 style="color: #4f46e5;">🎉 Test Email Successful!</h2>
          <p>This is a test email sent from <strong>${config?.libraryName || 'Library Management System'}</strong>.</p>
          <p>Your SMTP Email notification service is working perfectly!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${to}`,
      messageId: info.messageId
    });
  } catch (error: any) {
    console.error("Test Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
