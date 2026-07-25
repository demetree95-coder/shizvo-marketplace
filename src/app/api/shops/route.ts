import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");
    const where: any = { isBlocked: false };
    if (featured === "true") where.isFeatured = true;
    const shops = await prisma.shop.findMany({
      where, take: limit,
      include: { _count: { select: { products: true } } },
      orderBy: { totalSales: "desc" },
    });
    return NextResponse.json({ shops });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
