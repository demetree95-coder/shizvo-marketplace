import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { id } = await params;
    const conv = await prisma.conversation.findUnique({ where: { id } });
    if (!conv || (conv.userId !== payload.userId && conv.shop.userId !== payload.userId)) {
      return NextResponse.json({ message: "არ მოიძებნა" }, { status: 404 });
    }
    const messages = await prisma.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
