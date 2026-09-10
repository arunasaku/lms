import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Clean up expired auto-disappearing messages
async function cleanupExpiredMessages() {
  try {
    const now = new Date();
    const readMessages = await prisma.adminChatMessage.findMany({
      where: {
        isRead: true,
        readAt: { not: null },
        disappearAfterSeconds: { gt: 0 }
      },
      select: {
        id: true,
        readAt: true,
        disappearAfterSeconds: true
      }
    });

    const expiredIds = readMessages
      .filter((m) => {
        if (!m.readAt || !m.disappearAfterSeconds) return false;
        const elapsed = (now.getTime() - new Date(m.readAt).getTime()) / 1000;
        return elapsed >= m.disappearAfterSeconds;
      })
      .map((m) => m.id);

    if (expiredIds.length > 0) {
      await prisma.adminChatMessage.deleteMany({
        where: { id: { in: expiredIds } }
      });
    }
  } catch (err) {
    console.error("Failed to cleanup expired chat messages:", err);
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (!session || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Clean up expired messages
    await cleanupExpiredMessages();

    // Fetch messages for current user (sent, received, or broadcast)
    const messages = await prisma.adminChatMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
          { receiverId: null }
        ]
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true }
        },
        receiver: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (!session || userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { receiverId, message, disappearAfterSeconds } = await req.json();

    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const newMessage = await prisma.adminChatMessage.create({
      data: {
        senderId: userId,
        receiverId: receiverId || null,
        message: message.trim(),
        disappearAfterSeconds: typeof disappearAfterSeconds === "number" ? disappearAfterSeconds : 0
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true }
        },
        receiver: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    console.error("Error posting chat message:", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
