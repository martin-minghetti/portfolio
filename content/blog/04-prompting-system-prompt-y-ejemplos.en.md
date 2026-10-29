---
title: "Prompting: system prompt and examples"
date: 2026-10-29
order: 4
draft: false
description: "How to write a system prompt the model follows, what each provider recommends and when it pays to give examples, with one concrete case from start to finish."
---

The previous post put together the conversation of a pizzeria's assistant: a list of messages, with the background instructions before everything else. This post is about what to write there, and how to show the model examples of what you expect.

A **prompt** is the text you give the model. **Prompting**, or **prompt engineering**, is the craft of writing that text to get good answers.

## A bad system prompt and a good one

The **system prompt** is the background instructions: the model's role, its rules, the format and the tone of its answers. It goes before everything else, on every call.

A weak system prompt for the pizzeria would be this:

```text
You are a helpful assistant. Be nice.
```

It does not say what the place sells, or what to do when some information is missing. If someone asks how much a pizza costs, the model will fill the gap however it can, and that can mean a made-up price. A better one:

```text
You are the assistant for La Esquina pizzeria. Answer in two or three sentences,
because people read on their phones.

<menu>
Mozzarella: $9,000
Neapolitan: $10,500
Gluten-free (mozzarella): $11,000
</menu>

Only answer about the menu, opening hours and orders. If someone asks for a price
that is not in <menu>, say you do not have it and offer to take the order on WhatsApp:
a made-up price ends up as a complaint.
```

It has four parts: who it is and who it writes for, the information it needs (set apart with tags), how far it goes, and what to do when it does not know something. Each rule comes with its reason.

Still, a system prompt is an instruction the model usually follows, not a lock. The controls that do not depend on the model obeying come later in the series.

## How to write instructions that get followed

The providers' official guides agree on a few ideas:

- **Explain the why.** Anthropic gives this example: "NEVER use ellipses" works worse than "your answer will be read aloud by a text-to-speech engine, so never use ellipses, because it will not know how to pronounce them". With the reason, the model can apply the rule to cases that were not written down.
- **Say what to do, not only what not to do.** "Answer in paragraphs" works better than "do not use lists".
- **Do not take anything for granted.** Anthropic warns that its current models follow instructions more literally than earlier ones. If a rule applies to every answer, you have to say so.
- **The colleague test.** Anthropic suggests showing the prompt to someone who does not know the task: if that person would be confused, the model will be too.

Where the guides differ is in how to lay out the prompt:

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| How to separate the parts | XML tags, like `<menu>` or `<instructions>` | Markdown headings for sections and XML tags to mark off content | XML tags or Markdown headings, but only one of them across the whole prompt |
| Suggested order | long documents at the top, the question at the end | identity, instructions, examples and context, in that order | all the context first, the question at the end |

Anthropic says that putting the question at the end, after long documents, improved answer quality by up to 30% in its tests.

## What goes in the system prompt and what does not

The system prompt is sent and paid for on every call, so whatever is almost never used just takes up space and costs money.

In a guide on commerce agents from September 2026, Anthropic suggests a starting point: anything relevant to a third or more of requests goes in the system prompt. Critical rules always go in, even if they are rarely used: safety, legal matters, brand constraints and key facts about the user, such as an allergy. The rest can go into **skills**, separate instructions the model only sees by name and a short description, and loads in full when it needs them. The guide points out the other side: loading a skill costs the model an extra step, so whatever is needed most of the time is better left in place. The threshold, it says, depends on each case and on what testing shows.

## Zero-shot and few-shot: asking with or without examples

The pizzeria wants to sort its customers' reviews into positive and negative. There are two ways to ask:

- **Zero-shot:** you ask without examples. "Classify this review as positive or negative."
- **Few-shot:** you include a few solved examples, so the model sees the format and the criterion.

Examples show things that are hard to put into words. If a review says "tasty, but pricey", is it positive or negative? A long rule could explain it; an example settles it in one line:

```python
import anthropic

client = anthropic.Anthropic()
system = """You classify reviews for a pizzeria. Answer only "positive" or "negative".
<examples>
<example>"Arrived hot and fast" -> positive</example>
<example>"Took an hour and came cold" -> negative</example>
<example>"Tasty, but pricey" -> positive</example>
</examples>"""

r = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=2048,
    system=system,
    messages=[{"role": "user", "content": '"The dough was raw"'}],
)
print("".join(b.text for b in r.content if b.type == "text"))
```

Examples can go like this, inside the system prompt and between tags, or as pairs of user and assistant messages written by the application, as the previous post showed.

What each provider says about examples:

- **Anthropic** calls them one of the most reliable ways to steer format and tone, recommends 3 to 5, varied, and notes they also help when the model reasons before answering.
- **Google** recommends always including them, and warns that with too many the model may start copying them too closely.
- **OpenAI** asks for varied examples. For its o-series reasoning models, though, it suggests trying without examples first and adding them only if needed.

The risk with examples is that the model copies more than you wanted: the length, the wording, the order. That is why they should differ from one another.

Learning from the examples in the prompt has a name: **in-context learning**. The model does not change its weights, which the previous post covered: it learns from what it has in front of it at that moment. And it lasts only while it is in what you send. If the next call does not include the examples, the model does not know them.

## In short

- The system prompt sets the role, the rules, the format and the tone. A good one says who the assistant is, what information it has, how far it goes and what to do when it does not know.
- Instructions work better with their reason, saying what to do and taking nothing for granted: current models follow them to the letter.
- The system prompt holds what is used often and the critical rules. The rest can be loaded only when needed.
- Few-shot means asking with examples. It usually gives more consistent answers, but the examples need to be varied so the model does not copy them too closely.

The next post continues with prompting: asking the model to reason step by step and how to control how creative or predictable its answers are.
