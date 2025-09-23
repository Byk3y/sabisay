"use client";

import { useState } from "react";
import { categories, type Category } from "@/lib/mock";

interface CategoryTabsProps {
  onCategoryChange?: (category: Category) => void;
}

export function CategoryTabs({ onCategoryChange }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("Trending");

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  return (
    <div className="sticky top-14 z-30 bg-finance-nav border-b border-finance-border">
      <div className="mx-auto max-w-7xl px-3 md:px-4 overflow-x-auto no-scrollbar">
        <ul className="flex gap-2 py-3 text-sm">
          {categories.map((category) => (
            <li key={category} className="shrink-0">
              <button
                onClick={() => handleCategoryClick(category)}
                data-active={activeCategory === category}
                className={`px-4 py-2 rounded-full bg-finance-card text-finance-text-secondary hover:text-finance-text-primary data-[active=true]:bg-finance-accent data-[active=true]:text-finance-text-primary data-[active=true]:shadow-lg data-[active=true]:shadow-finance-accent/20 transition-colors whitespace-nowrap ${
                  category === "Trending" && activeCategory === "Trending" ? "ring-1 ring-finance-highlight/30" : ""
                }`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
