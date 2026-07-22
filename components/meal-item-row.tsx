// components/meal-item-row.tsx
import { X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { FoodItem } from "@/lib/types";

export function MealItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: FoodItem;
  onChange: (item: FoodItem) => void;
  onRemove?: () => void;
}) {
  const confidenceColor = { high: "bg-green-500", medium: "bg-yellow-500", low: "bg-red-500" }[item.confidence];

  function handlePortionChange(newPortionGrams: number) {
    const ratio = newPortionGrams / item.portionGrams;
    onChange({
      ...item,
      portionGrams: newPortionGrams,
      calories: Math.round(item.calories * ratio),
      proteinGrams: +(item.proteinGrams * ratio).toFixed(1),
      carbsGrams: +(item.carbsGrams * ratio).toFixed(1),
      fatGrams: +(item.fatGrams * ratio).toFixed(1),
    });
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <span className={`w-2 h-2 rounded-full ${confidenceColor}`} title={`${item.confidence} confidence`} />
      <input
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
        className="flex-1 bg-transparent font-medium"
      />
      <Slider
        min={10} max={1000} value={[item.portionGrams]}
        onValueChange={(value) => handlePortionChange(Array.isArray(value) ? value[0] : value)}
      />
      <span className="text-sm text-muted-foreground">{item.calories} kcal</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name}`}
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}