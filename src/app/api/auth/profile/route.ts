import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    }
    const { fullName, phone, avatar } = await request.json();
    const data: Record<string, string | null> = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (phone !== undefined) data.phone = phone;
    if (avatar !== undefined) data.avatar = avatar;
    const user = await prisma.user.update({ where: { id: payload.userId }, data });
    return NextResponse.json({
      id: user.id, email: user.email, fullName: user.fullName,
      phone: user.phone, avatar: user.avatar, role: user.role,
      createdAt: user.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ message: "შეცდომა განახლების დროს" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) {
      return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { shop: true, addresses: true },
    });
    if (!user) {
      return NextResponse.json({ message: "მომხმარებელი არ მოიძებნა" }, { status: 404 });
    }
    return NextResponse.json({
      id: user.id, email: user.email, fullName: user.fullName,
      phone: user.phone, avatar: user.avatar, role: user.role,
      createdAt: user.createdAt.toISOString(), shop: user.shop,
      addresses: user.addresses,
    });
  } catch {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
