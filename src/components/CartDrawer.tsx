"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXMark, HiOutlineTrash, HiOutlineMinus, HiOutlinePlus } from "react-icons/hi2";
import { ge } from "@/lib/ge";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, parseJsonArray } from "@/lib/utils";

export default function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">{ge.cart.title} ({getItemCount()})</h2>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-lg mb-4">🛒</p>
                  <p className="text-gray-500">{ge.cart.empty}</p>
                </div>
              ) : (
                items.map((item) => {
                  const images = parseJsonArray<string>(item.product.images as any);
                  const price = item.product.discountPrice || item.product.price;
                  return (
                    <div key={item.product.id} className="flex gap-3 glass-card p-3">
                      <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                        {images.length > 0 ? (
                          <Image src={images[0]} alt={item.product.name} width={80} height={80} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 truncate">{item.product.name}</h3>
                        <p className="text-primary font-bold text-sm mb-2">{formatPrice(price)}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button onClick={() => item.quantity > 1 && updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50 transition-colors">
                              <HiOutlineMinus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50 transition-colors">
                              <HiOutlinePlus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.product.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{ge.cart.total}</span>
                  <span className="font-bold text-lg text-primary">{formatPrice(getTotal())}</span>
                </div>
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full justify-center text-base py-3"
                >
                  {ge.cart.checkout}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
