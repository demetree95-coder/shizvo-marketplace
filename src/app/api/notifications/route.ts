import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const notifications = await prisma.notification.findMany({ where: { userId: payload.userId }, orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { id } = await request.json();
    if (id) {
      await prisma.notification.update({ where: { id }, data: { isRead: true } });
    } else {
      await prisma.notification.updateMany({ where: { userId: payload.userId }, data: { isRead: true } });
    }
    return NextResponse.json({ message: "წაკითხულად მონიშნულია" });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
