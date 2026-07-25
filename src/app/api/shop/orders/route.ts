import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { shop: true },
    });

    if (!user?.shop) return NextResponse.json({ message: "მაღაზია არ არის" }, { status: 404 });

    const orders = await prisma.order.findMany({
      where: { shopId: user.shop.id },
      include: { items: { include: { product: true } }, user: { select: { id: true, fullName: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
