// Portadas del blog con Replicate FLUX 1.1 Pro, mismo estilo para toda la serie.
// Run: REPLICATE_API_TOKEN=r8_xxx node scripts/gen-blog-images.mjs [slug ...]  (requiere ImageMagick)
import { existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

// Paleta en azul cobalto, el acento del sitio (28-10-2026).
// Solo nombrar el azul: listar colores prohibidos hace que FLUX los use.
const STYLE =
  "photorealistic isometric 3D render, octane render, glossy materials, on a dark navy circuit board with fine glowing circuit traces and tiny chips, " +
  "everything rendered entirely in shades of blue: deep navy, cobalt blue, electric blue neon glow, pale ice blue highlights, cool blue lighting only, " +
  "stylized objects standing on round dark pedestals with glowing cobalt blue rims, soft bloom, subtle depth of field, deep shadows, " +
  "empty dark navy space on the left side, high detail, no people, " +
  "plain blank surfaces without any text, lettering or logos";

// Un objeto central por tema; el resto lo pone STYLE.
const PROMPTS = {
  // Páginas del sitio: una clave con "/" se guarda en public/<clave>.jpg.
  "home/hero":
    "wide shot, the left 45 percent of the frame is empty dark navy, all objects grouped in the right half: a sleek open laptop with a blank glowing website layout on screen, " +
    "a smartphone standing beside it with a blank glowing shop screen, a large glowing AI processor chip on a pedestal connected to both by bright light traces, " +
    "a small payment card sculpture on a pedestal",
  "home/airlst":
    "an event venue in miniature: a glowing stage with a large blank screen, neat rows of tiny chairs facing it, " +
    "a conference badge on a lanyard sculpture and a calendar sculpture with blank pages on pedestals in the foreground",
  // Portada de la lista del blog.
  blog:
    "composition with all objects in the right third of the frame: an open glowing book sculpture with blank pages on a round pedestal, small glowing cubes rising from its pages, a stylus pen sculpture on a smaller pedestal beside it",
  "01-que-es-un-ai-builder":
    "a glowing processor chip in the center, a magnifying glass sculpture on one pedestal and a wrench sculpture on another pedestal, small blueprint panel floating above",
  "02-como-funciona-un-modelo-de-lenguaje-parte-1":
    "a large glowing processor chip with a stream of small glowing cubes of different sizes flowing into it like pieces of a sentence, stacks of books turning into light on a pedestal",
  "03-como-funciona-un-modelo-de-lenguaje-parte-2":
    "a large glowing processor chip in the center with stacked translucent layers of weights rising above it, three small chat bubble sculptures on pedestals around it",
  "04-prompting-system-prompt-y-ejemplos":
    "a glowing processor chip receiving a floating translucent instruction card with blank lines, three smaller example cards on pedestals beside it",
  "05-prompting-razonar-paso-a-paso-y-temperatura":
    "a glowing processor chip with a staircase of glowing steps rising from it, a thermometer sculpture with a glowing dial on a pedestal",
  "06-context-window-y-como-manejar-el-contexto":
    "a glowing processor chip with a long translucent window frame above it filled with stacked glowing message cards, some cards fading out at the far end",
  "07-tool-use-como-un-modelo-usa-herramientas":
    "a glowing processor chip connected by bright traces to a wrench, a gear and a small database cylinder, each sculpture on its own pedestal",
  "08-agentes-y-agent-loops":
    "a glowing processor chip with a bright circular loop of light orbiting around it, small arrows along the loop, two tool sculptures on pedestals",
  "09-guardrails":
    "a glowing processor chip surrounded by a translucent glowing shield dome, small barrier posts with glowing rails around the edge, a padlock sculpture on a pedestal",
  "10-mcp-protocolo-para-conectar-herramientas":
    "a glowing universal connector plug sculpture in the center linking a processor chip to three different devices on pedestals with bright cables",
  "11-orquestacion-langchain-y-langgraph":
    "a central glowing hub chip connected by bright traces to five smaller node chips arranged like a flowchart, " +
    "one glowing path splitting into two paths, a pause icon sculpture made of two vertical bars on a pedestal, and a checkmark sculpture on another pedestal",
  "12-rag-el-problema-y-como-funciona":
    "a tall glowing filing cabinet with open drawers full of small translucent pale ice blue glowing document cards on one pedestal, a magnifying glass sculpture beside it, " +
    "three of the document cards floating along a bright light trace into a glowing processor chip on another pedestal",
  "13-rag-conceptos-clave-y-cuando-usarlo":
    "a large glowing translucent funnel sculpture on a pedestal, many small glowing document cards pouring into its wide top and only two cards coming out the narrow bottom, " +
    "the two cards landing neatly stacked on a second smaller pedestal",
  "14-structured-output":
    "a glowing processor chip on a pedestal emitting a stream of loose glowing cubes that pass through a translucent rectangular mold with neat square slots, " +
    "coming out the other side as a perfectly ordered grid of cubes on a second pedestal",
  "15-prompt-caching":
    "a glowing processor chip on a pedestal with a tall stack of identical translucent glowing cards above it, the lower part of the stack locked inside a clear glass vault box with a glowing rim, " +
    "a single new card floating down onto the top of the stack, a small hourglass sculpture with glowing sand on a second pedestal beside it",
};

const token = process.env.REPLICATE_API_TOKEN;
if (!token) throw new Error("Missing REPLICATE_API_TOKEN");

for (const slug of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PROMPTS)) {
  const out = slug.includes("/") ? `public/${slug}.jpg` : `public/blog/${slug}.jpg`;
  if (existsSync(out)) continue;
  let res, data;
  // Con menos de USD 5 de crédito, Replicate deja crear una imagen cada ~10 s: esperar y reintentar.
  for (let i = 0; i < 12; i++) {
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
  // Una sola generación por portada: si FLUX mete otro color, este filtro (ImageMagick) la pasa a la gama cobalto.
  execFileSync("magick", [out, "-colorspace", "gray", "(", "-size", "1x256", "gradient:#020617-#1d4fd8", "gradient:#1d4fd8-#e0f0ff", "-append", "-resize", "1x256!", ")", "-clut", out]);
  console.log(`ok ${out}`);
}
