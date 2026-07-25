import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateToken, verifyFirebaseToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.token) {
      const payload = await verifyFirebaseToken(body.token);
      if (!payload) {
        return NextResponse.json({ message: "არასწორი ან ვადაგასული ტოკენი" }, { status: 401 });
      }
      let user = await prisma.user.findUnique({ where: { email: payload.email } });
      if (!user) {
        user = await prisma.user.create({
          data: { id: payload.userId, email: payload.email, password: "", fullName: payload.email.split("@")[0] },
        });
      }
      return NextResponse.json({
        token: "",
        user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, avatar: user.avatar, role: user.role, createdAt: user.createdAt.toISOString() },
      });
    }

    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ message: "ყველა ველი სავალდებულოა" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "არასწორი ელ. ფოსტა ან პაროლი" }, { status: 401 });
    }
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "არასწორი ელ. ფოსტა ან პაროლი" }, { status: 401 });
    }
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, avatar: user.avatar, role: user.role, createdAt: user.createdAt.toISOString() },
    });
  } catch {
    return NextResponse.json({ message: "შეცდომა ავტორიზაციის დროს" }, { status: 500 });
  }
}
