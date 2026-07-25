"use client";
import Link from "next/link";
import Image from "next/image";
import { HiStar } from "react-icons/hi2";
import { ShopType } from "@/types";
import { useT } from "@/lib/locale";

interface Props {
  shop: ShopType;
  index?: number;
}

export default function ShopCard({ shop, index = 0 }: Props) {
  const t = useT();
  return (
    <Link
      href={`/shop/${shop.id}`}
      className="glass-card p-6 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 group"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-105 transition-transform">
        {shop.logo ? (
          <Image src={shop.logo} alt={shop.name} width={80} height={80} className="object-cover w-full h-full" />
        ) : (
          <span className="text-2xl font-bold text-primary">{shop.name.charAt(0)}</span>
        )}
      </div>
      <h3 className="font-semibold mb-1">{shop.name}</h3>
      <div className="flex items-center gap-1 mb-2">
        <HiStar className="w-4 h-4 text-yellow-400 fill-current" />
        <span className="text-sm text-gray-600">{shop.rating.toFixed(1)}</span>
      </div>
      <p className="text-xs text-gray-500">{shop._count?.products || 0} {t.shop.products}</p>
      {shop.isFeatured && (
        <span className="mt-2 badge badge-blue">გამორჩეული</span>
      )}
    </Link>
  );
}
