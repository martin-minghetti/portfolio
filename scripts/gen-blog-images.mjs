// Portadas del blog con Replicate FLUX 1.1 Pro, mismo estilo para toda la serie.
// Run: REPLICATE_API_TOKEN=r8_xxx node scripts/gen-blog-images.mjs [slug ...]
import { existsSync, writeFileSync } from "node:fs";

const STYLE =
  "photorealistic isometric 3D render, octane render, glossy materials, on a dark navy circuit board with fine glowing teal circuit traces and tiny chips, " +
  "color palette strictly limited to deep navy, electric purple, cyan teal and lime green, no orange, no red, no pink, no yellow, " +
  "stylized objects standing on round dark pedestals with glowing purple or lime rims, soft bloom, subtle depth of field, deep shadows, " +
  "empty dark navy space on the left side, high detail, " +
  "no text, no letters, no numbers, no symbols on surfaces, no logos, no watermark";

const PROMPTS = {
  "03-como-funciona-un-modelo-de-lenguaje-parte-2":
    "a large glowing processor chip in the center with stacked translucent layers of weights rising above it, " +
    "three small chat bubble sculptures on pedestals around it in purple, teal and lime",
  "11-orquestacion-langchain-y-langgraph":
    "a central glowing hub chip connected by bright traces to five smaller node chips arranged like a flowchart, " +
    "one glowing path splitting into two paths, a purple pause icon sculpture made of two vertical bars on a pedestal, and a lime green checkmark sculpture on another pedestal",
};

const token = process.env.REPLICATE_API_TOKEN;
if (!token) throw new Error("Missing REPLICATE_API_TOKEN");

for (const slug of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PROMPTS)) {
  const out = `public/blog/${slug}.jpg`;
  if (existsSync(out)) continue;
  let res, data;
  // Con menos de USD 5 de crédito, Replicate deja crear una imagen cada ~10 s: esperar y reintentar.
  for (let i = 0; i < 6; i++) {
    res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "wait" },
      body: JSON.stringify({
        input: { prompt: `${PROMPTS[slug]}, ${STYLE}`, aspect_ratio: "16:9", output_format: "jpg", output_quality: 85, safety_tolerance: 2 },
      }),
    });
    data = await res.json();
    if (res.status !== 429) break;
    await new Promise((r) => setTimeout(r, ((data.retry_after ?? 10) + 1) * 1000));
  }
  if (!res.ok || data.error) throw new Error(`${slug}: ${res.status} ${data.error ?? JSON.stringify(data)}`);
  const url = Array.isArray(data.output) ? data.output[0] : data.output;
  writeFileSync(out, Buffer.from(await (await fetch(url)).arrayBuffer()));
  console.log(`ok ${out}`);
}
