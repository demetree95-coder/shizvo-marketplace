import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, verifyFirebaseToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.token) {
      const { token, fullName, phone } = body;
      if (!token || !fullName) {
        return NextResponse.json({ message: "ყველა ველი სავალდებულოა" }, { status: 400 });
      }
      const payload = await verifyFirebaseToken(token);
      if (!payload) {
        return NextResponse.json({ message: "არასწორი ან ვადაგასული ტოკენი" }, { status: 401 });
      }
      const existing = await prisma.user.findUnique({ where: { email: payload.email } });
      if (existing) {
        return NextResponse.json({ message: "მომხმარებელი ამ ელ. ფოსტით უკვე არსებობს" }, { status: 400 });
      }
      const user = await prisma.user.create({
        data: { id: payload.userId, email: payload.email, password: "", fullName, phone: phone || null },
      });
      return NextResponse.json({
        token: "",
        user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, avatar: user.avatar, role: user.role, createdAt: user.createdAt.toISOString() },
      }, { status: 201 });
    }

    const { email, password, fullName, phone } = body;
    if (!email || !password || !fullName) {
      return NextResponse.json({ message: "ყველა ველი სავალდებულოა" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "მომხმარებელი ამ ელ. ფოსტით უკვე არსებობს" }, { status: 400 });
    }
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, fullName, phone: phone || null },
    });
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, avatar: user.avatar, role: user.role, createdAt: user.createdAt.toISOString() },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "შეცდომა რეგისტრაციის დროს" }, { status: 500 });
  }
}
