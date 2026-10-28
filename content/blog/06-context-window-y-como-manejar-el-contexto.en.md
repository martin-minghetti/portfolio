---
title: "The context window and how to manage context"
date: 2026-10-27
order: 6
draft: true
description: "What the context window is, what fills it, what happens when it fills up, what it costs, and the techniques to decide what the model sees, in Claude, OpenAI and Gemini."
---

The pizzeria's assistant answers on WhatsApp all night. At nine, a customer says: "I'm celiac". They order, ask about delivery, change the address, check whether there is any fainá (a chickpea flatbread) left. Forty messages later they write: "Add another pizza, the usual". To answer well, the model has to keep the celiac part in mind, and that was a long way back.

As we saw earlier in the series, the model does not remember anything between one call and the next: the application sends it the whole conversation again every time. This post is about what happens when that conversation grows: how much fits, how much it costs and how to decide what the model sees.

## The context window

The **context window** is the maximum number of tokens the model can process in a single call. Everything you send counts, and so does what it answers. According to Anthropic's documentation, this includes:

- the system prompt,
- every message in the conversation,
- the definitions of the tools it can use, and the results those tools returned (for example, how much fainá is left),
- attached images and documents,
- the model's answer, reasoning included.

At the start of the conversation, a good part of it is the fixed stuff: the system prompt and the tools. In a long conversation, what weighs most are the old messages and the tool results:

<figure>
<p class="fig-title">What takes up the window over a conversation</p>
<div class="tok-row"><div class="tok-head"><span>Message 3</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c2">tools</span><span class="tok c4">messages</span><span class="tok c1">answer</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Message 40</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c2">tools</span><span class="tok c4">old messages</span><span class="tok c3">tool results</span><span class="tok c4">more messages</span><span class="tok c3">more results</span><span class="tok c4">new message</span><span class="tok c1">answer</span></div></div>
<div class="tok-row"><div class="tok-head"><span>After summarizing</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c2">tools</span><span class="tok c4">summary of what came before</span><span class="tok c4">new message</span><span class="tok c1">answer</span></div></div>
<figcaption><ul><li>Diagram not to scale.</li><li>Purple: system prompt.</li><li>Orange: tool definitions.</li><li>Light blue: messages.</li><li>Red: tool results.</li><li>Green: the answer, which also takes up space.</li></ul></figcaption>
</figure>

There is a detail that is easy to miss. The model's reasoning counts toward the output limit and is billed as output, even when it is not shown. And in current Claude models, that reasoning also stays in the history: on the next call it takes up space again, now as input, and you pay for it again.

## What happens when it fills up

In Claude there are two cases. If what you send no longer fits in the window, the API rejects the request with an error. If it fits, but there is not enough room left for the whole answer, the model starts answering and gets cut off when it reaches the limit.

Today the big three have windows of around one million tokens:

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Window | 1 million in Fable 5.1, Opus 5.5, Sonnet 5.5 and Haiku 5.5 | 1.05 million in the GPT-6 family | 1,048,576 in Gemini 4 Argon |
| Answer limit | 128 thousand tokens | 128 thousand tokens | no limit of its own: it can use whatever the input leaves free (65,536 by default) |
| Long-context surcharge | only in Haiku 5.5: above 100 thousand input tokens, the whole request costs five times more | above 272 thousand input tokens, double for input and 1.5 times for output, on the whole request | none |

In all three, the input and the answer come out of the same space. A million tokens is a lot, but it is not infinite, and it is not a good idea to use it all.

## More context is not always better

As the window fills up, the model remembers what it has in front of it less precisely. Anthropic calls this **context rot**. The company Chroma measured it in 2025 with 18 models: all of them did worse as the input grew, and even worse when there were similar facts acting as distractions.

The cause has to do with **attention**, the mechanism the model uses to relate each token to the others. With more text, that attention is spread across more things, and what matters has more competition. At the pizzeria, "I'm celiac" competes with forty messages about addresses, delivery and stock.

Where the information sits also matters. A 2023 study from Stanford University, called [Lost in the Middle](https://arxiv.org/abs/2307.03172), found that the models of that time made better use of information placed at the beginning or at the end than in the middle. Models have improved since then, and each provider recommends its own order, as we saw when talking about the system prompt.

That is why, since September 2025, Anthropic talks about **context engineering**: making sure, throughout the whole task, that the model sees the smallest possible set of useful information, and not just writing a good first prompt.

## What it costs

Since every call sends everything again, each message costs more than the one before: message 40 pays for the 39 that came before it. On top of that come the long-context surcharges in the table: in OpenAI, going over 272 thousand tokens makes the whole request more expensive, and in Claude Haiku 5.5, going over 100 thousand multiplies it by five.

Caching, which we will see later in the series, makes what repeats cheaper. But it does not free up space: according to Anthropic, what is cached still takes up the window.

## How to manage context

These are the most common techniques, from the simplest to the most elaborate.

**Trimming.** Send only the latest messages and drop the oldest ones. It is the cheapest option, and Anthropic says some chat apps work this way. But you lose what came first: at the pizzeria, the celiac part.

**Summarizing, or compaction.** When the conversation gets close to a limit, the old messages are replaced with a summary and the conversation continues from there. A good summary keeps the celiac part and drops the delivery details. It has two costs: the summary is one more call to the model, and it loses details. In an Anthropic example with six facts, the three central ones survived the summary and the three that came from tables in an appendix were lost. Anthropic notes that it is an example, not a measurement.

- **Claude** does it in its API, in beta, in two ways: on its own, when it passes a limit you set, or when you ask for it. Anthropic recommends the second.
- **OpenAI** also compacts in its API, when it passes a limit or on request. The summary comes encrypted: you cannot read what it kept.
- **Gemini**: its API does not include it and you have to build it yourself. The ADK, Google's kit for building agents, does it.

**Clearing old tool results.** If the model already used a tool's result and does not need it anymore, it is removed from the window and a placeholder stays in its place. It works when the data can be requested again: if the model needs it again, it calls the tool again. Asking again costs one more call, and the data may have changed: the fainá left at ten is not what was left at nine. Claude offers this in beta.

**Bringing in only what is relevant.** Instead of pasting the whole menu or every review, find the parts that answer the question and send only those. This technique is called RAG and has its own post later on.

**Keeping memory outside the window.** The model writes down what matters, like "celiac customer", and reads it again when needed, even in another session. None of the three basic APIs keeps memory between sessions on its own. Claude has a memory tool: the model asks to save or read a note, and it is your application that stores it, wherever you want. The memory is yours, not the provider's. In an Anthropic example, a second session with memory used almost half the context it used without it (173 thousand tokens versus 334 thousand). Google offers something similar on its agent platform (Memory Bank), and OpenAI in its kit for building agents.

**Loading just in time.** Instead of preloading everything, you give the model lightweight references, like file names or links, and it fetches the content only when it needs it. Skills work this way: the model sees a short description of each one and loads the rest only if it is going to use it. Partly thanks to this idea, Anthropic cut Claude Code's fixed instructions by more than 80% for the most advanced models.

**Splitting the work.** An agent can send another one, a subagent, to look into something in its own window, and get back only a short summary. According to Anthropic, these are usually between one and two thousand tokens. It has a downside, which we will see with agents, later in the series.

## Which one to use

It depends on what is filling the window:

| What fills it | What to do |
|---|---|
| Tool results that can be requested again | Clear them |
| The conversation and the reasoning | Summarize |
| Large documents or data | Bring in only what is relevant, or load it just in time |
| Something that has to survive to the next session | Memory |

They can be combined. Anthropic suggests starting with the one that tackles what you actually see growing.

## Count before you send

The big three let you know how many tokens a request takes before sending it, and after each call they report it in the response. With the Claude API, in Python, you can measure the conversation and trim it if it goes over a limit:

```python
import anthropic

client = anthropic.Anthropic()
system = "You are the assistant for La Esquina pizzeria. Keep answers short."
LIMIT = 100_000  # tokens

def prepare(history):
    n = client.messages.count_tokens(
        model="claude-opus-5-5", system=system, messages=history
    ).input_tokens
    print("input tokens:", n)
    if n < LIMIT:
        return history
    # Trim: keep the last 20 messages.
    # Anything said earlier, like "I'm celiac", is lost.
    return history[-20:]
```

Trimming is the simplest technique, and the comment shows its problem. To avoid losing the celiac part, that last step is replaced with a summary or a note in memory.

## In short

- The context window is everything the model processes in one call: system prompt, messages, tools, their results and the answer, reasoning included.
- The big three are around a million tokens, but filling it is expensive and does not give better results: the model remembers worse the more it has in front of it.
- In a long conversation, what fills it most are the old messages and the tool results.
- There is a technique for each case: trimming, summarizing, clearing tool results, bringing in only what is relevant, memory, loading just in time and splitting the work. You pick based on what is filling the window.

The next post is about tools: how a model that only writes text can do things in the world, like looking up data or sending an email.
