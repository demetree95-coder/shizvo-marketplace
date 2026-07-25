import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const shop = await prisma.shop.findUnique({ where: { userId: payload.userId } });
    if (!shop) return NextResponse.json({ message: "მაღაზია არ მოიძებნა" }, { status: 404 });
    const data = await request.json();
    const updated = await prisma.shop.update({ where: { id: shop.id }, data });
    return NextResponse.json({ shop: updated });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
