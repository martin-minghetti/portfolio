---
title: "Structured output: answers your code can read"
date: 2026-11-08
order: 14
draft: false
description: "How to make a model answer in a fixed format your code can read: what JSON and a schema are, how the API guarantees it, what it does not guarantee, how to design the schema so the model does not make things up, and how it works in Claude, GPT and Gemini."
---

Back to a single La Esquina location. A customer writes on WhatsApp: "I want 2 mozzas and a fugazzeta without onion to Barrio Norte".

The assistant answers well: "Sure, I've got 2 mozzarellas and a fugazzeta without onion. What address should I send it to?". For the customer, perfect. For the pizzeria's order system, it is a problem. Your code has to pull out of that sentence how many pizzas there are, which kind, what to leave out and where they go. And the sentence changes with every answer: tomorrow the model writes "two mozza", or puts the fugazzeta first.

So far, the assistant answered with free text, which is meant for people. This post is about asking it for an answer in a fixed format that your code can read without guessing. That is called **structured output**.

## What JSON and a schema are

The almost universal format is **JSON**: a way of writing data as text, with fields between curly braces, that almost every programming language understands. The order above, in JSON, looks like this:

<figure>
<p class="fig-title">The same order, as text and as JSON</p>
<div class="tok-row"><div class="tok-head"><span>What the customer writes</span></div><div class="tok-text"><span class="tok c4">I want 2 mozzas and a fugazzeta without onion to Barrio Norte</span></div></div>
<div class="tok-row"><div class="tok-head"><span>What your code receives</span></div>
<pre><code>{
  "items": [
    {
      "product": <span class="tok c0">"mozzarella"</span>,
      "quantity": <span class="tok c1">2</span>,
      "without": []
    },
    {
      "product": <span class="tok c0">"fugazzeta"</span>,
      "quantity": <span class="tok c1">1</span>,
      "without": <span class="tok c2">["onion"]</span>
    }
  ],
  "area": <span class="tok c0">"barrio_norte"</span>,
  "address": <span class="tok">null</span>,
  "missing": <span class="tok c3">["address"]</span>
}</code></pre></div>
<figcaption><ul><li>Light blue: what the customer wrote.</li><li>Violet: closed options. The product and the area can only be values from a list: "mozzas" becomes "mozzarella".</li><li>Green: numbers. Always a number, never "two".</li><li>Orange: a list of texts, what to leave off the pizza.</li><li>Gray: null, which means "no data". The customer did not give the address, and the format lets the model say so.</li><li>Red: what is missing, which your code has to ask for.</li></ul></figcaption>
</figure>

For your code to trust that, you need a **schema**: the list of fields, what type each one is and which ones are required. The standard way to write it is called **JSON Schema**. If you have been following the series, you have already seen one: it is the same thing used to describe the data a tool receives.

## Asking for it in the prompt is not enough

The first thing anyone thinks of is asking for it in the system prompt: "Answer only with JSON, with these fields". With a couple of examples, as we saw with prompting, the model does it almost every time.

The problem is the "almost". This is not code that is written once and tested: it is the answer the model writes on the spot, for every customer message, and nobody reviews it before your program reads it. Sometimes it adds text around it ("Here is the order: ..."), sometimes it gets cut off halfway because it hit the token limit, sometimes a field is missing or the quantity comes as text ("two"). With a few messages you don't notice. With thousands a day, each of those times is an order your code cannot read.

## How the API guarantees it

Today Claude (from Anthropic), GPT (the OpenAI models behind ChatGPT) and Gemini (from Google) all have structured output in their API: you pass the schema along with the message and the answer follows it. It is not that the model tries harder. It is that it cannot step outside it.

As we saw at the start of the series, a model writes one token at a time: it calculates how likely each option is and picks one. With structured output, the API turns the schema into rules and, at each step, only lets the model pick tokens that keep the JSON within those rules. Anthropic calls it "constrained decoding".

<figure>
<p class="fig-title">What the model can write</p>
<div class="tok-row"><div class="tok-head"><span>Already written</span></div><div class="tok-text"><span class="tok">{"product": "mozzarella", "quantity":</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Options for the next token</span></div><div class="tok-text"><span class="tok c1">2 (61%)</span><span class="tok" style="text-decoration:line-through;opacity:.5">" (20%)</span><span class="tok" style="text-decoration:line-through;opacity:.5">two (12%)</span><span class="tok" style="text-decoration:line-through;opacity:.5">} (7%)</span></div></div>
<figcaption><ul><li>Green: the only option that follows the schema.</li><li>Crossed out: the quote would open a text where a number goes, "two" is not a number, and closing the brace would leave the order unfinished.</li><li>The model calculates every option as usual; the API drops the ones that would break the schema and picks among the rest.</li><li>The probabilities are an example.</li></ul></figcaption>
</figure>

That is why it is a guarantee and not a request. It has a small cost: the first time a schema is used, the API prepares it and the answer takes longer (Claude keeps it for 24 hours), and the API adds some instructions to the prompt that are billed like any other token.

## Designing the schema so the model does not have to make things up

There is a trap in that guarantee. If the schema says the address is required and has to be text, the model has to write an address, whether the customer gave one or not. The format pushes it to fill in. OpenAI warns about this in its documentation: the model always tries to follow the schema, and that can lead it to make things up if the message has nothing to do with what is being asked.

Three rules for the pizzeria's schema:

- **Closed lists for anything with fixed options.** The products on the menu, the delivery areas. It is the same as the closed options in tools: that way "mozzas" can only come out as `mozzarella`.
- **An allowed way to say "I don't know".** The address accepts `null`, and a `missing` field lists what was not in the message. If that way out does not exist, the model makes it up.
- **Descriptions on the fields.** "Street and number. null if the customer did not say it." The model reads them, just like a tool's descriptions.

And one we already saw with step-by-step reasoning: don't add a "reasoning" field for the model to explain how it got to the result. In Claude, that can end in a refusal.

## What it looks like in code

This is the order with Anthropic's SDK and **Pydantic**, a widely used Python library. With Pydantic you describe what a piece of data has to look like (an order has products, each product has a quantity that is a number, and so on), and then you check that what arrives matches that description. The JSON Schema comes out of that description on its own, and the SDK sends it to Claude:

```python
from typing import Literal
import anthropic
from pydantic import BaseModel, Field, ValidationError

class Item(BaseModel):
    product: Literal["mozzarella", "neapolitan", "fugazzeta", "arugula", "faina"]
    quantity: int = Field(ge=1)
    without: list[str] = Field(description="Ingredients the customer asked to leave out")

class Order(BaseModel):
    items: list[Item]
    area: Literal["centro", "barrio_norte", "villa_sur"] | None
    address: str | None = Field(description="Street and number. null if the customer did not say it")
    missing: list[str] = Field(description="Data still needed to place the order")

client = anthropic.Anthropic()
message = "I want 2 mozzas and a fugazzeta without onion to Barrio Norte"

try:
    r = client.messages.parse(
        model="claude-opus-5-5",
        max_tokens=16000,
        system="You turn WhatsApp messages to La Esquina pizzeria into orders. "
               "Don't make up data: if something is not in the message, it goes as null and in 'missing'.",
        messages=[{"role": "user", "content": message}],
        output_format=Order,
    )
    order = r.parsed_output  # an Order, already validated
except ValidationError:  # cut off, the model refused, or it breaks a rule the model can't see
    order = None

if order is None:
    print("Could not read the order. Handing it to a person.")
else:
    for item in order.items:
        print(item.quantity, item.product, item.without)
    print("Area:", order.area, "| Missing:", order.missing)
```

What to look at:

- **`Literal` is the closed list.** The product can only be one of the five on the menu, and the area one of the three with delivery (or `None`).
- **`| None` and `missing` are the way to say "I don't know".** With the example message, you would expect `address` to be `None` and `missing` to contain the address.
- **List values go in lowercase and without spaces.** Claude does not guarantee the capitalization of those values, especially for the letter after a space: with "barrio norte" it may return "barrio Norte", and Pydantic would reject it. With "barrio_norte", without spaces, that risk goes down.
- **`Field(ge=1)` is a rule the model can't see.** Claude does not accept minimums or maximums in the schema. The SDK takes the rule out, writes it into the field's description so the model takes it into account, and checks it when the answer comes back.
- **`parsed_output` is already an object with types.** `item.quantity` is a number, ready to use.
- **The `try` is not decoration.** If the answer is cut off by `max_tokens`, the JSON arrives half-written and `parse` fails with a validation error before returning anything. If the model refuses, it may come back empty or fail just like a cut-off answer: the `try` covers both cases.

Without connecting to the API, you can test what Pydantic does with different answers. A JSON with "two" as the quantity gives `Input should be a valid integer`. One with "cheese pizza" gives `Input should be 'mozzarella', 'neapolitan', 'fugazzeta', 'arugula' or 'faina'`. And one cut off halfway gives `Invalid JSON: EOF while parsing` (the text ended before the JSON was closed). The call to Claude needs a key and is not tested here.

## What it does not guarantee

The API guarantees the shape. It does not guarantee the content.

**That the values are correct.** This order passes validation without a single error: 500 fugazzetas, without onion and without mozzarella, to Villa Sur. It is perfect JSON and an absurd order: a fugazzeta without onion or mozzarella is just dough. The schema knows nothing about pizza. OpenAI and Google each say it their own way. OpenAI: structured output "can still contain mistakes". Google: even if the JSON is correct, "always validate values in your application".

**That there is always an answer.** If the model refuses to answer, the response does not follow the schema: Claude flags it with `stop_reason: "refusal"`, and OpenAI with a `refusal` field. If it is cut off by the token limit, the JSON is left half-written.

**That every rule in the schema is applied.** Claude does not guarantee the capitalization of closed lists. Gemini silently ignores some rules, like the minimum or maximum length of a text.

That is why you validate twice, and then apply the business rules. It is the output check we saw with guardrails, now with data instead of text:

<figure>
<p class="fig-title">From message to placed order</p>
<svg viewBox="0 0 400 482" width="100%" role="img" aria-labelledby="g14t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g14t">Diagram from message to placed order: your code sends the customer message with the Order schema; Claude writes only what the schema allows; Pydantic validates the JSON in your code; then the La Esquina rules; if everything passes, the order is placed. If Claude refuses, the answer is cut off or it fails validation, the order goes to a person; if a piece of data is missing, the customer is asked.</title>
<defs><marker id="g14ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<rect x="10" y="14" width="240" height="58" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="38.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">"I want 2 mozzas and a</text>
<text x="130.0" y="56.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">fugazzeta without onion..."</text>
<path d="M130 72V94" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g14ink)"/>
<rect x="10" y="96" width="240" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="120.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Your code sends the message</text>
<text x="130.0" y="138.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">and the Order schema</text>
<path d="M130 152V174" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g14ink)"/>
<rect x="10" y="176" width="240" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="200.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Claude writes the JSON</text>
<text x="130.0" y="218.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">only what the schema allows</text>
<path d="M250 204H326V234" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#g14ink)"/>
<text x="334" y="196" font-size="13" fill="var(--color-muted)" text-anchor="start">refused</text>
<text x="334" y="212" font-size="13" fill="var(--color-muted)" text-anchor="start">or cut off</text>
<rect x="262" y="236" width="128" height="58" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="326.0" y="260.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Hand off to</text>
<text x="326.0" y="278.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">a person</text>
<path d="M130 232V254" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g14ink)"/>
<rect x="10" y="256" width="240" height="56" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="280.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Pydantic validates</text>
<text x="130.0" y="298.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">the shape and the hidden rules</text>
<path d="M250 284H260" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#g14ink)"/>
<path d="M130 312V334" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g14ink)"/>
<rect x="10" y="336" width="240" height="56" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="360.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">La Esquina rules</text>
<text x="130.0" y="378.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">over 20, no address</text>
<path d="M250 364H260" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#g14ink)"/>
<rect x="262" y="336" width="128" height="56" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="326.0" y="359.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Ask the</text>
<text x="326.0" y="377.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">customer</text>
<path d="M130 392V414" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g14ink)"/>
<rect x="10" y="416" width="240" height="50" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="130.0" y="445.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Place the order</text>
</svg>
<figcaption><ul><li>Light blue: the customer.</li><li>Orange: your code.</li><li>Green: the model.</li><li>Red: the checks. If Claude refuses, if the answer is cut off or if the JSON fails validation, the order goes to a person. If the pizzeria's rules find a problem, the customer is asked (or, with more than 20 pizzas, a person).</li><li>Violet: what gets saved.</li></ul></figcaption>
</figure>

The 20-pizza limit does not go in the schema. If it were there, an order for 25 would give an error and be lost; in your code, it gets handed to a person, as we saw with guardrails.

## Structured output or a tool

Tools also have a strict mode, which guarantees that a tool call follows its schema. So when do you use each one? Anthropic, OpenAI and Google give almost the same rule:

- **A tool**, when the model has to do something in the middle of the conversation: check stock or place the order inside the agent loop.
- **Structured output**, when you want the final answer in a fixed format: a step in your code that turns the message into an order. It is what was missing in the "understand the order" step of the LangGraph example, which had been left with a fixed order for testing.

You can use both for the same order.

A question that comes up often: does forcing the model into a format make it think worse? A 2024 study by Appier, an artificial intelligence company from Taiwan, together with National Taiwan University, [Let Me Speak Freely?](https://arxiv.org/abs/2408.02442), found that the format made reasoning tasks worse and classification tasks better. Others disputed it, among them .txt, a company that sells tools for formatted output. With today's models, the question has changed: Claude can think before answering, and the format applies only to the final answer, not to that reasoning. Besides, turning a message into an order is much closer to classifying than to reasoning.

## The same in Claude, GPT and Gemini

| | Claude | GPT | Gemini |
|---|---|---|---|
| How you ask for it | `output_config.format`, with the schema | `text.format`, with the schema and `strict: true` | `response_format`, with the schema |
| With Pydantic | `messages.parse()` returns the validated object | `responses.parse()` returns the validated object | You send the schema and validate in your code |
| Optional fields | Allowed | All required: optional ones accept `null` | Allowed |
| Minimums and maximums | Not accepted; the SDK checks them on the way back | Yes | Accepted for numbers; text lengths are silently ignored |
| If it refuses | `stop_reason: "refusal"` | A `refusal` field | Its documentation doesn't say |
| Together with tools | Yes | Yes | In preview, on Gemini 3 and Gemini 4 models |

For TypeScript (JavaScript with types), the equivalent of Pydantic is **Zod**, and the SDKs accept it the same way.

In old OpenAI tutorials you will see "JSON mode": it guarantees the answer is valid JSON, but not that it follows your schema. If you can, structured output is the better choice.

And a closing note for what we saw with RAG: OpenAI used to name inconsistent formatting as a reason to fine-tune. Today, for formatting, the API is enough.

## In short

- Free text is for people. For your code to read an answer, it needs a fixed format: almost always JSON, with a schema that says which fields it has and of what type.
- Asking for it in the prompt works almost every time, and "almost" is not enough with thousands of messages.
- With structured output, the API only lets the model write tokens that follow the schema. The shape is guaranteed.
- The shape is not the content: valid JSON can carry an absurd order or a made-up piece of data.
- You have to handle refusals and cut-off answers, and validate in your code.
- The schema has to let the model say "I don't know": fields that accept null and a list of what is missing.
- Business rules go in your code, not in the schema.
- A tool for the model to do something during the conversation; structured output for the final answer.

Every order sends the same system prompt, the same schema and the same menu, and they are billed with every message. Later in the series: how to make that fixed part much cheaper.
