// api/parse-receipt.ts
import OpenAI from "openai";

export const config = {
  runtime: "nodejs",
};

function json(res: any, status = 200) {
  return new Response(JSON.stringify(res), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function cleanStr(x: any) {
  const s = String(x ?? "").trim();
  return s.length ? s : null;
}

export default async function handler(req: Request) {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const receiptUrl = cleanStr(body?.receiptUrl);
    if (!receiptUrl) return json({ error: "Missing receiptUrl" }, 400);

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Vision prompt: vendor, total, currency, date
    const prompt = `
You extract fields from a receipt image.
Return STRICT JSON with:
{
  "vendor": string|null,
  "amount": number|null,
  "currency": string|null,
  "expense_date": "YYYY-MM-DD"|null,
  "vat": number|null,
  "category": string|null,
  "note": string|null,
  "confidence": number|null
}
If unsure, set null. Currency should be 3-letter (AED/EUR/USD/RON when possible).
Do not include extra keys.
`.trim();

    const resp = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: receiptUrl, detail: "auto" },
          ],
        },
      ],
      // strongly encourage json-only
      text: { format: { type: "json_object" } },
    });

    const text = resp.output_text || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {};
    }

    return json({
      vendor: cleanStr(parsed.vendor),
      amount: parsed.amount == null ? null : Number(parsed.amount),
      currency: cleanStr(parsed.currency),
      expense_date: cleanStr(parsed.expense_date),
      vat: parsed.vat == null ? null : Number(parsed.vat),
      category: cleanStr(parsed.category),
      note: cleanStr(parsed.note),
      confidence: parsed.confidence == null ? null : Number(parsed.confidence),
      raw: parsed,
    });
  } catch (e: any) {
    return json({ error: e?.message || "Parse failed" }, 500);
  }
}
