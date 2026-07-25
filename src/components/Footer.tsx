import Link from "next/link";
import { ge } from "@/lib/ge";
import { FiFacebook, FiInstagram, FiYoutube, FiMessageCircle } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white mt-auto">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-extrabold gradient-text mb-4">მარკეტი</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{ge.footer.description}</p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <FiFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <FiInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <FiYoutube className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                <FiMessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">{ge.footer.quickLinks}</h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: ge.nav.home },
                { href: "/products", label: ge.nav.categories },
                { href: "/categories", label: ge.nav.shops },
                { href: "/about", label: ge.nav.about },
                { href: "/contact", label: ge.nav.contact },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">{ge.footer.forSellers}</h4>
            <ul className="space-y-3">
              {[
                { href: "/register", label: ge.nav.register },
                { href: "/dashboard", label: ge.nav.dashboard },
                { href: "/dashboard/settings", label: ge.shop.settings },
                { href: "/contact", label: ge.nav.contact },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">{ge.footer.forBuyers}</h4>
            <ul className="space-y-3">
              {[
                { href: "/cart", label: ge.nav.cart },
                { href: "/orders", label: ge.nav.orders },
                { href: "/wishlist", label: ge.nav.wishlist },
                { href: "/faq", label: ge.footer.faq },
                { href: "/help", label: ge.footer.help },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 text-sm hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">&copy; 2026 მარკეტი. {ge.footer.rights}</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-gray-500 text-sm hover:text-primary transition-colors">{ge.footer.terms}</Link>
            <Link href="/privacy" className="text-gray-500 text-sm hover:text-primary transition-colors">{ge.footer.privacy}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
