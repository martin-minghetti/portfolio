---
title: "Prompt caching: paying only once for the part that repeats"
date: 2026-11-09
order: 15
draft: false
description: "How to store the fixed part of the prompt so you don't pay for all of it in every message: what gets stored, why the beginning has to match, what breaks it, when 5 minutes, 1 hour or nothing makes sense, and how to measure it in Claude, GPT and Gemini."
---

Back to the La Esquina assistant. Every time a customer writes, the request to the API carries the same thing up front: the tools (`check_stock`, `place_order`), the system prompt with the menu, the hours, the delivery areas and the rules, some example conversations and the order schema. Only at the end comes what is new: the customer's message.

Let's put example numbers on it, not measured: 8,000 fixed tokens, 400 that change with each message and 300 messages a day. With Claude Opus 5.5 prices (USD 4 per million input tokens), each message costs USD 0.0336 just in what you send. And almost all of that is the 8,000 tokens that are the same in all 300 messages of the day.

The model processes that fixed part 300 times, always the same. **Prompt caching** is the way to pay for it in full only once.

## What gets stored and what doesn't

A **cache** is a saved copy of something already calculated, so you don't have to calculate it again.

Before writing a single word, the model reads the whole prompt and does some intermediate calculations for each token. That is what gets stored: the result of processing the beginning part. If the next request starts exactly the same, the provider uses those calculations and the model only processes what is new.

Two things it is not:

- **It does not store the answer.** The model answers again every time. Anthropic puts it this way: caching "has no effect on output token generation", it doesn't change the answer at all.
- **It is not storing the conversation.** As we saw when talking about how a model works, some providers can store the history on their side, but they still pass all of it to the model and the model processes all of it. The cache is what avoids that second processing.

And one we already saw with the context window: what comes from the cache is cheaper, but it still takes up room in the window.

## The beginning has to match, token by token

The cache works with the **prefix**: the beginning of the prompt, from the first token to where you mark that it should be stored. For it to work, the prefix of the new request has to be identical to the stored one. Not similar: identical. Anthropic asks for "100 percent identical prompt segments".

And order matters. In Claude, the request is always built the same way: first the tools, then the system prompt, then the messages. If something changes in one place, everything after it stops matching and gets processed again, even if the rest is the same.

<figure>
<p class="fig-title">What matches and what doesn't</p>
<div class="tok-row"><div class="tok-head"><span>8:14 pm, the first</span></div><div class="tok-text"><span class="tok c2">Tools</span><span class="tok c2">System: menu, rules, examples</span><span class="tok c2">Order schema</span><span class="tok c4">It's 8:14 pm. "I want 2 mozzas"</span></div></div>
<div class="tok-row"><div class="tok-head"><span>8:15 pm, another customer</span></div><div class="tok-text"><span class="tok c0">Tools</span><span class="tok c0">System: menu, rules, examples</span><span class="tok c0">Order schema</span><span class="tok c4">It's 8:15 pm. "Do you have faina?"</span></div></div>
<div class="tok-row"><div class="tok-head"><span>8:16 pm, with the time in the system prompt</span></div><div class="tok-text"><span class="tok c0">Tools</span><span class="tok c3">System: it's 8:16 pm, menu, rules...</span><span class="tok c3">Order schema</span><span class="tok c4">"a neapolitan"</span></div></div>
<figcaption><ul><li>Orange: what is processed and stored the first time.</li><li>Violet: what is read from the cache.</li><li>Light blue: what is new in each request, which is paid in full.</li><li>Red: from the first different token on, nothing is reused, even though the menu and the schema are the same.</li><li>The mark for how far to store goes at the end of the fixed part, before the message.</li></ul></figcaption>
</figure>

From there comes the rule Anthropic, OpenAI and Google all give: fixed things at the top, changing things at the bottom.

## Writing, reading and expiring

The cache has three moments, and each one is billed differently:

- **Writing.** The first request processes the fixed part and stores it. In Claude, storing it for 5 minutes costs 1.25 times the normal input price.
- **Reading.** The following requests that start the same read it. On Opus 5.5, reading costs 5% of the input price (on most Anthropic models, 10%, and on Fable 5.2, 2.5%).
- **Expiring.** If 5 minutes go by without anyone using it, it is deleted, and the next request writes it again. Each read renews the deadline at no extra cost. That deadline is usually called **TTL** ("time to live"), and it runs from when the request starts, not from when the answer ends.

<figure>
<p class="fig-title">Three requests at La Esquina</p>
<svg viewBox="0 0 400 440" width="100%" role="img" aria-labelledby="g15t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g15t">Sequence diagram between your code, the API and the cache: the first request writes the fixed part, the second, three minutes later, reads it and renews the deadline, and the third arrives 36 minutes later, when it has already expired, and writes it again.</title>
<defs><marker id="g15c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(55% 0.15 300)"/></marker><marker id="g15c2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(58% 0.13 70)"/></marker><marker id="g15c3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(55% 0.17 25)"/></marker></defs>
<path d="M60 58V430" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M200 58V430" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M340 58V430" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<rect x="4" y="14" width="112" height="44" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="60.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Your code</text>
<rect x="144" y="14" width="112" height="44" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">API</text>
<rect x="284" y="14" width="112" height="44" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="340.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Cache</text>
<path d="M64 112H196" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g15c2)"/>
<text x="130.0" y="87" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">4:00 pm: fixed part</text>
<text x="130.0" y="104" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">+ message 1</text>
<path d="M204 172H336" fill="none" stroke="oklch(55% 0.15 300)" stroke-width="1.6" marker-end="url(#g15c0)"/>
<text x="270.0" y="147" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">writes the fixed part</text>
<text x="270.0" y="164" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">1.25x, 5 min</text>
<path d="M64 232H196" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g15c2)"/>
<text x="130.0" y="207" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">4:03 pm: fixed part</text>
<text x="130.0" y="224" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">+ message 2</text>
<path d="M336 292H204" fill="none" stroke="oklch(55% 0.15 300)" stroke-width="1.6" marker-end="url(#g15c0)"/>
<text x="270.0" y="267" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">reads: 5% of the price</text>
<text x="270.0" y="284" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">and renews the 5 min</text>
<path d="M64 352H196" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g15c2)"/>
<text x="130.0" y="344" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">4:39 pm: 36 min later</text>
<path d="M204 412H336" fill="none" stroke="oklch(55% 0.17 25)" stroke-width="1.6" marker-end="url(#g15c3)"/>
<text x="270.0" y="387" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">already expired:</text>
<text x="270.0" y="404" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">writes again</text>
</svg>
<figcaption><ul><li>Orange: your code, which sends the fixed part and the message.</li><li>Green: the Claude API.</li><li>Violet: the cache.</li><li>Red: the message arrived after the cache had already expired.</li><li>With the 1-hour cache, the last step would be another read.</li></ul></figcaption>
</figure>

With Opus 5.5 prices, a La Esquina message works out like this:

- **Without cache:** (8,000 + 400) tokens × USD 4 per million = USD 0.0336.
- **The first one, which writes:** 8,000 × USD 5 per million + 400 × USD 4 per million = USD 0.0416. More expensive than without cache.
- **The next one, which reads:** 8,000 × USD 0.20 per million + 400 × USD 4 per million = USD 0.0032. Ten times less.

The write is recovered with a single read. Anthropic says so on its pricing page: the 5-minute cache pays off from the first read.

## Where the mark goes

In Claude, you ask for caching with `cache_control`, which marks how far to store. There are two ways:

- **Automatic:** `cache_control` at the top of the request, and the mark goes on its own to the last block. It works for a growing conversation: each new message stores everything before it.
- **Explicit:** `cache_control` on a specific block, up to four marks per request.

Here is the most common trap. At La Esquina, the last block is the customer's message, which always changes. With automatic, the mark lands on that message: each request stores something the next one won't repeat, and between different customers it never hits. Anthropic lists it as a common mistake in its documentation: you pay for a write on every request "and never get a read". OpenAI gives the same advice: with its explicit marks, what comes after the last mark is paid as normal input and not stored, which avoids "writing changing content that is unlikely to be reused".

The mark goes at the end of the fixed part:

```python
import anthropic

client = anthropic.Anthropic()

# The fixed part: menu, rules, hours, delivery areas and examples. The same in every request.
FIXED_PART = open("la_esquina.txt", encoding="utf-8").read()

# Always the same tools, in the same order.
TOOLS = [
    {"name": "check_stock", "description": "Says whether a product is available today.",
     "input_schema": {"type": "object", "properties": {"product": {"type": "string"}},
                      "required": ["product"]}},
    {"name": "place_order", "description": "Places a confirmed order.",
     "input_schema": {"type": "object", "properties": {"details": {"type": "string"}},
                      "required": ["details"]}},
]

def answer(message, time):
    r = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        tools=TOOLS,
        system=[{
            "type": "text",
            "text": FIXED_PART,
            "cache_control": {"type": "ephemeral", "ttl": "1h"},  # stored up to here
        }],
        # What changes goes after the mark: the time and the customer's message.
        messages=[{"role": "user", "content": f"It's {time}. Customer: {message}"}],
    )
    u = r.usage
    total = u.cache_read_input_tokens + u.cache_creation_input_tokens + u.input_tokens
    print(f"read from cache: {u.cache_read_input_tokens} | written: {u.cache_creation_input_tokens} "
          f"| without cache: {u.input_tokens} | hits: {u.cache_read_input_tokens / total:.0%}")
    return r
```

What to look at:

- **`cache_control` goes on the last block of the fixed part.** Since the tools come before the system prompt, they end up inside what gets stored.
- **`"ttl": "1h"` stores for one hour.** Without `ttl`, it is 5 minutes. Why one hour at La Esquina, below.
- **The time is in the message, not in the system prompt.** It goes after the mark.
- **`usage` says what happened.** `cache_creation_input_tokens` is what was written, `cache_read_input_tokens` what was read, and `input_tokens` what came after the mark, which is paid in full.

In two requests in a row, it would look something like this:

```text
read from cache: 0 | written: 8000 | without cache: 410 | hits: 0%
read from cache: 8000 | written: 0 | without cache: 395 | hits: 95%
```

The numbers in that output are an example. The code was tested without connecting to the API: what the SDK sends has the shape the documentation asks for, and the reading of `usage` works with simulated responses. The real call to Claude needs a key and is not tested here.

One more detail: if the fixed part does not reach a minimum number of tokens, it is not stored, and the API does not warn you. On Claude 5.x models the minimum is 512 tokens. The short system prompt we saw when talking about prompting, a few lines long, would not reach it. If both cache fields come back as 0, it is the first thing to check.

## What breaks it

The cache is lost every time something changes before the mark. With La Esquina, the typical mistakes are these:

- **The time in the system prompt.** "It's 8:14 pm" at the top makes every request have a different beginning. Every request writes and none reads: with the numbers above, it costs 23.8% more than not using cache. The time goes in the message.
- **The day's stock inside the menu.** Writing "no faina today" inside the menu changes the fixed part every time something runs out. Stock goes in the message, or it is checked with `check_stock`. Changing prices once a week can go in the menu: it is a new write and that's it.
- **Tools that change.** Removing `place_order` when the customer is only asking, or building the list in another order: since the tools go first, it breaks everything. Same tools, same order, always. To limit which ones it can use at a given moment, there are options that don't touch the list, like `tool_choice` in Claude or `allowed_tools` in OpenAI.
- **Switching models in the middle of the conversation.** The cache belongs to each model. Switching to a cheaper one for an easy question forces writing everything again in the other.
- **Changing the reasoning effort or the output format.** Both are among the things that invalidate the cache, in Claude and in OpenAI. You choose them at the start and don't touch them.

It happened to Anthropic with Claude Code, its coding assistant that works in the terminal. In a 2026 article, [Lessons from building Claude Code: Prompt caching is everything](https://claude.dev/blog/lessons-from-building-claude-code-prompt-caching-is-everything/), they explain that they broke their own cache by "putting an in-depth timestamp in the static system prompt" and "shuffling tool order definitions non-deterministically".

To find what changed, Claude has a diagnostic: you pass the identifier of the previous response and it says what changed, for example `model_changed` or `system_changed`. For `system_changed`, the documentation gives the typical cause: a date or time inserted into the system prompt.

## La Esquina's afternoon: 5 minutes, 1 hour or nothing

The 300 messages don't arrive evenly. At lunchtime and at night, more than one per minute. At 4 in the afternoon, one every 36 minutes. And the 5-minute cache expires between messages.

With Opus 5.5 prices, the fixed part of those 5 afternoon messages costs:

- **Without cache:** 5 × USD 0.032 = USD 0.16.
- **5-minute cache:** each message arrives after it has expired, so all 5 write: 5 × USD 0.04 = USD 0.20. 25% more expensive than not using cache.
- **1-hour cache:** writing costs 2 times the input, but it is written once and the other 4 read: USD 0.064 + 4 × USD 0.0016 = USD 0.07.

Over the whole day, with an example schedule of 300 messages:

| | Writes | Reads | Hits | Input per day | Per month, with output |
|---|---|---|---|---|---|
| Without cache | | | | USD 10.08 | USD 329 |
| 5-minute cache | 34 | 266 | 84% | USD 2.27 | USD 95 |
| 1-hour cache | 1 | 299 | 95% | USD 1.02 | USD 58 |
| The time in the system prompt | 300 | 0 | 0% | USD 12.48 | |

The last column adds what the model answers, with 150 tokens per answer (also an example). The 5-minute cache cuts what is sent by 77.5%, and the 1-hour one, by almost 90%. With 1 hour, the whole day writes only once, because no gap goes over 60 minutes. The 34 writes of the 5-minute cache come from the quiet hours. What the model answers costs the same in all three cases: the cache only makes cheaper what is sent.

The rule, which matches the one Anthropic gives:

- **If messages arrive less than 5 minutes apart:** the 5-minute cache is enough, it renews itself with each one.
- **If there are gaps of between 5 minutes and 1 hour:** the 1-hour one, as long as there are at least 2 reads in that hour. With just one, it doesn't recover what it cost to write.
- **If the fixed part is used less than once an hour** (a location that gets three messages a day): it's not worth it. Each message pays for the write and nobody reads it.

In Claude, on top of that, what is read from the cache does not count toward the tokens-per-minute limit on most models. With 80% hits, five times more tokens per minute fit. In OpenAI, it does count.

## How to measure it

The metric is the **hit rate**: what percentage of input tokens came from the cache. Each API returns it in the response, in `usage`, and the calculation changes slightly depending on the provider (see the table below). In Claude, `input_tokens` is only what comes after the mark, so the total is built by adding the three fields, as in the code.

For Anthropic it is a first-class metric. In the same article about Claude Code they say they have alerts on the hit rate and that, if it drops too low, they treat it as a service failure: "A few percentage points of cache miss rate can dramatically affect cost and latency".

Because it is also speed: the model doesn't process the fixed part again, and the answer starts sooner. Anthropic says that with long documents it "generally" improves time to first token, without giving a number for today's models.

## The same in Claude, GPT and Gemini

GPT are the OpenAI models behind ChatGPT, and Gemini, Google's. Both have caching, with differences:

| | Claude | GPT | Gemini |
|---|---|---|---|
| How you turn it on | `cache_control`: at the top (automatic) or on a block (up to 4 marks) | On its own. Since GPT-5.6 you can also choose where it cuts | On its own. On Gemini 4 models there is no other option |
| Reading | 10% of input (5% on Opus 5.5 and Sonnet 5.5; 2.5% on Fable 5.2) | 10% (5% on GPT-6.2 Astra and Sol, and on GPT-6.1 Sol and Terra) | 5% on Gemini 4 Carbon and Argon |
| Writing | 1.25 times (5 minutes) or 2 times (1 hour) | 1.25 times (30 minutes) or 2.5 times (12 hours) | At the normal input price |
| How long it lasts | 5 minutes or 1 hour; each use renews it | At least 30 minutes or 12 hours | Not published |
| Minimum | 512 tokens on 5.x models | 1,024 tokens | 4,096 tokens on Gemini 4 models |
| Fields | `cache_read_input_tokens`, `cache_creation_input_tokens` | `cached_tokens`, `cache_write_tokens` | `total_cached_tokens` |
| Counts toward the per-minute limit | No, on almost all models | Yes | Its documentation doesn't say |

In OpenAI, the write prices are for GPT-5.6 and later: earlier models charge nothing extra for writing. In Gemini, automatic caching is not guaranteed: its documentation gives tips to increase "the chance of an implicit cache hit".

Anthropic, OpenAI and Google give the same advice: fixed things at the top, changing things at the bottom, and don't touch the tools.

## In short

- The cache stores the processing of the beginning of the prompt that repeats. It does not store the answer.
- It only works if the beginning matches exactly, token by token. Fixed things go at the top and changing things at the bottom.
- Writing the cache costs a bit more than normal input; reading it, much less (between 2.5% and 10%, depending on the model).
- The mark goes at the end of the fixed part, not on the customer's message. Otherwise, it always writes and never reads.
- The time or the stock in the system prompt, tools that change, or switching models in the middle of the conversation, break it.
- It expires if it isn't used. With few messages, the 5-minute one can come out more expensive than not using cache; the 1-hour one covers the gaps.
- It is measured with the hit rate, which each API returns in the response.

So far, the assistant answers well and costs less. Later in the series: how to know, with numbers, whether it answers well.
