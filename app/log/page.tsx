// app/log/page.tsx
"use client";
import { useState } from "react";
import { MealItemRow } from "@/components/meal-item-row";
import type { FoodItem } from "@/lib/types";

import { useRouter } from "next/navigation";
import { saveMeal } from "@/lib/meals";

export default function LogPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [saving, setSaving] = useState(false);

async function handleSave() {
  setSaving(true);
  try {
    await saveMeal(items);
    router.push("/"); // back to the Today dashboard
  } finally {
    setSaving(false);
  }
}

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      const data = await res.json();
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  }

  function updateItem(index: number, updated: FoodItem) {
    setItems((prev) => prev.map((it, i) => (i === index ? updated : it)));
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Log a meal</h2>
      <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} />
      {preview && <img src={preview} alt="Selected meal" className="w-full rounded-lg" />}
      {loading && <p className="text-sm text-muted-foreground">Analyzing photo…</p>}
      {items.map((item, i) => (
        <MealItemRow key={i} item={item} onChange={(updated) => updateItem(i, updated)} />
      ))}
      {items.length > 0 && (
  <button onClick={handleSave} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
    {saving ? "Saving…" : "Add to today's log"}
  </button>
)}
    </div>
  );
}