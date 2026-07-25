import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ChatWidget from "@/components/ChatWidget";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "მარკეტი - ქართული ონლაინ მარკეტპლეისი",
  description: "მარკეტი - ქართული ონლაინ მარკეტპლეისი, სადაც ყველა მაღაზია ერთ სივრცეშია",
  keywords: "მარკეტი, ონლაინ მაღაზია, მარკეტპლეისი, ქართული, ყიდვა, გაყიდვა",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <ChatWidget />
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "12px", background: "#0f172a", color: "#fff", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}
