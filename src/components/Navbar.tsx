"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useT, useLocale, Locale } from "@/lib/locale";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import {
  HiOutlineShoppingCart, HiOutlineHeart, HiOutlineBars3, HiOutlineXMark,
  HiOutlineUser, HiOutlineArrowRightOnRectangle, HiOutlineSquares2X2,
  HiOutlineChatBubbleLeftRight, HiOutlineClipboardDocumentList,
  HiOutlineMagnifyingGlass, HiOutlineSun, HiOutlineMoon,
  HiOutlineLanguage,
} from "react-icons/hi2";
import { useTheme } from "@/components/ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} className="p-2 text-gray-600 hover:text-primary transition-colors" title={theme === "light" ? "ღამის რეჟიმი" : "დღის რეჟიმი"}>
      {theme === "light" ? <HiOutlineMoon className="w-5 h-5" /> : <HiOutlineSun className="w-5 h-5" />}
    </button>
  );
}

const langLabels: Record<Locale, string> = { ka: "KA", en: "EN", ru: "RU" };

function LangToggle() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const locales: Locale[] = ["ka", "en", "ru"];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 text-gray-600 hover:text-primary transition-colors text-xs font-bold tracking-wider">
        {langLabels[locale]}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[80px] z-50" onMouseLeave={() => setOpen(false)}>
          {locales.map((l) => (
            <button key={l} onClick={() => { setLocale(l); setOpen(false); }} className={`block w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${locale === l ? "text-primary" : "text-gray-600"}`}>
              {l === "ka" ? "ქართული" : l === "en" ? "English" : "Русский"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.items.reduce((a, b) => a + b.quantity, 0));
  const t = useT();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserOpen(false); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/categories", label: t.nav.categories },
    { href: "/shops", label: t.nav.shops },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/80 dark:nav-glass shadow-sm" : "bg-transparent"
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold gradient-text">მარკეტი</span>
            </Link>
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href ? "text-primary" : "text-gray-600 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search.placeholder}
                className="input-field pl-10 pr-4 py-2 text-sm"
              />
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </form>
          </div>

          <div className="flex items-center gap-1">
            <LangToggle />
            <ThemeToggle />
            <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-primary transition-colors hidden sm:block">
              <HiOutlineHeart className="w-5 h-5" />
            </Link>

            <button onClick={() => useCartStore.getState().toggleCart()} className="relative p-2 text-gray-600 hover:text-primary transition-colors">
              <HiOutlineShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-2 p-2 text-gray-600 hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" /> : user.fullName.charAt(0)}
                  </div>
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-56 glass-card p-2 shadow-xl"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="font-semibold text-sm">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <HiOutlineUser className="w-4 h-4" /> {t.nav.profile}
                      </Link>
                      {(user.role === "VENDOR" || user.role === "ADMIN") && (
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <HiOutlineSquares2X2 className="w-4 h-4" /> {t.nav.dashboard}
                        </Link>
                      )}
                      {user.role === "ADMIN" && (
                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                          <HiOutlineSquares2X2 className="w-4 h-4" /> {t.nav.admin}
                        </Link>
                      )}
                      <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <HiOutlineClipboardDocumentList className="w-4 h-4" /> {t.nav.orders}
                      </Link>
                      <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <HiOutlineChatBubbleLeftRight className="w-4 h-4" /> {t.nav.chat}
                      </Link>
                      <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left">
                        <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> {t.nav.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">{t.nav.login}</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">{t.nav.register}</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-600">
              {mobileOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="py-4 space-y-1">
                <form onSubmit={handleSearch} className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.search.placeholder}
                    className="input-field pl-10 pr-4 py-2.5 text-sm"
                  />
                  <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                </form>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  {!user && (
                    <div className="flex gap-2 px-3 pt-2">
                      <Link href="/login" className="btn-secondary text-sm py-2 px-4 flex-1 text-center">{t.nav.login}</Link>
                      <Link href="/register" className="btn-primary text-sm py-2 px-4 flex-1 text-center">{t.nav.register}</Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
