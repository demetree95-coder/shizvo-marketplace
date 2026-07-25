import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const orders = await prisma.order.findMany({
      where: { userId: payload.userId },
      include: { items: { include: { product: true } }, shop: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { items, address, note, shopId, shipping: shippingCost, couponCode } = await request.json();
    if (!items?.length || !address || !shopId) {
      return NextResponse.json({ message: "მონაცემები არასრულია" }, { status: 400 });
    }
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;
      orderItems.push({ productId: product.id, quantity: item.quantity, price });
      await prisma.product.update({ where: { id: product.id }, data: { stock: Math.max(0, product.stock - item.quantity), soldCount: product.soldCount + item.quantity } });
    }
    const shipping = typeof shippingCost === "number" ? shippingCost : 0;
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
        if (coupon.type === "percentage") {
          discount = Math.round((subtotal * coupon.discount) / 100 * 100) / 100;
        } else {
          discount = coupon.discount;
        }
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(), userId: payload.userId, shopId,
        subtotal, shipping, discount, total: Math.max(0, subtotal + shipping - discount),
        paidAt: new Date(), note: note || null, fullName: address.fullName, phone: address.phone,
        street: address.street, city: address.city, region: address.region || null, zipCode: address.zipCode || null,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა შეკვეთის შექმნისას" }, { status: 500 });
  }
}
