import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// PATCH: Mark message as READ
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (!session || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const existing = await prisma.adminChatMessage.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Only mark read if receiver is current user (or broadcast message received by current user)
    if (!existing.isRead && existing.senderId !== userId) {
      const updated = await prisma.adminChatMessage.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json(existing);
  } catch (error: any) {
    console.error("Error marking message read:", error);
    return NextResponse.json({ error: error.message || "Failed to mark message as read" }, { status: 500 });
  }
}

// DELETE: Delete message
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (!session || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const existing = await prisma.adminChatMessage.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Allow any ADMIN user to delete any message
    if (userRole?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await prisma.adminChatMessage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting chat message:", error);
    return NextResponse.json({ error: error.message || "Failed to delete message" }, { status: 500 });
  }
}
