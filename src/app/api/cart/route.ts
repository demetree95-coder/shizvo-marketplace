import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const cart = await prisma.cart.findUnique({
      where: { userId: payload.userId },
      include: { items: { include: { product: { include: { shop: true } } } } },
    });
    return NextResponse.json({ cart: cart || { items: [] } });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { productId, quantity = 1 } = await request.json();
    let cart = await prisma.cart.findUnique({ where: { userId: payload.userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: payload.userId } });
    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
    } else {
      await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
    }
    return NextResponse.json({ message: "დაემატა კალათაში" });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
