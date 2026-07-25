import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const addresses = await prisma.address.findMany({ where: { userId: payload.userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ addresses });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const data = await request.json();
    if (data.isDefault) await prisma.address.updateMany({ where: { userId: payload.userId }, data: { isDefault: false } });
    const address = await prisma.address.create({ data: { ...data, userId: payload.userId } });
    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
