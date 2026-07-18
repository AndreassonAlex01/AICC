// app/api/analyze-meal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const RequestSchema = z.object({ imageBase64: z.string().min(1) });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = RequestSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const prompt = `You are a nutrition estimation assistant analyzing a meal photo.
Identify EVERY distinct food item visible (e.g. chicken, rice, broccoli — not "chicken and rice" as one item).
Respond with ONLY JSON, no other text, in this exact shape:
{
  "items": [
    {
      "name": string,
      "portionGrams": number,
      "calories": number,
      "proteinGrams": number,
      "carbsGrams": number,
      "fatGrams": number,
      "confidence": "low" | "medium" | "high"
    }
  ]
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: parsed.data.imageBase64 } },
          { type: "text", text: prompt },
        ],
      }],
    }),
  });

  const data = await res.json();
  const textBlock = data.content.find((c: any) => c.type === "text");
  const result = JSON.parse(textBlock.text.replace(/```json|```/g, "").trim());
  return NextResponse.json(result);
}