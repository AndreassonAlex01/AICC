// app/log/page.tsx
"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { MealItemRow } from "@/components/meal-item-row";
import { FoodSearch } from "@/components/food-search";
import type { FoodItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import { saveMeal } from "@/lib/meals";

// Vercel rejects request bodies over ~4.5 MB, and a raw phone photo (plus
// base64's +33%) routinely exceeds that. 1280px is plenty for food
// recognition and lands at a few hundred KB; re-encoding as JPEG also keeps
// the API's hardcoded image/jpeg media type honest for PNG/WebP uploads.
const MAX_DIMENSION = 1280;

async function compressImageToBase64(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.75));
  if (!blob) throw new Error("Image compression failed");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function LogPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setError(null);

    let imageBase64: string;
    try {
      imageBase64 = await compressImageToBase64(file);
    } catch {
      setError("Couldn't read that photo — try a JPEG or PNG image.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      // Platform-level failures (413 too large, 504 timeout) come back as
      // plain text, not JSON — don't let res.json() throw on those.
      const raw = await res.text();
      let data: { items?: FoodItem[]; error?: string } = {};
      try {
        data = JSON.parse(raw);
      } catch {}

      if (!res.ok || !data.items) {
        if (res.status === 413) setError("That photo is too large to upload — try a smaller one.");
        else if (res.status === 504) setError("The analysis timed out — please try again.");
        else if (data.error === "Unauthorized") setError("Please sign in to log a meal.");
        else setError(data.error ?? "Something went wrong analyzing that photo.");
        return;
      }
      setItems(data.items);
    } catch {
      setError("Couldn't reach the server — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateItem(index: number, updated: FoodItem) {
    setItems((prev) => prev.map((it, i) => (i === index ? updated : it)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addManualItem(item: FoodItem) {
    setItems((prev) => [...prev, item]);
  }

  return (
    <div className="animate-page-in flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Log a meal</h2>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        disabled={loading}
        className="text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {preview && (
        <div className="relative overflow-hidden rounded-lg">
          <img src={preview} alt="Selected meal" className={`w-full transition-opacity ${loading ? "opacity-40" : ""}`} />
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/30">
              <Loader2 size={28} className="animate-spin text-primary" />
              <p className="rounded-full bg-background/90 px-3 py-1 text-sm font-medium shadow-sm">
                AI is analyzing your photo…
              </p>
            </div>
          )}
        </div>
      )}
      {loading && !preview && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/60 p-3 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin text-primary" />
          AI is analyzing your photo…
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {items.map((item, i) => (
        <MealItemRow
          key={i}
          item={item}
          onChange={(updated) => updateItem(i, updated)}
          onRemove={() => removeItem(i)}
        />
      ))}

      <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
        <p className="text-sm font-medium">Missing something?</p>
        <FoodSearch onAdd={addManualItem} />
      </div>

      {items.length > 0 && (
        <button onClick={handleSave} disabled={saving} className="btn-press rounded-lg bg-primary px-4 py-2 text-primary-foreground">
          {saving ? "Saving…" : "Add to today's log"}
        </button>
      )}
    </div>
  );
}