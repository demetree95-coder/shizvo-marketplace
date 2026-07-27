import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const shop = await prisma.shop.findUnique({ where: { userId: payload.userId } });
    if (!shop) return NextResponse.json({ message: "მაღაზია არ მოიძებნა" }, { status: 404 });
    const products = await prisma.product.findMany({
      where: { shopId: shop.id }, include: { category: true }, orderBy: { createdAt: "desc" },
    });
    const mapped = products.map((p) => ({ ...p, images: JSON.parse(p.images as string), features: JSON.parse(p.features as string) }));
    return NextResponse.json({ products: mapped });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthUser(request);
    if (!payload) return NextResponse.json({ message: "არაავტორიზებული" }, { status: 401 });
    const shop = await prisma.shop.findUnique({ where: { userId: payload.userId } });
    if (!shop) return NextResponse.json({ message: "მაღაზია არ მოიძებნა" }, { status: 404 });
    if (shop.isBlocked) return NextResponse.json({ message: "მაღაზია დაბლოკილია" }, { status: 403 });
    const data = await request.json();
    if (!data.name || !data.price || !data.categoryId) {
      return NextResponse.json({ message: "სახელი, ფასი და კატეგორია სავალდებულოა" }, { status: 400 });
    }
    let slug = slugify(data.name);
    const slugExists = await prisma.product.findFirst({ where: { slug, shopId: shop.id } });
    if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;
    const product = await prisma.product.create({
      data: {
        shopId: shop.id, name: data.name, slug, description: data.description || null,
        price: parseFloat(data.price), stock: parseInt(data.stock) || 0, sku: data.sku || null,
        images: JSON.stringify(data.images || []), video: data.video || null,
        features: JSON.stringify(data.features || []), deliveryInfo: data.deliveryInfo || null,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა პროდუქტის შექმნისას" }, { status: 500 });
  }
}
