import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { conversationId, content } = await request.json();
    if (!conversationId || !content) return NextResponse.json({ message: "მონაცემები არასრულია" }, { status: 400 });
    const message = await prisma.message.create({ data: { conversationId, senderId: payload.userId, content } });
    await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
