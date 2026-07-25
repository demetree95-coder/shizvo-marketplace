import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: { _count: { select: { products: true } }, user: { select: { id: true, fullName: true, avatar: true } } },
    });
    if (!shop) return NextResponse.json({ message: "მაღაზია არ მოიძებნა" }, { status: 404 });
    return NextResponse.json(shop);
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
