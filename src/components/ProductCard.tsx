"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { HiOutlineHeart, HiOutlineShoppingCart, HiStar } from "react-icons/hi2";
import { ge } from "@/lib/ge";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calculateDiscount, truncate, parseJsonArray } from "@/lib/utils";
import { ProductType } from "@/types";
import toast from "react-hot-toast";

interface Props {
  product: ProductType;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const images = parseJsonArray<string>(product.images as any);
  const discount = product.discountPrice ? calculateDiscount(product.price, product.discountPrice) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group glass-card overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        {images.length > 0 ? (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No Image</div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 badge badge-red">{discount}% {ge.products.discount}</span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-1.5 rounded-full text-sm font-semibold">{ge.products.outOfStock}</span>
          </div>
        )}
        <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100">
          <HiOutlineHeart className="w-4 h-4 text-gray-600" />
        </button>
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm mb-1 hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        {product.shop && (
          <Link href={`/shop/${product.shop.id}`} className="text-xs text-gray-500 hover:text-primary mb-2 block">
            {product.shop.name}
          </Link>
        )}
        <div className="flex items-center gap-1 mb-2">
          <HiStar className="w-3.5 h-3.5 text-yellow-400 fill-current" />
          <span className="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.discountPrice ? (
              <>
                <span className="font-bold text-primary">{formatPrice(product.discountPrice)}</span>
                <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-bold text-primary">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); toast.success("დაემატა კალათაში!"); }}
            className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <HiOutlineShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
