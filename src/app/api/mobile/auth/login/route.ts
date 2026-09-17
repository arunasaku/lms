import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memberId, password } = body;

    if (!memberId || !password) {
      return NextResponse.json(
        { error: "Member ID and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        memberId: {
          equals: memberId.trim(),
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid Member ID or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid Member ID or password" },
        { status: 401 }
      );
    }

    // Return User Profile details for the mobile app session
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        memberId: user.memberId,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone || user.mobileNo,
        memberType: user.memberType,
        salutation: user.salutation,
        address: user.address,
        registeredDate: user.registeredDate,
      },
    });
  } catch (error: any) {
    console.error("Mobile Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
