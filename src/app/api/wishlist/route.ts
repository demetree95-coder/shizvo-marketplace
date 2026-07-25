import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: payload.userId },
      include: { items: { include: { product: { include: { shop: true } } } } },
    });
    return NextResponse.json({ wishlist: wishlist || { items: [] } });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { productId } = await request.json();
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: payload.userId } });
    if (!wishlist) wishlist = await prisma.wishlist.create({ data: { userId: payload.userId } });
    const existing = await prisma.wishlistItem.findFirst({ where: { wishlistId: wishlist.id, productId } });
    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ message: "ამოშლილია სურვილებიდან" });
    }
    await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
    return NextResponse.json({ message: "დაემატა სურვილებში" });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
