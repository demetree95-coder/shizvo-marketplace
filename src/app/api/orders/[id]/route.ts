import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, shop: true },
    });
    if (!order) return NextResponse.json({ message: "შეკვეთა არ მოიძებნა" }, { status: 404 });
    const requestUser = await prisma.user.findUnique({ where: { id: payload.userId }, select: { role: true } });
    if (order.userId !== payload.userId && requestUser?.role !== "ADMIN") {
      return NextResponse.json({ message: "წვდომა აკრძალულია" }, { status: 403 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { id } = await params;
    const { status, trackingNumber } = await request.json();
    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (status === "DELIVERED") updateData.deliveredAt = new Date();
    const updated = await prisma.order.update({ where: { id }, data: updateData, include: { items: { include: { product: true } } } });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
