import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, verifyFirebaseToken } from "@/lib/auth";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

function validatePassword(password: string): string | null {
  if (password.length < 8) return "პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს";
  if (!/[A-Z]/.test(password)) return "პაროლი უნდა შეიცავდეს ერთ დიდ ასოს მაინც";
  if (!/\d/.test(password)) return "პაროლი უნდა შეიცავდეს ერთ ციფრს მაინც";
  return null;
}

async function verifyCaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) return true;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.token) {
      const { token, fullName, phone, captchaToken } = body;
      if (!token || !fullName) {
        return NextResponse.json({ message: "ყველა ველი სავალდებულოა" }, { status: 400 });
      }
      if (RECAPTCHA_SECRET_KEY && captchaToken) {
        const valid = await verifyCaptcha(captchaToken);
        if (!valid) return NextResponse.json({ message: "CAPTCHA ვერიფიკაცია ვერ მოხერხდა" }, { status: 400 });
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

    const { email, password, fullName, phone, captchaToken } = body;
    if (!email || !password || !fullName) {
      return NextResponse.json({ message: "ყველა ველი სავალდებულოა" }, { status: 400 });
    }

    const pwError = validatePassword(password);
    if (pwError) return NextResponse.json({ message: pwError }, { status: 400 });

    if (RECAPTCHA_SECRET_KEY && captchaToken) {
      const valid = await verifyCaptcha(captchaToken);
      if (!valid) return NextResponse.json({ message: "CAPTCHA ვერიფიკაცია ვერ მოხერხდა" }, { status: 400 });
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
