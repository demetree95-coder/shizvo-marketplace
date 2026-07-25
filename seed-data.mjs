import { createClient } from "@libsql/client";

const turso = createClient({
  url: "libsql://shizvo-marketplace-demetre.aws-eu-west-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODQ5NzE0NzksImlkIjoiMDE5Zjk4OTUtZWMwMS03OTM1LWJlMTktZDc2OGM0NjdjZjY2Iiwia2lkIjoiNTJMT3c5UzYtT21icWd5TFZVY0ZJZU1kdW9PeXpkcENnTlFWaGNMWlpZQSIsInJpZCI6IjNkNWRiNzU4LTQ4NzctNDY4Yy1hNWZjLTdjNGMxNmVlNzA4OSJ9.1Nki-VwZh1DyM1G21AixbAiZVvsMKIiMAfWVTFjIKxk8cW-QrJAWLzpwffYykw4uzSXilYHxVYo2dv1MaV2VBA"
});

const categories = [
  { id: "cat-electronics", name: "ელექტრონიკა", slug: "electronics", icon: "📱", order: 1 },
  { id: "cat-clothing", name: "ტანსაცმელი", slug: "clothing", icon: "👕", order: 2 },
  { id: "cat-home", name: "საყოფაცხოვრებო", slug: "home", icon: "🏠", order: 3 },
  { id: "cat-beauty", name: "სილამაზე", slug: "beauty", icon: "💄", order: 4 },
  { id: "cat-sports", name: "სპორტი", slug: "sports", icon: "⚽", order: 5 },
  { id: "cat-books", name: "წიგნები", slug: "books", icon: "📚", order: 6 },
  { id: "cat-toys", name: "სათამაშოები", slug: "toys", icon: "🧸", order: 7 },
  { id: "cat-food", name: "საკვები", slug: "food", icon: "🍕", order: 8 },
];

const shopId = "shop-sample-1";
const userId = "user-sample-1";

async function seed() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    await turso.execute({
      sql: `INSERT OR IGNORE INTO Category (id, name, slug, icon, "order", createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [cat.id, cat.name, cat.slug, cat.icon, cat.order],
    });
  }

  console.log("Seeding sample user...");
  await turso.execute({
    sql: `INSERT OR IGNORE INTO User (id, email, "fullName", password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [userId, "shop@example.com", "სეიფი მაღაზია", "$2a$12$sample", "VENDOR"],
  });

  console.log("Seeding sample shop...");
  await turso.execute({
    sql: `INSERT OR IGNORE INTO Shop (id, name, slug, description, "contactEmail", "contactPhone", isFeatured, rating, totalSales, "userId", createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [shopId, "სეიფი მაღაზია", "saifi-magazia", "საუკეთესო პროდუქტები საუკეთესო ფასებში. მიწოდება მთელი საქართველოს მასშტაბით.", "info@saifi.ge", "599 12 34 56", 1, 4.8, 152, userId],
  });

  const products = [
    { name: "iPhone 15 Pro", slug: "iphone-15-pro", price: 3499, discountPrice: 3199, stock: 15, images: '["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch_BH?wid=5120&hei=2880"]', features: '["A17 Pro ჩიპი", "48MP კამერა", "256GB მეხსიერება", "6.7\" OLED ეკრანი"]', catId: "cat-electronics" },
    { name: "Samsung Galaxy S24", slug: "samsung-galaxy-s24", price: 2499, discountPrice: null, stock: 20, images: '["https://images.samsung.com/is/image/samsung/p6pim/ua/2401/gallery/ua-galaxy-s24-s921-sm-s921bzgecau-539320391"]', features: '["Snapdragon 8 Gen 3", "50MP კამერა", "128GB მეხსიერება", "6.2\" Dynamic AMOLED"]', catId: "cat-electronics" },
    { name: "MacBook Air M3", slug: "macbook-air-m3", price: 4999, discountPrice: null, stock: 8, images: '["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/macbook-air-m3-finish-select-202403?wid=5120&hei=2880"]', features: '["Apple M3 ჩიპი", "16GB RAM", "512GB SSD", "15.3\" Liquid Retina"]', catId: "cat-electronics" },
    { name: "AirPods Pro 2", slug: "airpods-pro-2", price: 799, discountPrice: 699, stock: 30, images: '["https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airpods-pro-2-hero-select-202409?wid=5120&hei=2880"]', features: '["Active Noise Cancellation", "Adaptive Audio", "USB-C", "6 საათი მუშაობა"]', catId: "cat-electronics" },
    { name: "კაბა ყავისფერი", slug: "kaba-qavisteri", price: 149, discountPrice: 99, stock: 25, images: '["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"]', features: '["100% ბამბა", "M-XL ზომები", "საზაფხულო", "ნატურალური ფერი"]', catId: "cat-clothing" },
    { name: "ჯინსი რომაული", slug: "jinsi-romauli", price: 199, discountPrice: null, stock: 18, images: '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"]', features: '["Stretch დენიმი", "რეგულარული fit", "ღილებიანი", "სქელი ქსოვილი"]', catId: "cat-clothing" },
    { name: "ეკო-ჩანთა", slug: "eko-chanta", price: 49, discountPrice: 39, stock: 50, images: '["https://images.unsplash.com/photo-1594226801341-41427b4e5a8e?w=800"]', features: '["100% ორგანული ბამბა", "დიდი მოცულობა", "მრავალფერი", "30x40 სმ"]', catId: "cat-clothing" },
    { name: "სამზარეულოს კომპლექტი", slug: "samzareulos-komplekti", price: 89, discountPrice: null, stock: 12, images: '["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"]', features: '["უჟანგავი ფოლადი", "10 ცალი", "ტეფლონის საფარი", "ინდუქციისთვის"]', catId: "cat-home" },
    { name: "LED ნათურა ჭკვიანი", slug: "led-natura-chkviani", price: 59, discountPrice: 45, stock: 40, images: '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"]', features: '["WiFi", "16 მილიონი ფერი", "Alexa/Google", "დისტანციური მართვა"]', catId: "cat-home" },
    { name: "სახის კრემი", slug: "saxis-kremi", price: 35, discountPrice: null, stock: 45, images: '["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800"]', features: '["ჰიალურონის მჟავა", "ვიტამინი C", "50 მლ", "ყველა ტიპის კანისთვის"]', catId: "cat-beauty" },
  ];

  console.log("Seeding products...");
  for (const p of products) {
    const pid = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await turso.execute({
      sql: `INSERT INTO Product (id, name, slug, price, discountPrice, stock, images, features, description, "shopId", "categoryId", rating, "reviewCount", "soldCount", isActive, isFeatured, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [pid, p.name, p.slug, p.price, p.discountPrice, p.stock, p.images, p.features, `ეს არის ${p.name} - ხარისხიანი პროდუქტი ხელმისაწვდომ ფასად. მიწოდება მთელი საქართველოს მასშტაბით 2-3 დღეში.`, shopId, p.catId, +(3 + Math.random() * 2).toFixed(1), Math.floor(Math.random() * 50), Math.floor(Math.random() * 200), 1, Math.random() > 0.6 ? 1 : 0],
    });
  }

  console.log(`✅ Seeded:`);
  console.log(`  - ${categories.length} categories`);
  console.log(`  - 1 sample shop (need real login to use)`);
  console.log(`  - ${products.length} sample products`);
  console.log(`\n⚠️  The sample user "shop@example.com" has a fake password.`);
  console.log(`   Register a real account on the site to be the shop owner.`);

  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
