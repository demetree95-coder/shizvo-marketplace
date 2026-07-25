"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HiOutlineShoppingCart, HiOutlineCreditCard, HiOutlineMapPin, HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";
import { ge } from "@/lib/ge";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, parseJsonArray } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CartPage() {
  const { user } = useAuthStore();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const router = useRouter();
  const [step, setStep] = useState<"cart" | "shipping" | "payment">("cart");
  const [address, setAddress] = useState({ fullName: "", phone: "", street: "", city: "" });

  if (!user) { router.push("/login"); return null; }

  const total = getTotal();
  const shipping = total > 200 ? 0 : 15;

  if (items.length === 0 && step === "cart") {
    return (
      <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
        <div className="container-custom py-16 text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h1 className="text-2xl font-bold mb-2">{ge.cart.title}</h1>
          <p className="text-gray-500 mb-6">{ge.cart.empty}</p>
          <button onClick={() => router.push("/products")} className="btn-primary">{ge.cart.continue}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <div className="flex items-center gap-3 mb-8">
          {["cart", "shipping", "payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>{i + 1}</div>
              <span className={`text-sm ${step === s ? "font-semibold" : "text-gray-400"}`}>{s === "cart" ? "კალათა" : s === "shipping" ? "მისამართი" : "გადახდა"}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {step === "cart" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {items.map((item) => {
                  const images = parseJsonArray<string>(item.product.images as any);
                  const price = item.product.discountPrice || item.product.price;
                  return (
                    <div key={item.product.id} className="glass-card p-4 flex gap-4">
                      <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {images.length > 0 ? <img src={images[0]} alt={item.product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-primary font-bold">{formatPrice(price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg">
                            <button onClick={() => item.quantity > 1 && updateQuantity(item.product.id, item.quantity - 1)} className="p-2 hover:bg-gray-50"><HiOutlineXMark className="w-3 h-3" /></button>
                            <span className="px-4 text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 hover:bg-gray-50"><HiOutlineCheck className="w-3 h-3" /></button>
                          </div>
                          <button onClick={() => removeItem(item.product.id)} className="text-sm text-red-500 hover:text-red-600">{ge.cart.remove}</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => setStep("shipping")} className="btn-primary w-full justify-center mt-4">{ge.cart.continue}</button>
              </motion.div>
            )}

            {step === "shipping" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><HiOutlineMapPin className="w-5 h-5" /> {ge.profile.addAddress}</h2>
                <div className="space-y-4">
                  <input type="text" placeholder={ge.profile.fullName} value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} className="input-field" />
                  <input type="tel" placeholder={ge.profile.phone} value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} className="input-field" />
                  <input type="text" placeholder={ge.profile.street} value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="input-field" />
                  <input type="text" placeholder={ge.profile.city} value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="input-field" />
                  <button onClick={() => setStep("payment")} className="btn-primary w-full justify-center">{ge.cart.continue}</button>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><HiOutlineCreditCard className="w-5 h-5" /> გადახდა</h2>
                <p className="text-sm text-gray-500 mb-6">აირჩიეთ გადახდის მეთოდი</p>
                <div className="space-y-3">
                  <button onClick={() => toast.success("გადახდა წარმატებით დასრულდა!")} className="w-full p-4 border-2 border-primary/20 rounded-xl hover:border-primary transition-colors flex items-center gap-4">
                    <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">ბარათით გადახდა</p>
                      <p className="text-xs text-gray-500">Visa / Mastercard / American Express</p>
                    </div>
                  </button>
                  <button onClick={() => toast.success("გადახდა წარმატებით დასრულდა!")} className="w-full p-4 border-2 border-primary/20 rounded-xl hover:border-primary transition-colors flex items-center gap-4">
                    <div className="w-12 h-8 bg-[#003087] rounded flex items-center justify-center text-white text-xs font-bold">PP</div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">PayPal</p>
                      <p className="text-xs text-gray-500">უსაფრთხო გადახდა PayPal-ით</p>
                    </div>
                    <span className="ml-auto text-xs text-gray-400"> скоро</span>
                  </button>
                  <button onClick={() => toast.success("გადახდა წარმატებით დასრულდა!")} className="w-full p-4 border-2 border-primary/20 rounded-xl hover:border-primary transition-colors flex items-center gap-4">
                    <div className="w-12 h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">₾</div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">გადახდა ნაღდი ანგარიშსწორებით</p>
                      <p className="text-xs text-gray-500">გადაიხადეთ მიღებისას</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="glass-card p-6 h-fit">
            <h3 className="font-semibold mb-4">{ge.cart.orderSummary}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">{ge.cart.subtotal}</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{ge.cart.shipping}</span><span>{shipping === 0 ? "უფასო" : formatPrice(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{ge.cart.discount}</span><span className="text-green-600">- {formatPrice(0)}</span></div>
              <div className="border-t pt-3 flex justify-between font-bold"><span>{ge.cart.total}</span><span className="text-primary">{formatPrice(total + shipping)}</span></div>
            </div>
            {total > 200 && <p className="text-xs text-green-600 mt-2">✅ უფასო მიწოდება 200₾-ზე მეტი შეკვეთებისთვის</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
