import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const shopId = searchParams.get("shopId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const where: any = { isActive: true };
    if (q) where.name = { contains: q };
    if (category) where.categoryId = category;
    if (shopId) where.shopId = shopId;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (featured === "true") where.isFeatured = true;

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "rating") orderBy = { rating: "desc" };
    if (sort === "sold") orderBy = { soldCount: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: { category: true, shop: true },
      }),
      prisma.product.count({ where }),
    ]);

    const mapped = products.map((p) => ({
      ...p, images: JSON.parse(p.images as string), features: JSON.parse(p.features as string),
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ products: mapped, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ message: "შეცდომა პროდუქტების მიღებისას" }, { status: 500 });
  }
}
