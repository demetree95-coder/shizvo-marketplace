import { createClient } from "@libsql/client";
import crypto from "crypto";
import "dotenv/config";

const tursoUrl = process.env.TURSO_DB_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set in .env");
  process.exit(1);
}

const db = createClient({ url: tursoUrl, authToken: tursoToken });

async function run() {
  const now = new Date().toISOString();

  // 1. Add/update the coupon
  const existing = await db.execute({ sql: "SELECT id FROM Coupon WHERE code = 'RAAMBAVIASHECHEMA'", args: [] });
  if (existing.rows.length === 0) {
    await db.execute({
      sql: "INSERT INTO Coupon (id, code, discount, type, maxUses, usedCount, expiresAt, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), "RAAMBAVIASHECHEMA", 15, "percentage", 1000, 0, "2027-12-31T23:59:59.000Z", 1, now],
    });
    console.log("✅ Coupon added");
  } else {
    console.log("ℹ️  Coupon already exists");
  }

  // 2. Update product images and ensure isActive=1
  const productImages = [
    "https://images.unsplash.com/photo-1758398013809-fc909955bd76?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1569322977266-acff659212fd?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1575718120842-54e388d8cc6f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1511025998370-7d59f82e9c8f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544244015-9c72fd9c866d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-oZEuOtv8KA0?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1741250782029-2770cfaf666c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-XlKAu2sSpic?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-i8OruGmFXtw?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1646239646963-b0b9be56d6b5?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-Kf6UgCx5mb8?w=400&h=400&fit=crop",
  ];

  const products = await db.execute({ sql: "SELECT id, slug FROM Product ORDER BY slug", args: [] });
  console.log(`📦 Found ${products.rows.length} products`);

  for (let i = 0; i < products.rows.length && i < productImages.length; i++) {
    const img = JSON.stringify([productImages[i]]);
    await db.execute({
      sql: "UPDATE Product SET images = ?, isActive = 1 WHERE id = ?",
      args: [img, products.rows[i].id],
    });
    console.log(`  ✅ Updated: ${products.rows[i].slug}`);
  }

  console.log("\n✅ Remote DB update complete!");
  db.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
