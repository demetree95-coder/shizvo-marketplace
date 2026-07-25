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

export async function DELETE(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID აუცილებელია" }, { status: 400 });
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== payload.userId) {
      return NextResponse.json({ message: "მისამართი არ მოიძებნა" }, { status: 404 });
    }
    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
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
