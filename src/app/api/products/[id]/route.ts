import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, shop: true, reviews: { include: { user: { select: { id: true, fullName: true, avatar: true } } }, orderBy: { createdAt: "desc" } } },
    });
    if (!product) {
      return NextResponse.json({ message: "პროდუქტი არ მოიძებნა" }, { status: 404 });
    }
    return NextResponse.json({
      ...product, images: JSON.parse(product.images as string), features: JSON.parse(product.features as string),
      createdAt: product.createdAt.toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
