import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TURSO_DB_URL = process.env.TURSO_DB_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

function getClient() {
  if (TURSO_DB_URL) {
    return createClient({ url: TURSO_DB_URL, authToken: TURSO_AUTH_TOKEN });
  }
  const dbPath = path.resolve(__dirname, "..", "dev.db");
  return createClient({ url: `file:///${dbPath.replace(/\\/g, "/")}` });
}

const db = getClient();

function uid() { return crypto.randomBytes(12).toString("hex"); }

async function run() {
  const now = new Date().toISOString();
  const adminPassword = await bcrypt.hash("demetre!2$45", 12);
  const vendorPassword = await bcrypt.hash("password123", 12);

  const adminId = uid();
  await db.execute({
    sql: "INSERT OR IGNORE INTO User (id, email, password, fullName, phone, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [adminId, "demetree95@gmail.com", adminPassword, "ადმინი", "599111111", "ADMIN", now, now],
  });

  const vendorData = [
    { email: "shop1@markaz.ge", name: "გიორგი მაისურაძე", phone: "599123456" },
    { email: "shop2@markaz.ge", name: "ნინო ბერიძე", phone: "599234567" },
    { email: "shop3@markaz.ge", name: "დავით კვარაცხელია", phone: "599345678" },
  ];

  const vendorIds = [];
  for (const v of vendorData) {
    const id = uid();
    await db.execute({
      sql: "INSERT OR IGNORE INTO User (id, email, password, fullName, phone, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [id, v.email, vendorPassword, v.name, v.phone, "VENDOR", now, now],
    });
    vendorIds.push(id);
  }

  const userId = uid();
  await db.execute({
    sql: "INSERT OR IGNORE INTO User (id, email, password, fullName, phone, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [userId, "user@markaz.ge", vendorPassword, "მომხმარებელი", "599999999", "USER", now, now],
  });

  const cats = [
    { name: "ელექტრონიკა", slug: "electronics", icon: "💻", order: 1 },
    { name: "ტანსაცმელი", slug: "clothing", icon: "👕", order: 2 },
    { name: "აქსესუარები", slug: "accessories", icon: "⌚", order: 3 },
    { name: "სახლი და ბაღი", slug: "home-garden", icon: "🏠", order: 4 },
    { name: "სპორტი", slug: "sports", icon: "⚽", order: 5 },
    { name: "სილამაზე", slug: "beauty", icon: "💄", order: 6 },
    { name: "სათამაშოები", slug: "toys", icon: "🧸", order: 7 },
    { name: "წიგნები", slug: "books", icon: "📚", order: 8 },
  ];

  const catIds = [];
  for (const c of cats) {
    const id = uid();
    await db.execute({
      sql: 'INSERT OR IGNORE INTO Category (id, name, slug, icon, "order", createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, c.name, c.slug, c.icon, c.order, now],
    });
    catIds.push(id);
  }

  const yearEnd = new Date("2027-12-31").toISOString();

  const shopData = [
    { userId: vendorIds[0], name: "ტექნომარკეტი", slug: "teqnometri", desc: "საუკეთესო ელექტრონიკა საქართველოში", featured: 1 },
    { userId: vendorIds[1], name: "მოდის ბუტიკი", slug: "modis-butiki", desc: "თანამედროვე ტანსაცმელი და აქსესუარები", featured: 1 },
    { userId: vendorIds[2], name: "სპორტული სამყარო", slug: "sportuli-samyaro", desc: "სპორტული ინვენტარი და ტანსაცმელი", featured: 0 },
  ];

  const shopIds = [];
  for (const s of shopData) {
    const id = uid();
    await db.execute({
      sql: "INSERT OR IGNORE INTO Shop (id, name, slug, description, isFeatured, userId, subscriptionPlan, subscriptionEnd, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [id, s.name, s.slug, s.desc, s.featured, s.userId, "PREMIUM", yearEnd, now, now],
    });
    shopIds.push(id);
  }

  const products = [
    { shop: 0, cat: 0, name: "iPhone 15 Pro", slug: "iphone-15-pro", price: 3499, discount: 2999, stock: 15, rating: 4.8, reviews: 42, sold: 128 },
    { shop: 0, cat: 0, name: "MacBook Air M3", slug: "macbook-air-m3", price: 4499, discount: 3999, stock: 8, rating: 4.9, reviews: 28, sold: 67 },
    { shop: 0, cat: 0, name: "Samsung Galaxy S24", slug: "samsung-galaxy-s24", price: 2799, stock: 20, rating: 4.6, reviews: 35, sold: 95 },
    { shop: 0, cat: 0, name: "AirPods Pro 2", slug: "airpods-pro-2", price: 799, discount: 649, stock: 30, rating: 4.7, reviews: 56, sold: 210 },
    { shop: 0, cat: 0, name: "iPad Air", slug: "ipad-air", price: 2499, stock: 12, rating: 4.5, reviews: 19, sold: 45 },
    { shop: 1, cat: 1, name: "ქართული სვიტერი", slug: "qartuli-sviteri", price: 129, stock: 50, rating: 4.4, reviews: 15, sold: 89 },
    { shop: 1, cat: 1, name: "კაბა - ელეგანტური", slug: "kaba-eleganuri", price: 199, discount: 149, stock: 25, rating: 4.6, reviews: 22, sold: 156 },
    { shop: 1, cat: 2, name: "ხელის ჩანთა", slug: "xelis-chanta", price: 89, stock: 40, rating: 4.3, reviews: 8, sold: 34 },
    { shop: 1, cat: 1, name: "ჯინსის ქურთუკი", slug: "jinsis-qurtuki", price: 159, discount: 119, stock: 18, rating: 4.7, reviews: 31, sold: 203 },
    { shop: 2, cat: 4, name: "სავარჯიშო ფეხსაცმელი", slug: "savajisho-pexsacmeli", price: 249, stock: 35, rating: 4.5, reviews: 27, sold: 178 },
    { shop: 2, cat: 4, name: "იოგას ხალიჩა", slug: "yogasa-xalicha", price: 59, stock: 60, rating: 4.2, reviews: 12, sold: 67 },
    { shop: 2, cat: 4, name: "სპორტული ბოთლი", slug: "sportuli-botli", price: 35, stock: 100, rating: 4.1, reviews: 6, sold: 45 },
  ];

  const insertProduct = `INSERT INTO Product (id, name, slug, description, price, discountPrice, stock, images, features, deliveryInfo, sku, isActive, isFeatured, rating, reviewCount, soldCount, shopId, categoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const p of products) {
    const id = uid();
    const images = JSON.stringify([`https://picsum.photos/seed/${p.slug}/400/400`]);
    const features = JSON.stringify(["მაღალი ხარისხი", "ორიგინალი პროდუქტი", "სწრაფი მიწოდება", "გარანტია"]);
    const desc = `${p.name} - მაღალი ხარისხის პროდუქტი საუკეთესო ფასად. შეიძინეთ მარკეტზე!`;
    const sku = `SKU-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    await db.execute({
      sql: insertProduct,
      args: [id, p.name, p.slug, desc, p.price, p.discount || null, p.stock, images, features, "მიწოდება მთელი საქართველოს მასშტაბით 2-3 დღეში", sku, Math.random() > 0.5 ? 1 : 0, p.rating, p.reviews, p.sold, shopIds[p.shop], catIds[p.cat], now, now],
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("👤 Admin: demetree95@gmail.com / demetre!2$45");
  console.log("🏪 Vendors: shop1@markaz.ge, shop2@markaz.ge, shop3@markaz.ge / password123");
  console.log("👤 User: user@markaz.ge / password123");

  db.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
