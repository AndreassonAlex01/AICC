// components/food-search.tsx
"use client";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { FOOD_DATABASE } from "@/lib/foodDatabase";
import type { FoodItem } from "@/lib/types";

const DEFAULT_PORTION_GRAMS = 100;

export function FoodSearch({ onAdd }: { onAdd: (item: FoodItem) => void }) {
  const [query, setQuery] = useState("");

  const results =
    query.trim().length > 0
      ? FOOD_DATABASE.filter((food) => food.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
      : [];

  function handleAdd(entry: (typeof FOOD_DATABASE)[number]) {
    const ratio = DEFAULT_PORTION_GRAMS / 100;
    onAdd({
      name: entry.name,
      portionGrams: DEFAULT_PORTION_GRAMS,
      calories: Math.round(entry.caloriesPer100g * ratio),
      proteinGrams: +(entry.proteinPer100g * ratio).toFixed(1),
      carbsGrams: +(entry.carbsPer100g * ratio).toFixed(1),
      fatGrams: +(entry.fatPer100g * ratio).toFixed(1),
      confidence: "high",
    });
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods to add manually…"
          className="w-full rounded-lg border bg-background py-2 pr-3 pl-9 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      {results.length > 0 && (
        <div className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          {results.map((entry) => (
            <button
              key={entry.name}
              type="button"
              onClick={() => handleAdd(entry)}
              className="flex items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
            >
              <span className="flex flex-col">
                <span className="font-medium">{entry.name}</span>
                <span className="text-xs text-muted-foreground">{entry.caloriesPer100g} kcal / 100g</span>
              </span>
              <Plus size={16} className="shrink-0 text-primary" />
            </button>
          ))}
        </div>
      )}
      {query.trim().length > 0 && results.length === 0 && (
        <p className="px-1 text-xs text-muted-foreground">No matches — try a different search term.</p>
      )}
    </div>
  );
}
