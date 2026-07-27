"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineXMark, HiOutlineEye } from "react-icons/hi2";
import { useT } from "@/lib/locale";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, parseJsonArray } from "@/lib/utils";
import { uploadFileToStorage } from "@/lib/firebase";

export default function DashboardProductsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", discountPrice: "", stock: "0", sku: "", categoryId: "", images: "", features: "", deliveryInfo: "" });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const t = useT();

  useEffect(() => {
    if (!user || user.role === "USER") { router.push("/"); return; }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/shop/products"),
        fetch("/api/categories"),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [uploadingImages, setUploadingImages] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploadingImages(true);
    try {
      await Promise.all(Array.from(files).map(async (file) => {
        const ext = file.name.split(".").pop() || "jpg";
        const url = await uploadFileToStorage(file, `products/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`);
        setUploadedImages(prev => [...prev, url]);
      }));
      toast.success("სურათები აიტვირთა");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allImages = [...uploadedImages, ...(form.images ? form.images.split(",").map(s => s.trim()).filter(Boolean) : [])];
    try {
      const res = await fetch("/api/shop/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          stock: parseInt(form.stock),
          images: allImages,
          features: form.features ? form.features.split(",").map(s => s.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(t.dashboard.addProduct);
      setShowAddForm(false);
      setForm({ name: "", description: "", price: "", discountPrice: "", stock: "0", sku: "", categoryId: "", images: "", features: "", deliveryInfo: "" });
      setUploadedImages([]);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-gray-50">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{t.dashboard.products}</h1>
          <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm">
            <HiOutlinePlus className="w-4 h-4" /> {t.dashboard.addProduct}
          </button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{t.dashboard.addProduct}</h3>
                  <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><HiOutlineXMark className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="input-field md:col-span-2" placeholder="პროდუქტის სახელი *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <textarea className="input-field md:col-span-2" rows={3} placeholder="აღწერა" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <input className="input-field" type="number" step="0.01" placeholder="ფასი *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  <input className="input-field" type="number" step="0.01" placeholder="ფასდაკლებული ფასი" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
                  <input className="input-field" type="number" placeholder="მარაგის რაოდენობა" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                  <input className="input-field" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                  <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                    <option value="">აირჩიეთ კატეგორია</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">სურათები</label>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImages} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50" />
                    {uploadingImages && <p className="text-xs text-primary mt-1">იტვირთება...</p>}
                    {uploadedImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uploadedImages.map((img, i) => (
                          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                            <Image src={img} alt={`Upload ${i}`} fill className="object-cover" />
                            <button type="button" onClick={() => removeUploadedImage(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><HiOutlineXMark className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input className="input-field mt-2" placeholder="ან URL-ები (მძიმით გამოყოფილი, თუ ატვირთვა არ გინდათ)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
                  </div>
                  <input className="input-field" placeholder="მახასიათებლები (მძიმით გამოყოფილი)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
                  <textarea className="input-field md:col-span-2" rows={2} placeholder="მიწოდების ინფორმაცია" value={form.deliveryInfo} onChange={(e) => setForm({ ...form, deliveryInfo: e.target.value })} />
                  <div className="md:col-span-2 flex gap-3">
                    <button type="submit" className="btn-primary">{t.common.save}</button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">{t.common.cancel}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="glass-card p-4 animate-pulse"><div className="h-40 bg-gray-200 rounded-xl mb-4" /><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
              return (
                <div key={product.id} className="glass-card overflow-hidden">
                  <div className="relative aspect-video bg-gray-50">
                    {images.length > 0 ? <Image src={images[0]} alt={product.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-primary font-bold">{formatPrice(product.discountPrice || product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`badge ${product.isActive ? "badge-green" : "badge-red"}`}>{product.isActive ? "აქტიური" : "არააქტიური"}</span>
                      <span className="text-xs text-gray-500">მარაგი: {product.stock}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-4xl mb-4">📦</p>
                <p className="text-gray-500 mb-4">{t.products.noProducts}</p>
                <button onClick={() => setShowAddForm(true)} className="btn-primary">{t.dashboard.addProduct}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
