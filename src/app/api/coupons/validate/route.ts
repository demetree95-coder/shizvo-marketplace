import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) return NextResponse.json({ message: "კუპონის კოდი აუცილებელია" }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) return NextResponse.json({ message: "კუპონი არ მოიძებნა" }, { status: 404 });
    if (!coupon.isActive) return NextResponse.json({ message: "კუპონი არააქტიურია" }, { status: 400 });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return NextResponse.json({ message: "კუპონის ვადა გაუვიდა" }, { status: 400 });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ message: "კუპონით სარგებლობის ლიმიტი ამოწურულია" }, { status: 400 });

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
        minAmount: coupon.minAmount,
      },
    });
  } catch {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
