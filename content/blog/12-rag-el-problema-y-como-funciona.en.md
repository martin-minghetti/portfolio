---
title: "RAG: the problem and how it works"
date: 2026-11-06
order: 12
draft: false
description: "What problem RAG solves, when you don't need it, how documents are split and indexed, what an embedding is, how the most similar chunks are found and put into the prompt, the code end to end and what Claude, GPT and Gemini offer."
---

A customer writes to the pizzeria assistant: "Does the arugula one have nuts? My son is allergic".

If La Esquina is a single pizzeria, the answer is easy. The menu with the ingredients, the opening hours and the delivery areas take up a few thousand tokens. They go in the system prompt and that's it: the model reads them with every message and answers from them.

But suppose La Esquina grew. Now it has 30 locations, each with its own menu, hours and areas. There is a staff manual, PDF sheets from each supplier with the allergens of every ingredient, and a complaint history that grows every day. The answer to the arugula question is split between the menu and the pesto supplier's sheet.

That no longer fits in the prompt. And it is a question where making things up is dangerous. This post is about how to give the assistant access to documents that don't fit in the context window.

## The problem

A model knows two things: what it saw when it was trained, up to its cutoff date, and what you put in the prompt. It doesn't know your supplier's pesto sheet or any document of yours. And if you ask it something it doesn't know, it tends to make up an answer that sounds right.

The obvious way out is to paste all the documents into the prompt. It has three problems:

- **Sometimes it doesn't fit.** Today's large models accept around a million tokens. The information for 30 locations, with manuals, sheets and years of complaints, can go beyond that.
- **If it fits, every message pays for all of it.** With Claude Opus 5.5, sending 300,000 tokens with every message costs USD 1.20 (USD 0.06 if they are cached). To answer whether the arugula pizza has walnuts, one paragraph is enough.
- **With a lot of text around it, the model finds the fact less well.** This is what the context window showed: as it fills up, the model recalls what is in front of it less precisely.

### Before going on: if it fits, put it in the prompt

Anthropic explains it in [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval), from September 2024: if your knowledge base is under 200,000 tokens (about 500 pages), you can put the whole thing in the prompt, and prompt caching makes it cheaper.

With a single pizzeria, you need none of what follows. The menu goes in the prompt. What follows is for when the documents don't fit, or are far more than each question needs.

## What RAG is

**RAG** stands for Retrieval-Augmented Generation. The idea fits in one sentence: before answering, search your documents for the pieces that help with this question and put them in the prompt.

"Retrieval" is searching. "Augmented generation" means the model writes the answer with those pieces in front of it.

The important part: **the model learns nothing**. It is not trained or modified. It reads what you pass it, like any prompt. RAG only decides which pieces of your documents go into the prompt for each question.

It works in two phases. Indexing, which is done once. And querying, which is done with every message.

<figure>
<p class="fig-title">The two phases of RAG</p>
<svg viewBox="0 0 400 846" width="100%" role="img" aria-labelledby="g12t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g12t">Diagram of the two phases of RAG. Indexing, once: the documents are split into chunks, an embedding model turns each one into 1,024 numbers and they are stored in a vector database. Querying, with every message: the customer's question goes through the same embedding model, the database is searched for the most similar chunks, the prompt is built with those chunks on top and the question below, and Claude answers.</title>
<defs><marker id="g12ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<text x="10" y="22" font-size="15" fill="var(--color-ink)" text-anchor="start">1. Indexing: once</text>
<rect x="10" y="34" width="240" height="54" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="56.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Menus, manual,</text>
<text x="130.0" y="74.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">supplier sheets</text>
<path d="M130 88V110" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="112" width="240" height="46" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="139.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Split into chunks</text>
<path d="M130 158V180" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="182" width="240" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="206.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Embedding model</text>
<text x="130.0" y="225.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">each chunk: 1,024 numbers</text>
<path d="M130 238V260" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="262" width="240" height="56" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="286.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Vector database</text>
<text x="130.0" y="305.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">chunks and their numbers</text>
<text x="10" y="366" font-size="15" fill="var(--color-ink)" text-anchor="start">2. Querying: with every message</text>
<rect x="10" y="378" width="240" height="56" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="401.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">"Does the arugula one</text>
<text x="130.0" y="419.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">have nuts?"</text>
<path d="M130 434V456" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="458" width="240" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="482.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Embedding model</text>
<text x="130.0" y="501.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">the question: 1,024 numbers</text>
<path d="M130 514V536" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="538" width="240" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="562.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Find the most similar</text>
<text x="130.0" y="581.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">the top k</text>
<path d="M250 290H330V566H254" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#g12ink)"/>
<text x="338" y="420" font-size="13.5" fill="var(--color-muted)" text-anchor="start">searches</text>
<text x="338" y="437" font-size="13.5" fill="var(--color-muted)" text-anchor="start">here</text>
<path d="M130 594V616" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="618" width="240" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="642.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Build the prompt</text>
<text x="130.0" y="661.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">chunks on top, question below</text>
<path d="M130 674V696" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="10" y="698" width="240" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="722.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Claude answers</text>
<text x="130.0" y="741.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">only from those chunks</text>
<path d="M130 754V776" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g12ink)"/>
<rect x="45" y="778" width="170" height="40" rx="20" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="802.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Reply to the customer</text>
</svg>
<figcaption><ul><li>Light blue: what the customer writes.</li><li>Green: the two models. The embedding model turns text into numbers; Claude writes the answer.</li><li>Orange: your code.</li><li>Purple: what gets stored, the documents and the vector database.</li><li>The dotted line: every search uses what was stored during indexing.</li></ul></figcaption>
</figure>

## Phase 1: indexing

It is done once, and again every time the documents change.

### Splitting into chunks

The search has to bring back a small piece that answers, not a 40-page PDF. That is why documents are split into **chunks**.

Size matters. Too big, and each chunk mixes many topics: the search brings back extra text. Too small, and they lose context: a chunk that says "contains walnuts" is useless if you don't know what it refers to. Anthropic talks about chunks of no more than a few hundred tokens. OpenAI, when it splits for you, uses 800 tokens by default.

OpenAI also repeats 400 tokens between one chunk and the next. That is called **overlap**, and it makes a sentence cut in half appear whole in one of the two:

<figure>
<p class="fig-title">The pesto sheet, split into chunks</p>
<div class="tok-row"><div class="tok-head"><span>Without overlap</span><b>3 chunks</b></div><div class="tok-text"><span class="tok c0">Basil pesto. Ingredients: basil, olive oil,</span><span class="tok c1">cheese, walnuts and garlic. May contain</span><span class="tok c2">traces of peanuts. Keep refrigerated, up to 5 days once opened.</span></div></div>
<div class="tok-row"><div class="tok-head"><span>With overlap</span><b>3 chunks</b></div><div class="tok-text"><span class="tok c0">Basil pesto. Ingredients: basil, olive oil,</span><span class="tok c1">olive oil, cheese, walnuts and garlic. May contain traces of peanuts.</span><span class="tok c2">May contain traces of peanuts. Keep refrigerated, up to 5 days once opened.</span></div></div>
<figcaption><ul><li>Each color is a chunk.</li><li>Without overlap, "May contain traces of peanuts" gets split: one chunk says "may contain" without saying what, and the other says "traces of peanuts" without the "may contain".</li><li>With overlap, the edge of each chunk is repeated at the start of the next one, and the warning stays whole.</li><li>A sheet made up for the example, with chunks much shorter than real ones.</li></ul></figcaption>
</figure>

### Turning each chunk into numbers

This is where a second model comes in, different from the one that answers. It is an **embedding model**: it receives a text and returns a list of numbers that represents its meaning. That list is the text's **embedding** (or vector).

Anthropic doesn't have its own embedding model. Its documentation uses the ones from Voyage AI, a company specialized in these models that is now part of MongoDB, the company behind the database of the same name. With the Voyage model, each chunk becomes a list of 1,024 numbers. The useful part is this: texts that say similar things end up with similar numbers, even if they use other words. "Nuts" and "walnuts" end up close. "My pizza arrived freezing" ends up close to "if an order arrives cold, it is replaced".

One rule: the same embedding model for the documents and for the questions. Numbers from different models can't be compared. Google warns about it in its documentation: the vectors from its old model and its new one are incompatible. If you change models, you have to convert all the chunks again.

### Storing them in a vector database

Each chunk is stored with its numbers in a **vector database** (or vector store): a database that knows how to find the vectors closest to another one. If you already use Postgres, a very common open source database, the pgvector extension adds that. If not, there are dedicated services.

## Phase 2: querying

With every customer message, four things happen:

1. The question goes through the same embedding model and becomes its own list of numbers.
2. The database finds the chunks with the numbers most similar to the question's.
3. Your code builds the prompt with those chunks and the question.
4. The model answers with that in front of it.

### What "similar" means

A list of numbers can be thought of as an arrow pointing somewhere. Two texts with similar meaning give arrows pointing the same way. **Cosine similarity** measures exactly that: 1 is the same direction, 0 means they have nothing to do with each other.

Voyage, OpenAI and Gemini deliver arrows of the same length (length 1). With that, computing the cosine means multiplying the numbers in pairs and adding them up, which is the fastest calculation there is. Watch out: not every model does this, and with one that doesn't, that calculation gives a meaningless number.

### How many to bring

You bring the **k** most similar chunks (the **top-k**). Too few, and the one that answered may be left out. Too many, and the problem of extra text comes back. In Anthropic's 2024 tests, with chunks of a few hundred tokens, passing the 20 most similar did better than passing 10 or 5. In the example below there are six chunks, so two are enough.

### Where they go in the prompt

The chunks go on top and the question below, separated with tags. [Anthropic's prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) recommends putting long documents at the beginning: according to its tests, the question at the end improves answers by up to 30%, especially with several documents.

And one instruction that can't be missing: answer only with what is in the chunks, and say it doesn't know if that isn't enough. Further down you'll see why.

## What it looks like in code

This is RAG end to end with the pizzeria, in Python. It uses Voyage for the embeddings and Claude to answer. The chunks are one line long so they are easy to read; in real life they are a few hundred tokens.

```python
import numpy as np
import voyageai, anthropic

chunks = [
    "Arugula and parmesan: mozzarella, arugula, parmesan and house pesto. The pesto contains walnuts.",
    "Fugazzeta: onion, mozzarella and oregano. Contains no nuts.",
    "Gluten-free dough: baked in a separate oven and ordered 24 hours in advance.",
    "Delivery: Centro, Barrio Norte and Villa Sur. Outside those areas, pickup only.",
    "Hours: Tuesday to Sunday, 7 pm to midnight. Closed on Mondays.",
    "If an order arrives cold, it is replaced free of charge. Ask for a photo and the order number.",
]

vo = voyageai.Client()  # reads the key from VOYAGE_API_KEY
def embed(texts, kind):
    return np.array(vo.embed(texts, model="voyage-4", input_type=kind).embeddings)

# Indexing: once, and again when the documents change
vectors = embed(chunks, "document")

# Querying: with every customer message
question = "Does the arugula one have nuts? My son is allergic"
q = embed([question], "query")[0]
similarity = vectors @ q           # length-1 vectors: the dot product is the cosine
top = np.argsort(-similarity)[:2]  # top-k, with k = 2
for i in top:
    print(f"{similarity[i]:.2f}  {chunks[i]}")

context = "\n".join(chunks[i] for i in top)
r = anthropic.Anthropic().messages.create(
    model="claude-opus-5-5", max_tokens=16000,
    system="You are the assistant for La Esquina pizzeria. Answer only with the information "
           "in <info>. If it isn't enough, say you'll check with the restaurant.",
    messages=[{"role": "user", "content": f"<info>\n{context}\n</info>\n\n{question}"}],
)
print("".join(b.text for b in r.content if b.type == "text"))
```

What to look at:

- **The two phases are separate.** Indexing runs once. Querying, with every message.
- **There are two models.** Voyage turns text into numbers; Claude writes the answer. This is the most common confusion: the model that answers never sees the numbers, only the text of the chosen chunks.
- **`input_type` marks what each thing is.** A chunk is embedded as `"document"` and the question as `"query"`. Voyage adds a different text to each one before converting it, and that improves the search. Its documentation asks you not to leave it out.
- **`vectors @ q` is the search.** It multiplies and adds: with length-1 vectors, that is the cosine. With six chunks, numpy, the Python library for doing math, is enough. With thousands, the vector database does it.
- **The prompt puts the chunks on top**, between `<info>` tags, and the question below.

To try only the search without an API key, you can replace `embed` with an embedding model that runs on your computer, such as Google's EmbeddingGemma (with the `fastembed` library; the first time it downloads 1.2 GB). That model asks for a fixed text before each question (`task: search result | query: `) and before each chunk (`title: none | text: `); without it, the scores change. With that model, the search brings back this:

```text
0.50  Arugula and parmesan: mozzarella, arugula, parmesan and house pesto. The pesto contains walnuts.
0.34  Fugazzeta: onion, mozzarella and oregano. Contains no nuts.
```

The chunk that answers comes first. With Voyage the numbers would be different; what matters is the order.

## What can go wrong

With the same local model, two tests show the limits of the search.

**It always brings something back.** If the customer asks "How much is the mozzarella?", there is no chunk with prices. The search still returns two: the fugazzeta with 0.40 and the arugula with 0.39, because both mention mozzarella. Those scores are close to the ones from the previous question, which did have an answer. The search doesn't know it found nothing: it brings the k most similar, useful or not. That is why the prompt gives the model a way out: "if it isn't enough, say you'll check with the restaurant". Without that line, the model has two chunks that mention mozzarella and no price in front of it, and it may make one up.

**The most similar isn't always the right one.** With a smaller embedding model (`paraphrase-multilingual-MiniLM-L12-v2`), the arugula question brings the fugazzeta first, because it literally says "nuts". It is the wrong chunk. With k = 2, the right one still gets in at second place, and the model that answers can read both. With k = 1, the answer would have been "it contains no nuts". The embedding model matters, and bringing more than one gives you margin.

The idea not to lose: **if the search brings the wrong piece, the model answers with the wrong piece**. Almost always, when a RAG system answers badly, the problem is in the search, not in the model.

### The index has to be maintained

If a location changes its hours or the pesto supplier changes the recipe, that document has to be split and embedded again. Otherwise, the assistant answers very confidently with old data. Indexing isn't a task you do once and forget: it is a task that runs every time the documents change.

## The same in Claude, GPT and Gemini

This is how it looks in Claude (by Anthropic), GPT (the OpenAI models behind ChatGPT) and Gemini (by Google):

| | Claude | GPT | Gemini |
|---|---|---|---|
| Embedding model | None of its own. Its documentation uses Voyage: `voyage-4`, 1,024 numbers per text | `text-embedding-3-small` (1,536 numbers) and `text-embedding-3-large` (3,072) | `gemini-embedding-2` (3,072 numbers), which also accepts images, audio, video and PDF |
| Ready-made search | None: the search stays in your code | File Search: you upload files and OpenAI splits, embeds and searches | File Search: the same, on Google's side |
| Citing the source | Citations, and search result blocks for your own chunks | Citations to the files in the answer | Citations to the files in the answer |

What it costs, with prices published as of 28-10-2026:

- **Voyage**: `voyage-4` costs USD 0.06 per million tokens, with 200 million free. Indexing the whole example costs fractions of a cent.
- **OpenAI**: storing up to 1 GB in its vector databases is free; after that, USD 0.10 per GB per day.
- **Gemini**: you pay to convert the documents when indexing. Storing them and converting the questions is free.

The underlying difference: with OpenAI and Gemini you can have RAG without building the search, in exchange for not fully controlling how it splits or how it searches. With Claude, the search stays on your side, with the embedding model and the database you choose.

A warning for anyone looking for tutorials: many RAG tutorials with OpenAI use the Assistants API, which shut down in August 2026. Today the same thing is done with File Search in the Responses API.

## In short

- A model doesn't know your stuff: only what it saw in training and what you put in the prompt.
- If your documents fit in the prompt (Anthropic draws the line at about 200,000 tokens), put them there. With a single pizzeria, you don't need RAG.
- If they don't fit, RAG searches for the pieces that help with each question and puts them in the prompt. The model learns nothing: it reads what you pass it.
- Indexing, once: split into chunks, turn each one into numbers with an embedding model and store them in a vector database.
- Querying, every time: convert the question with the same model, bring the k most similar chunks and build the prompt with them on top.
- The search always brings something back, and not always the right thing. That is why the prompt has to allow saying "I don't know", and it helps to bring more than one chunk.
- Claude has no embeddings of its own and the search stays in your code; OpenAI and Gemini offer a ready-made search.

What to do when the search brings the wrong chunk, and when something other than RAG is a better fit, comes later in the series.
