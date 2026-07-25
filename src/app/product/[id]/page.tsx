"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineShoppingCart, HiOutlineHeart, HiStar, HiOutlineMinus, HiOutlinePlus } from "react-icons/hi2";
import { ge } from "@/lib/ge";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calculateDiscount, parseJsonArray } from "@/lib/utils";
import ReviewCard from "@/components/ReviewCard";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${id}`).then(r => r.json()).then(d => { setProduct(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!product) return <div className="min-h-screen pt-24 flex items-center justify-center"><p className="text-gray-500">{ge.products.noProducts}</p></div>;

  const images = product.images?.length > 0 ? product.images : ["/placeholder.svg"];
  const discount = product.discountPrice ? calculateDiscount(product.price, product.discountPrice) : 0;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <div className="glass-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${i === activeImage ? "border-primary" : "border-transparent"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              {product.shop && (
                <Link href={`/shop/${product.shop.id}`} className="text-sm text-primary hover:underline mb-2 block">{product.shop.name}</Link>
              )}
              <h1 className="text-2xl font-bold mb-3">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <HiStar className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">({product.reviewCount} შეფასება)</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{product.soldCount} გაყიდული</span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-bold text-primary">{formatPrice(product.discountPrice)}</span>
                    <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                    <span className="badge badge-red">{discount}%</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">{product.description}</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-xl">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-50"><HiOutlineMinus className="w-4 h-4" /></button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="p-3 hover:bg-gray-50"><HiOutlinePlus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => { addItem(product); toast.success("დაემატა კალათაში!"); }} className="btn-primary flex-1">
                  <HiOutlineShoppingCart className="w-5 h-5" /> {ge.products.addToCart}
                </button>
                <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50"><HiOutlineHeart className="w-5 h-5 text-gray-400" /></button>
              </div>
              {product.features?.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-semibold mb-2">{ge.products.features}</h3>
                  <ul className="space-y-1">
                    {product.features.map((f: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {product.reviews?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4">{ge.products.reviews} ({product.reviews.length})</h2>
            <div className="space-y-4">
              {product.reviews.map((r: any) => <ReviewCard key={r.id} review={r} />)}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
