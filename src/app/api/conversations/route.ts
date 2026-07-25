import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ userId: payload.userId }, { shop: { userId: payload.userId } }] },
      include: { user: { select: { id: true, fullName: true, avatar: true } }, shop: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const { shopId, content } = await request.json();
    let conversation = await prisma.conversation.findUnique({ where: { userId_shopId: { userId: payload.userId, shopId } } });
    if (!conversation) conversation = await prisma.conversation.create({ data: { userId: payload.userId, shopId } });
    if (content) {
      await prisma.message.create({ data: { conversationId: conversation.id, senderId: payload.userId, content } });
    }
    const messages = await prisma.message.findMany({ where: { conversationId: conversation.id }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({ conversation, messages });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}
