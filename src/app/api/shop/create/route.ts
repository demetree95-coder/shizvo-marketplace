import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { name, description, logo, banner, contactEmail, contactPhone } = await request.json();
    if (!name) return NextResponse.json({ message: "მაღაზიის სახელი სავალდებულოა" }, { status: 400 });
    const existingShop = await prisma.shop.findUnique({ where: { userId: payload.userId } });
    if (existingShop) return NextResponse.json({ message: "უკვე გაქვთ მაღაზია" }, { status: 400 });
    let slug = slugify(name);
    const slugExists = await prisma.shop.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;
    const shop = await prisma.shop.create({
      data: { userId: payload.userId, name, slug, description, logo, banner, contactEmail, contactPhone },
    });
    await prisma.user.update({ where: { id: payload.userId }, data: { role: "VENDOR" } });
    return NextResponse.json({ shop }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა მაღაზიის შექმნისას" }, { status: 500 });
  }
}
