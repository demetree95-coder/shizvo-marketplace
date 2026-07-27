export function formatPrice(price: number, currency: string = "GEL"): string {
  return `${price.toFixed(2)} ₾`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const months = ["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return `${formatDate(d)} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u10D0-\u10FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const prefix = "MK";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

export function parseJsonArray<T>(value: string): T[] {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: "blue", PROCESSING: "yellow", PACKED: "orange",
    SHIPPED: "indigo", IN_TRANSIT: "purple", DELIVERED: "green", CANCELLED: "red",
  };
  return colors[status] || "gray";
}

export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    NEW: "📦", PROCESSING: "🔄", PACKED: "📋",
    SHIPPED: "📮", IN_TRANSIT: "🚚", DELIVERED: "✅", CANCELLED: "❌",
  };
  return icons[status] || "📦";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
