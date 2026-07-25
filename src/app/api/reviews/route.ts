import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { productId, rating, comment } = await request.json();
    if (!productId || !rating) return NextResponse.json({ message: "მონაცემები არასრულია" }, { status: 400 });
    const review = await prisma.review.create({
      data: { userId: payload.userId, productId, rating, comment: comment || null },
      include: { user: { select: { id: true, fullName: true, avatar: true } } },
    });
    const stats = await prisma.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true });
    await prisma.product.update({ where: { id: productId }, data: { rating: stats._avg.rating || 0, reviewCount: stats._count } });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
