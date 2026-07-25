"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineShoppingCart, HiOutlineCreditCard, HiOutlineMapPin, HiOutlineCheck, HiOutlineXMark, HiOutlineLockClosed } from "react-icons/hi2";
import { useT } from "@/lib/locale";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, parseJsonArray } from "@/lib/utils";
import toast from "react-hot-toast";

function groupByShop(items: any[]) {
  const map = new Map<string, { shop: any; items: any[]; total: number }>();
  for (const item of items) {
    const shopId = item.product.shopId;
    if (!map.has(shopId)) {
      map.set(shopId, { shop: item.product.shop || { id: shopId, name: "მაღაზია" }, items: [], total: 0 });
    }
    const group = map.get(shopId)!;
    const price = item.product.discountPrice || item.product.price;
    group.items.push({ productId: item.product.id, quantity: item.quantity, price });
    group.total += price * item.quantity;
  }
  return Array.from(map.values());
}

function formatCardNumber(val: string) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
}

function CardForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const t = useT();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = number.replace(/\s/g, "");
    if (cleanNumber.length < 13 || expiry.length < 5 || cvv.length < 3 || !name.trim()) {
      toast.error(t.cart.invalidCard);
      return;
    }
    onSubmit({ cardNumber: cleanNumber, cardholderName: name, expiry, cvv });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.cart.cardNumber}</label>
        <input type="text" value={number} onChange={e => setNumber(formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} className="input-field font-mono tracking-wider" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.cart.cardholderName}</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="JOE DOE" className="input-field uppercase" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.cart.expiryDate}</label>
          <input type="text" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} className="input-field font-mono" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.cart.cvv}</label>
          <input type="text" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" maxLength={4} className="input-field font-mono" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">{t.common.cancel}</button>
        <button type="submit" className="btn-primary flex-1 justify-center">{t.cart.payNow}</button>
      </div>
    </form>
  );
}

function PayPalModal({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [step, setStep] = useState<"redirect" | "login" | "confirm">("redirect");
  const [email, setEmail] = useState("");
  const t = useT();

  if (step === "redirect") {
    setTimeout(() => setStep("login"), 1500);
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto bg-[#003087] rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <p className="font-semibold text-lg">{t.cart.paypalRedirect}</p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-[#003087] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="w-10 h-10 bg-[#003087] rounded-full flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="font-bold text-lg text-[#003087]">PayPal</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ელ. ფოსტა</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">პაროლი</label>
          <input type="password" value="••••••••" disabled className="input-field bg-gray-50 text-gray-400" />
          <p className="text-xs text-gray-400 mt-1">დემო რეჟიმი - ნებისმიერი ელ.ფოსტა</p>
        </div>
        <button onClick={() => setStep("confirm")} disabled={!email.trim()} className="bg-[#003087] text-white w-full py-3 rounded-full font-semibold hover:bg-[#002870] transition-colors disabled:opacity-50">
          შესვლა
        </button>
        <button onClick={onCancel} className="text-sm text-gray-500 w-full text-center hover:underline">{t.common.cancel}</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600 pb-4 border-b">
        <HiOutlineCheck className="w-5 h-5" />
        <span className="font-semibold">PayPal-ზე წარმატებით შეხვედით</span>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
        <div className="flex justify-between"><span>გადამხდელი:</span><span className="font-medium">{email}</span></div>
        <div className="flex justify-between"><span>გადახდის მეთოდი:</span><span className="font-medium">PayPal ბალანსი</span></div>
        <div className="border-t pt-2 flex justify-between font-bold"><span>{t.cart.total}</span><span className="text-[#003087]">{formatPrice(0)}</span></div>
      </div>
      <button onClick={onSuccess} className="bg-[#003087] text-white w-full py-3 rounded-full font-semibold hover:bg-[#002870] transition-colors">
        {t.cart.payNow}
      </button>
      <button onClick={onCancel} className="text-sm text-gray-500 w-full text-center hover:underline">{t.common.cancel}</button>
    </div>
  );
}

export default function CartPage() {
  const { user } = useAuthStore();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [step, setStep] = useState<"cart" | "shipping" | "payment">("cart");
  const [address, setAddress] = useState({ fullName: "", phone: "", street: "", city: "" });
  const [paymentModal, setPaymentModal] = useState<"card" | "paypal" | null>(null);
  const [processing, setProcessing] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const t = useT();

  if (!user) { router.push("/login"); return null; }

  const total = getTotal();
  const shipping = total > 200 ? 0 : 15;
  const discountAmount = appliedCoupon ? (appliedCoupon.type === "percentage" ? Math.round(total * appliedCoupon.discount / 100 * 100) / 100 : appliedCoupon.discount) : 0;
  const finalTotal = Math.max(0, total + shipping - discountAmount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.message); setAppliedCoupon(null); return; }
      setAppliedCoupon(data.coupon);
      toast.success(`კუპონი გამოყენებულია! ${data.coupon.discount}% ფასდაკლება`);
    } catch {
      setCouponError("შეცდომა კუპონის შემოწმებისას");
    } finally {
      setCouponLoading(false);
    }
  };

  const createOrders = async () => {
    setProcessing(true);
    const shopGroups = groupByShop(items);
    const created: any[] = [];
    try {
      for (const group of shopGroups) {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: group.items,
            shopId: group.shop.id,
            address: { fullName: address.fullName, phone: address.phone, street: address.street, city: address.city },
            note: null,
            shipping: total > 200 ? 0 : 15,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
          }),
        });
        if (!res.ok) throw new Error("Order creation failed");
        const data = await res.json();
        created.push(data.order);
      }
      clearCart();
      setAppliedCoupon(null);
      setCouponCode("");
      setCompletedOrders(created);
      toast.success(t.cart.paymentSuccess);
    } catch {
      toast.error(t.cart.paymentFailed);
    } finally {
      setProcessing(false);
    }
  };

  if (completedOrders.length > 0) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
        <div className="container-custom py-16 text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <HiOutlineCheck className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t.cart.orderPlaced}</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">{t.cart.orderConfirmed}</p>
          <div className="max-w-md mx-auto space-y-3 mb-8">
            {completedOrders.map((o) => (
              <div key={o.id} className="glass-card p-4 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs text-gray-500">{t.cart.orderNumber}</p>
                  <p className="font-mono font-semibold">{o.orderNumber}</p>
                </div>
                <span className="text-primary font-bold">{formatPrice(o.total)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => router.push("/products")} className="btn-primary">{t.cart.continueShopping}</button>
            <button onClick={() => router.push("/orders")} className="btn-secondary">{t.cart.viewOrder}</button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step === "cart") {
    return (
      <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
        <div className="container-custom py-16 text-center">
          <p className="text-6xl mb-4">🛒</p>
          <h1 className="text-2xl font-bold mb-2">{t.cart.title}</h1>
          <p className="text-gray-500 mb-6">{t.cart.empty}</p>
          <button onClick={() => router.push("/products")} className="btn-primary">{t.cart.continue}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <div className="flex items-center gap-1 sm:gap-3 mb-8 overflow-x-auto scrollbar-hide">
          {["cart", "shipping", "payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${step === s ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>{i + 1}</div>
              <span className={`text-xs sm:text-sm whitespace-nowrap ${step === s ? "font-semibold" : "text-gray-400"}`}>{s === "cart" ? t.cart.title : s === "shipping" ? t.profile.addAddress : t.cart.checkout}</span>
              {i < 2 && <div className="w-4 sm:w-8 h-px bg-gray-200 mx-1 sm:mx-2" />}
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
                          <button onClick={() => removeItem(item.product.id)} className="text-sm text-red-500 hover:text-red-600">{t.cart.remove}</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => setStep("shipping")} className="btn-primary w-full justify-center mt-4">{t.cart.continue}</button>
              </motion.div>
            )}

            {step === "shipping" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><HiOutlineMapPin className="w-5 h-5" /> {t.profile.addAddress}</h2>
                <div className="space-y-4">
                  <input type="text" placeholder={t.profile.fullName} value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} className="input-field" />
                  <input type="tel" placeholder={t.profile.phone} value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} className="input-field" />
                  <input type="text" placeholder={t.profile.street} value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="input-field" />
                  <input type="text" placeholder={t.profile.city} value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="input-field" />
                  <button onClick={() => setStep("payment")} className="btn-primary w-full justify-center">{t.cart.continue}</button>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><HiOutlineCreditCard className="w-5 h-5" /> გადახდა</h2>
                <p className="text-sm text-gray-500 mb-6">აირჩიეთ გადახდის მეთოდი</p>
                <div className="space-y-3">
                  <button onClick={() => setPaymentModal("card")} className="w-full p-4 border-2 border-primary/20 rounded-xl hover:border-primary transition-colors flex items-center gap-4">
                    <div className="w-14 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">VISA</div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{t.cart.cardPayment}</p>
                      <p className="text-xs text-gray-500">Visa / Mastercard / American Express</p>
                    </div>
                    <HiOutlineLockClosed className="w-4 h-4 text-gray-300 ml-auto" />
                  </button>
                  <button onClick={() => setPaymentModal("paypal")} className="w-full p-4 border-2 border-primary/20 rounded-xl hover:border-primary transition-colors flex items-center gap-4">
                    <div className="w-14 h-10 bg-[#003087] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">PayPal</div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{t.cart.paypal}</p>
                      <p className="text-xs text-gray-500">{t.cart.paypalInfo}</p>
                    </div>
                    <HiOutlineLockClosed className="w-4 h-4 text-gray-300 ml-auto" />
                  </button>
                  <button onClick={createOrders} disabled={processing} className="w-full p-4 border-2 border-primary/20 rounded-xl hover:border-primary transition-colors flex items-center gap-4">
                    <div className="w-14 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-sm">₾</div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{t.cart.cash}</p>
                      <p className="text-xs text-gray-500">{t.cart.cashInfo}</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="glass-card p-6 h-fit">
            <h3 className="font-semibold mb-4">{t.cart.orderSummary}</h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="flex gap-2">
                <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setAppliedCoupon(null); setCouponError(""); }} placeholder={t.cart.coupon} disabled={!!appliedCoupon} className="input-field text-sm flex-1 uppercase" />
                {appliedCoupon ? (
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); setCouponError(""); }} className="btn-secondary text-sm px-3 whitespace-nowrap">{t.common.cancel}</button>
                ) : (
                  <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()} className="btn-primary text-sm px-3 whitespace-nowrap">{couponLoading ? "..." : t.cart.applyCoupon}</button>
                )}
              </div>
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              {appliedCoupon && <p className="text-xs text-green-600 mt-1">✅ {appliedCoupon.discount}% {t.cart.discount}</p>}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">{t.cart.subtotal}</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">{t.cart.shipping}</span><span>{shipping === 0 ? "უფასო" : formatPrice(shipping)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between"><span className="text-gray-500">{t.cart.discount}</span><span className="text-green-600">-{formatPrice(discountAmount)}</span></div>}
              <div className="border-t pt-3 flex justify-between font-bold"><span>{t.cart.total}</span><span className="text-primary">{formatPrice(finalTotal)}</span></div>
            </div>
            {total > 200 && <p className="text-xs text-green-600 mt-2">✅ უფასო მიწოდება 200₾-ზე მეტი შეკვეთებისთვის</p>}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {paymentModal === "card" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setPaymentModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">VISA</div>
                <h3 className="font-bold text-lg">{t.cart.cardPayment}</h3>
              </div>
              <CardForm onSubmit={async () => { await createOrders(); setPaymentModal(null); }} onCancel={() => setPaymentModal(null)} />
              {processing && (
                <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500">{t.cart.processingPayment}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {paymentModal === "paypal" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setPaymentModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <PayPalModal onSuccess={async () => { await createOrders(); setPaymentModal(null); }} onCancel={() => setPaymentModal(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
