import Link from "next/link";
import { CategoryType } from "@/types";

interface Props {
  category: CategoryType;
}

export default function CategoryCard({ category }: Props) {
  return (
    <Link
      href={`/products?category=${category.id}`}
      className="glass-card p-5 flex flex-col items-center text-center hover:shadow-lg hover:border-primary/30 transition-all duration-300 min-w-[140px]"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-3 text-2xl">
        {category.icon || "📦"}
      </div>
      <h3 className="font-semibold text-sm">{category.name}</h3>
      {category._count && (
        <p className="text-xs text-gray-500 mt-1">{category._count.products} პროდუქტი</p>
      )}
    </Link>
  );
}
