---
title: "RAG: key concepts and when to use it"
date: 2026-11-07
order: 13
draft: false
description: "Why a RAG search brings back the wrong chunk and how to improve it: filters, reranking, hybrid search, Contextual Retrieval and agentic search. And when it is better to put everything in the prompt or fine-tune, with what Claude, GPT and Gemini offer."
---

A complete RAG system fits in thirty lines: split the documents, turn them into numbers, find the chunks most similar to the question and put them in the prompt. But with the pizzeria, two failures already showed up.

The search always brings something back. "How much is the mozzarella?" brought two chunks with scores of 0.40 and 0.39, even though neither had prices. And the most similar isn't always the right one: with a small embedding model, the question about the arugula pizza brought the fugazzeta first, because it says "nuts" in so many words.

With La Esquina at 30 locations, a third one appears. Each location has its own hours, and each one's chunk says something like "Hours: every day, 7 pm to midnight". None of them says which location it is. If a customer asks "Are you open on Mondays in Villa Sur?", the search brings back some opening hours, but they could be anyone's.

As we saw, if the search brings the wrong piece, the model answers with the wrong piece. This post is about how to improve the search, and when something other than RAG is a better fit.

## Why the search fails

There are three causes, and each technique below tackles one:

- **A loose chunk doesn't say what it is about.** Splitting a document strips its context: the hours don't say which location, the warning doesn't say which product.
- **Similar is not the same as correct.** Embeddings measure how alike two texts are, not whether one answers the other. The fugazzeta looks a lot like the arugula question and doesn't answer it.
- **Embeddings are good with meaning and weak with exact things.** A batch number, a product code or a supplier's name can end up far from the question even if they match letter by letter.

## Filtering before searching

The simplest thing first. Each chunk can be stored with **metadata**: data about the chunk, such as which location it belongs to, what type of document it is or what date it has. If the customer writes to the Villa Sur location's WhatsApp, the search is limited to that location's chunks before comparing anything.

With 30 locations, that takes 29 equally similar opening hours out of the game. It needs no model: if the chunks are in your database, it is one more condition in the query. OpenAI and Gemini include it in their ready-made searches, with data you attach to each file.

It works when the question carries the data or your code knows it. When it doesn't, you need the techniques that follow.

## Reranking: rereading the candidates

Embedding search is fast because it converts the question and each chunk separately, and then only compares numbers. That is also its limit: the model never sees the question and the chunk together.

A **reranker** does. It is a model that receives the question and a chunk at the same time and gives a score for how well it answers. It is more accurate and slower, so it is used in two steps: the search brings many candidates quickly, and the reranker reorders them and keeps the best. In its 2024 test, Anthropic brought 150 candidates and the reranker kept 20.

This is the reranking step on top of the RAG code we already saw. It uses Voyage AI, a company specialized in embedding models and rerankers, now part of MongoDB (a database company), and the one Claude's documentation uses:

```python
import numpy as np
import voyageai

chunks = [
    "Arugula and parmesan: mozzarella, arugula, parmesan and house pesto. The pesto contains walnuts.",
    "Fugazzeta: onion, mozzarella and oregano. Contains no nuts.",
    "Gluten-free dough: baked in a separate oven and ordered 24 hours in advance.",
    "Delivery: Centro, Barrio Norte and Villa Sur. Outside those areas, pickup only.",
    "Hours: Tuesday to Sunday, 7 pm to midnight. Closed on Mondays.",
    "If an order arrives cold, it is replaced free of charge. Order number required.",
]

vo = voyageai.Client()  # reads the key from VOYAGE_API_KEY
def embed(texts, kind):
    return np.array(vo.embed(texts, model="voyage-4", input_type=kind).embeddings)

vectors = embed(chunks, "document")  # indexing, as always

question = "My pizza arrived freezing"

# Step 1: embedding search brings several candidates, quickly
similarity = vectors @ embed([question], "query")[0]
candidates = [chunks[i] for i in np.argsort(-similarity)[:4]]

# Step 2: the reranker reads the question next to each candidate and reorders them
r = vo.rerank(question, candidates, model="rerank-3", top_k=2)
for x in r.results:
    print(f"{x.relevance_score:.2f}  {x.document}")
```

What is new is the last four lines. The reranker receives text, not numbers: the question and the candidates as they are. And `top_k=2` is the usual k, applied after reordering.

What it fixes, with the small embedding model and two open rerankers that run on your computer (`jina-reranker-v2-base-multilingual` and `bge-reranker-v2-m3`):

- **"My pizza arrived freezing": yes.** Embedding search puts the cold-order complaint third, behind the gluten-free dough and the fugazzeta. Both rerankers move it to first place.
- **The arugula question: yes, in English.** Both rerankers put the arugula pizza first. In the Spanish version of this same test they didn't: they also saw "frutos secos" (nuts) in both chunks and kept the fugazzeta on top. The same reranker can behave differently with the same content in another language.

What fixed the arugula in Spanish was rewriting the question before searching: with "Does the arugula and parmesan pizza have nuts?", the reranker put the arugula first, barely. In English, that rewritten question is enough for the embedding search on its own to put the arugula first. OpenAI offers this ready-made in its search: a model rewrites the question before searching. With Voyage the results may differ: that version needs an API key and isn't tested here.

## Hybrid search: adding exact words

Before embeddings, search engines found text by words. The most widely used method is called **BM25**, and it is the default in Elasticsearch, one of the most widely used text search engines. Put more simply, BM25:

- Counts which words of the question appear in each chunk.
- Gives more weight to rare words, the ones that appear in few chunks, than to common ones.
- Doesn't over-reward a word that repeats a lot or a chunk that is long.

It doesn't understand synonyms: for "My pizza arrived freezing" it finds nothing useful, because no chunk says "freezing". But it is good exactly where embeddings are weak: Anthropic recommends it for questions with codes or unique technical terms, like the batch number on a supplier sheet.

**Hybrid search** runs both searches and merges the results. Since the scores of each are on different scales, they are merged by position: the most common method, Reciprocal Rank Fusion, gives each chunk points depending on where it landed in each list, and adds them up. The University of Waterloo proposed it in 2009 in [Reciprocal Rank Fusion outperforms Condorcet and Individual Rank Learning Methods](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf).

With the pizzeria, it improved nothing. On the arugula question, one search put the fugazzeta first and the other the arugula, and when merged they tied exactly. In the Spanish version of the test, with another setup, hybrid search even pushed a question that was coming out right from first to third place, because BM25 rewarded a common word like "la" ("the"). BM25 pays off with many documents and exact names or codes. With six one-line chunks, it doesn't show.

## Contextual Retrieval: telling each chunk where it comes from

The third cause, the chunk that doesn't say what it is about, has its own technique. Anthropic published it in September 2024 in [Introducing Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval).

The idea: before turning each chunk into numbers, a small, cheap model reads the whole document and writes one or two sentences for the chunk saying where it comes from. That text is stored attached to the chunk, and both searches, by embeddings and by words, use it.

<figure>
<p class="fig-title">Three opening hours, without and with context</p>
<div class="tok-row"><div class="tok-head"><span>Without context</span><b>3 chunks</b></div><div class="tok-text"><span class="tok c4">Hours: Tuesday to Sunday, 7 pm to midnight. Closed on Mondays.</span><span class="tok c4">Hours: every day, 7 pm to midnight.</span><span class="tok c4">Hours: every day, noon to 3 pm and 7 pm to midnight.</span></div></div>
<div class="tok-row"><div class="tok-head"><span>With context</span><b>3 chunks</b></div><div class="tok-text"><span class="tok c2">Hours of the Centro location, from the October menu.</span><span class="tok c4">Hours: Tuesday to Sunday, 7 pm to midnight. Closed on Mondays.</span><span class="tok c2">Hours of the Villa Sur location, from the October menu.</span><span class="tok c4">Hours: every day, 7 pm to midnight.</span><span class="tok c2">Hours of the Barrio Norte location, from the October menu.</span><span class="tok c4">Hours: every day, noon to 3 pm and 7 pm to midnight.</span></div></div>
<figcaption><ul><li>Light blue: the original chunk.</li><li>Orange: the sentence the model writes before indexing.</li><li>Without context, for "Are you open on Mondays in Villa Sur?" all three opening hours are worth the same: none says which location it is.</li><li>With context, "Villa Sur" appears in a single chunk, and both searches find it.</li></ul></figcaption>
</figure>

Anthropic measured how often the right chunk didn't show up among the top 20 passed to the model. That measure is called recall@20: out of every 100 questions, in how many the chunk that answers reaches the prompt. With embedding search alone, it failed 5.7% of the time. With context added, 3.7% (35% fewer failures). Adding word search, 2.9% (49% fewer). And adding a reranker on top, 1.9%: 67% fewer failures.

Writing the context is paid once, at indexing time. Anthropic calculated USD 1.02 per million document tokens, using the cache so as not to pay for the whole document with every chunk.

There are embedding models that do something similar without writing text: they receive all the chunks of a document together, and each vector reflects the whole document. Voyage has one, `voyage-context-4`.

This is what the full search looks like, with the four pieces together:

<figure>
<p class="fig-title">Searching in two steps</p>
<svg viewBox="0 0 400 560" width="100%" role="img" aria-labelledby="g13t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g13t">Diagram of the two-step search: the customer's question goes through a filter that keeps only the chunks from their location; then it searches by meaning with embeddings and by words with BM25; the two lists are merged by position; a reranker rereads the candidates and keeps the best; your code builds the prompt and Claude answers.</title>
<defs><marker id="g13ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<rect x="100" y="14" width="200" height="54" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="36.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">"Open on Mondays</text>
<text x="200.0" y="54.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">in Villa Sur?"</text>
<path d="M200 68V90" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="100" y="92" width="200" height="46" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="119.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Filter: Villa Sur only</text>
<path d="M160 138L102 166" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<path d="M240 138L298 166" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="10" y="168" width="180" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="100.0" y="192.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">By meaning</text>
<text x="100.0" y="211.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">embeddings</text>
<rect x="210" y="168" width="180" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="300.0" y="192.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">By words</text>
<text x="300.0" y="211.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">BM25</text>
<path d="M100 224L168 254" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<path d="M300 224L232 254" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="100" y="256" width="200" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="280.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Merge the two lists</text>
<text x="200.0" y="299.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">150 candidates</text>
<path d="M200 312V334" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="100" y="336" width="200" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="360.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Reranker</text>
<text x="200.0" y="379.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">keeps the best 20</text>
<path d="M200 392V414" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="100" y="416" width="200" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="440.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Build the prompt</text>
<text x="200.0" y="459.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">the 20, above the question</text>
<path d="M200 472V494" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13ink)"/>
<rect x="100" y="496" width="200" height="46" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="523.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Claude answers</text>
</svg>
<figcaption><ul><li>Light blue: what the customer writes.</li><li>Red: the filter, which leaves out the chunks from the other 29 locations before searching.</li><li>Green: the models (the embedding model, the reranker and Claude).</li><li>Orange: your code.</li><li>The numbers are those from Anthropic's test: 150 candidates, 20 to the prompt.</li></ul></figcaption>
</figure>

## Splitting better

Instead of splitting every so many tokens, you can split where the topic changes or by following the document's headings: each section of the supplier sheet, one chunk. Chroma, a company that sells a vector database, measured it in 2024 in [Evaluating Chunking Strategies for Retrieval](https://www.trychroma.com/research/evaluating-chunking). Splitting by meaning did well, but a simple split of about 200 tokens, with no overlap and respecting paragraphs and sentences, did almost as well. What mattered most was size: OpenAI's default split, 800 tokens with 400 of overlap, was among the worst. Before splitting more cleverly, it is worth trying smaller chunks.

## Agentic search: letting the model decide when to search

So far, the search always runs once, before answering. But some questions need two different searches: "I ordered the arugula one in Villa Sur an hour ago and it hasn't arrived: do I get my money back?" needs that location's delivery areas and the complaints policy.

The other way is the one covered with agents: the search becomes a tool, and the model decides when to search, what to search for and whether to search again with other words. Each search is one more turn of the loop, with its cost and its delay.

The extreme version is Claude Code, Anthropic's programming assistant that works on a project's files. In [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), from September 2025, Anthropic explains that it doesn't build an embedding index of the project: it searches the files on the spot, with commands like `grep`, and so it avoids searching an outdated index. The flip side, in its words: exploring on the spot is slower than searching something already indexed.

For global questions, like "What were the most repeated complaints across the 30 locations this year?", no chunk search works: the answer isn't in any single piece. For that, Microsoft Research, Microsoft's research division, proposed [GraphRAG](https://arxiv.org/abs/2404.16130) in 2024: a model reads everything and builds a map of what things there are (locations, suppliers, complaints) and how they relate, and the answer comes from that map. It is expensive to build, and I didn't find recent independent comparisons.

## How to know if it improved

None of these techniques always improves things. With the pizzeria, the result of the reranker changed with the language, and hybrid search improved nothing. That is why, before adding a piece, it is worth putting together a set of questions with the chunk that answers each one, and measuring before and after how often it reaches the prompt. How to build that comes later in the series.

## When something else is a better fit

RAG isn't the only way to give the model what it needs to know. There are two alternatives, and one is for something different.

### Putting everything in the prompt, with caching

Anthropic's rule: if your documents are under about 200,000 tokens, put them whole in the prompt. What makes it viable is **prompt caching**: the part of the prompt that repeats unchanged in every message is stored and charged much cheaper. It is covered in detail later in the series.

A calculation with a single La Esquina location, with its menu, the manual, the supplier sheets and the year's complaints. Suppose that is about 150,000 tokens (an example number, not measured). With Claude Opus 5.5, just the input of each message:

- **Everything in the prompt, without caching:** USD 0.60 per message.
- **Everything in the prompt, read from cache:** USD 0.03.
- **RAG, with about 3,000 tokens of chunks and instructions:** USD 0.012.

With caching, putting everything in costs two and a half times what RAG costs, and has no search that can fail. For one location, it may be the best option.

RAG wins in three cases:

- **It doesn't fit.** The 30 locations go beyond a million tokens, the maximum of today's large models.
- **It changes all day.** Every new complaint changes the fixed part of the prompt, and caching it again costs USD 0.75 each time.
- **Extra text gets in the way.** As we saw with the context window, with a lot of text around it the model finds the fact less well.

### Fine-tuning

**Fine-tuning** means continuing to train a model with your own examples, so that its weights change. It sounds like the way to make it "learn" your menu, and it is the most common confusion on the topic.

OpenAI explains it in [Optimizing LLM accuracy](https://developers.openai.com/api/docs/guides/optimizing-llm-accuracy): you work on the context (RAG) when the model lacks knowledge, because it wasn't in its training, it is out of date or it is private. And you work on the model (fine-tuning) when it answers with inconsistent formatting, the wrong tone or without following the requested reasoning. One is what it knows. The other, how it answers.

For the menu of 30 locations, fine-tuning doesn't work. What it learns stays fixed in the weights, and the menu changes. It doesn't say where it got a fact from. And every change requires training again.

Besides, today it is barely available:

- **OpenAI is shutting it down.** Since May 2026 it doesn't accept organizations that hadn't used it before, and from January 6, 2027 nobody will be able to create new training jobs. Models already trained keep working until the model they are based on is retired: some shut down on January 14, 2027.
- **Anthropic doesn't offer it for its current models.** The only path was Claude 3 Haiku on Amazon Bedrock, Amazon's service for using models from several companies, and that model has already been retired.
- **Google offers it only on its enterprise platform**, for some Flash models and Gemini 2.5 Pro, not for Gemini 4. It isn't in the Gemini API.

If the problem is how it answers, the first step is clear instructions and a few examples in the system prompt, as covered with prompting. Fine-tuning is for when that isn't enough and your provider offers it.

<figure>
<p class="fig-title">What to use</p>
<svg viewBox="0 0 400 540" width="100%" role="img" aria-labelledby="g13bt" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g13bt">Decision diagram: if the problem is that the model doesn't know your data, and it fits in the prompt and changes little, it goes in the prompt with caching; if it doesn't fit or changes often, RAG. If the problem is how it answers, first instructions and examples in the prompt; if that isn't enough, fine-tuning, if your provider offers it.</title>
<defs><marker id="g13bink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<rect x="10" y="14" width="230" height="58" rx="10" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="38.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Is the problem that</text>
<text x="125.0" y="56.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">it doesn't know your data?</text>
<path d="M125 72V106" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="135" y="94" font-size="14" fill="var(--color-muted)" text-anchor="start">yes</text>
<rect x="10" y="108" width="230" height="58" rx="10" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="132.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Does it fit in the prompt</text>
<text x="125.0" y="150.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">and change little?</text>
<path d="M240 137H260" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="250" y="125" font-size="12" fill="var(--color-muted)" text-anchor="middle">yes</text>
<rect x="262" y="108" width="128" height="58" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="326.0" y="132.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">In the prompt,</text>
<text x="326.0" y="150.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">with caching</text>
<path d="M125 166V200" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="135" y="188" font-size="14" fill="var(--color-muted)" text-anchor="start">no</text>
<rect x="10" y="202" width="230" height="46" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="229.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">RAG</text>
<path d="M240 43H394V330H242" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="388" y="228" font-size="14" fill="var(--color-muted)" text-anchor="end">no: the problem is</text>
<text x="388" y="245" font-size="14" fill="var(--color-muted)" text-anchor="end">how it answers</text>
<rect x="10" y="302" width="230" height="58" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="326.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Instructions and</text>
<text x="125.0" y="344.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">examples in the prompt</text>
<path d="M125 360V394" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<rect x="10" y="396" width="230" height="46" rx="10" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="423.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Is it enough?</text>
<path d="M240 419H260" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="250" y="407" font-size="12" fill="var(--color-muted)" text-anchor="middle">yes</text>
<rect x="262" y="400" width="110" height="38" rx="19" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="317.0" y="423.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Done</text>
<path d="M125 442V476" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g13bink)"/>
<text x="135" y="464" font-size="14" fill="var(--color-muted)" text-anchor="start">no</text>
<rect x="10" y="478" width="230" height="52" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="125.0" y="499.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Fine-tuning, if your</text>
<text x="125.0" y="517.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">provider offers it</text>
</svg>
<figcaption><ul><li>White: the questions.</li><li>Orange: what is solved with your prompt and your code.</li><li>Green: what changes the model.</li><li>First you need to know what is failing: whether it doesn't know something, or knows it and answers badly.</li></ul></figcaption>
</figure>

## The same in Claude, GPT and Gemini

This is how it looks in Claude (by Anthropic), GPT (the OpenAI models behind ChatGPT) and Gemini (by Google):

| | Claude | GPT | Gemini |
|---|---|---|---|
| Reranker | None of its own. Its documentation uses Voyage (`rerank-3`) | No standalone one: its File Search ranks internally | A reranking service on its enterprise platform |
| Ready-made hybrid search | No: it stays in your code | File Search combines embeddings and words, and the weight of each can be adjusted | File Search uses embeddings only, according to its documentation |
| Metadata filters | In your code | Yes, with data attached to each file | Yes, with data attached to each file |
| Fine-tuning | No, for current models | Shutting down: from January 2027, nobody | Only on its enterprise platform, and not for Gemini 4 |

OpenAI has the most complete ready-made search: hybrid, with filters, question rewriting and a threshold to discard weak results. With Claude, everything in this post stays on your side, with the reranker and the database you choose.

## In short

- The search fails for three reasons: the chunk doesn't say what it is about, similar isn't correct, and embeddings are weak with exact things.
- Metadata filters narrow things down before searching. They are the simplest, and the first step if the question carries the data.
- Reranking rereads the candidates together with the question and reorders them.
- Hybrid search adds word search (BM25) for exact names and codes.
- Contextual Retrieval writes for each chunk where it comes from. With the three techniques together, Anthropic measured 67% fewer failures.
- An agent can search several times, at the cost of more turns.
- No technique always improves things: you measure with known questions, before and after.
- If your documents fit and change little, putting them in the prompt with caching can be better than RAG.
- Fine-tuning changes how a model answers, not what it knows. And today it is barely available.

So far, the assistant answers with free text. Later in the series: how to ask the model for an answer in a fixed format your code can read.
