---
title: "Agents: when the model decides the steps"
date: 2026-11-02
order: 8
draft: false
description: "What an agent is, how it differs from a flow of fixed steps, how the loop works and how it stops, what can go wrong, and when one, several or none is the right call, in Claude, GPT and Gemini."
---

On a Tuesday, a customer messages the pizzeria: "I want 3 mozzarellas and a Neapolitan, to Mitre 450". On Tuesdays there is a 2-for-1 on mozzarella, and delivery costs $1,500, free from $25,000.

Answering well takes several things: checking stock for both pizzas, working out the total with the promo and delivery, showing it to the customer, waiting for a yes and only then placing the order. And if the Neapolitan is sold out, the total changes. As covered earlier in the series, a model can ask for a tool and answer with the result. Here it has to chain several and decide as it goes.

## What an agent is

An **agent** is a model that, with tools, decides its own steps until a task is done. It works in a loop: on each round, the model looks at what it has, asks for one or more tools, your code runs them and the result comes back. Then another round. It ends when the model answers without asking for anything else.

It is the same back and forth seen with tools. What is new is that the model now goes through several rounds and chooses what to do in each one.

The idea of alternating between thinking and acting has a name: **ReAct** (from reasoning and acting), a [2022 paper from Princeton and Google](https://arxiv.org/abs/2210.03629). Today it is the basic shape of almost every agent.

## Workflow or agent: who decides the steps

Anthropic separates two things in its guide "Building effective agents", from December 2024:

- In a **workflow** (a flow of fixed steps), your code writes the order. The model can take part in a step, but it does not decide what comes next.
- In an **agent**, the model decides the steps.

With the pizzeria, a workflow would be: your code always checks stock for what was ordered, warns if something is missing, works out the total, asks for confirmation and places the order. An agent would be giving the model the tools and the goal, "take orders", and letting it decide the order.

For the order at the start, a workflow is enough, because the steps are known in advance. The agent wins when the message is messy: "Change the address on the order I just placed, add a fainá if there is any left and tell me if it gets here before ten". There is no fixed order you could write in advance. Google says something similar: the predictable goes with fixed steps, and the open-ended, with a system that plans on its own.

A workflow can also be elaborate. Anthropic's guide describes five common shapes: chaining steps, routing each case to the path it belongs to, doing several things in parallel, one model that splits the work among others, and one that generates while another evaluates. Those shapes come later in the series.

## The loop, round by round

This is how Tuesday's order would be handled by an agent with three tools: check stock, calculate the total and place the order.

<figure>
<p class="fig-title">One order, round by round</p>
<svg viewBox="0 0 400 432" width="100%" role="img" aria-labelledby="g08t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g08t">Diagram of an agent loop: the customer writes, the model is called with everything so far; if it asks for tools, your code runs them and the model is called again; if not, it answers and stops. A round limit cuts the loop.</title>
<defs><marker id="g08ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<rect x="10" y="20" width="200" height="50" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="110.0" y="49.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">The customer writes</text>
<path d="M110 70V98" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<rect x="10" y="100" width="200" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="110.0" y="124.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Call the model</text>
<text x="110.0" y="143.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">with everything so far</text>
<path d="M110 156V186" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<path d="M110 188L198 226L110 264L22 226Z" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="110" y="231" font-size="15" fill="var(--color-ink)" text-anchor="middle">Asks for tools?</text>
<path d="M198 226H243" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<text x="220" y="216" font-size="14" fill="var(--color-muted)" text-anchor="middle">yes</text>
<rect x="245" y="200" width="145" height="52" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="317.5" y="221.3" font-size="16" fill="var(--color-ink)" text-anchor="middle">Your code</text>
<text x="317.5" y="240.3" font-size="16" fill="var(--color-ink)" text-anchor="middle">runs them</text>
<path d="M317 200V128H212" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<text x="330" y="168" font-size="14" fill="var(--color-muted)" text-anchor="start">next round</text>
<path d="M317 252V284" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<rect x="245" y="286" width="145" height="52" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="317.5" y="308.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Round limit</text>
<text x="317.5" y="327.8" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">stops when hit</text>
<path d="M110 264V296" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<text x="120" y="286" font-size="14" fill="var(--color-muted)" text-anchor="start">no</text>
<rect x="10" y="298" width="200" height="50" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="110.0" y="327.8" font-size="16" fill="var(--color-ink)" text-anchor="middle">Answers and stops</text>
<path d="M110 348V378" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g08ink)"/>
<rect x="35" y="380" width="150" height="40" rx="20" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="110.0" y="404.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Waits for customer</text>
</svg>
<figcaption><ul><li>Light blue: what the customer writes.</li><li>Green: the calls to the model and its answer.</li><li>Orange: your code, which runs the tools.</li><li>Red: the limit, which stops the loop even if the model keeps asking.</li><li>In the example: round 1 checks stock for mozzarella and Neapolitan, round 2 works out the total ($19,500) and round 3 answers "Shall I confirm it?". When the customer says "Go ahead", round 4 places the order and round 5 answers "Done, your order is number 128."</li><li>Each round is a call to the model that sends everything so far again.</li></ul></figcaption>
</figure>

In the first round, the model asks for both stock lookups together. The Neapolitan is at 0. In the second, it works out the total with the mozzarellas only: with the 2-for-1 it pays for two, $18,000, plus $1,500 for delivery because it does not reach $25,000. In the third, it answers without asking for tools and the loop ends, even though the order is not placed yet: finishing can also mean asking. When the customer confirms, another batch of rounds begins.

Nobody programmed "if the Neapolitan is missing, recalculate without it". The model decided that from the result of the first round. And it does not place the order until the customer confirms, because the system prompt asks it to: it is the care of confirming before anything that cannot be undone, covered earlier in the series.

## How it stops

A loop needs a way out. There are three:

- **When the model finishes.** It answers without asking for tools. This is the normal case. But it can also stop because it ran out of room to write or because it refused to continue, and in those cases the work is not done. It is worth checking the reason before treating it as finished.
- **A round limit.** Your code counts the rounds and stops at a number, for example 10. Anthropic mentions it as a common practice in its 2024 guide. What to do when the limit is hit is a product decision: at the pizzeria, handing the chat to a person. The kits that come with the loop built in each have their own default limit, and some have none: the helper in Claude's libraries keeps going until the model finishes, unless you set a limit. It is worth checking in whatever kit you use.
- **A budget.** Instead of counting rounds, you count spending. Claude has a token budget for the whole task in beta: the model sees how much it has left and paces itself to finish cleanly instead of being cut off halfway. Anthropic clarifies that it is a guide for the model, not a hard cap.

These limits are the first control on an agent. The rest of the controls come later in the series.

## What can go wrong

**Endless loops.** The model checks stock again and again, or two agents hand work back and forth without finishing. Google flags it as the main risk of its loop pattern. That is what the limit is for.

**Errors that add up.** A mistake in the second round, like a wrongly calculated total, drags along everything that follows. Anthropic sums it up like this: agents remember what happened, and errors compound. A rough calculation to make it clear, assuming independent steps: if each step goes right 95% of the time, ten steps in a row go right about 60% of the time. That is why it is better for a tool to do the math instead of the model, and for tools to return clear errors.

**Cost and time.** Each round resends everything before it, as seen with the context window. Five rounds do not cost five times one call: they cost more, because each one is longer than the last. In 2025, Anthropic measured that an agent uses about 4 times more tokens than a regular chat, and a system of several agents, about 15 times more.

## What it looks like in code

The code seen with tools was already a loop. This one adds two things: several tools, and a round limit.

```python
import json
from datetime import date
import anthropic

client = anthropic.Anthropic()
STOCK = {"mozzarella": 12, "neapolitan": 0}

def check_stock(product):
    return {"units": STOCK[product]}

def calculate_total(mozzarellas, neapolitans=0):
    is_tuesday = date.today().weekday() == 1  # your code knows the day, the model does not
    paid = mozzarellas - mozzarellas // 2 if is_tuesday else mozzarellas  # 2-for-1 on Tuesdays
    subtotal = paid * 9000 + neapolitans * 10500
    delivery = 0 if subtotal >= 25000 else 1500
    return {"total": subtotal + delivery}

def place_order(mozzarellas, neapolitans, address):
    return {"order": 128}  # in real life, it is saved to a database

FUNCTIONS = {"check_stock": check_stock, "calculate_total": calculate_total,
             "place_order": place_order}
tools = [...]  # the three definitions: name, description and inputs, as seen before
system = ("You are the assistant for La Esquina pizzeria. Before placing an order, "
          "show the total and ask for confirmation.")
messages = [{"role": "user", "content": "I want 3 mozzarellas and a Neapolitan, to Mitre 450"}]
MAX_ROUNDS = 10

for round_ in range(MAX_ROUNDS):
    r = client.messages.create(model="claude-opus-5-5", max_tokens=16000,
                               system=system, tools=tools, messages=messages)
    messages.append({"role": "assistant", "content": r.content})
    if r.stop_reason != "tool_use":
        break  # answered without asking for tools

    results = []
    for b in r.content:
        if b.type == "tool_use":
            print(f"Round {round_ + 1}: {b.name} {b.input}")
            try:
                output = FUNCTIONS[b.name](**b.input)
                results.append({"type": "tool_result", "tool_use_id": b.id,
                                "content": json.dumps(output)})
            except Exception as e:
                results.append({"type": "tool_result", "tool_use_id": b.id, "is_error": True,
                                "content": f"{b.name} failed: {e}. Let the customer know."})
    messages.append({"role": "user", "content": results})
else:
    print("Hit the round limit without finishing: hand the chat to a person.")

if r.stop_reason == "end_turn":  # finished properly, not from running out of room or refusing
    print("".join(b.text for b in r.content if b.type == "text"))
```

What changes compared with that code:

- The `for` with `MAX_ROUNDS` replaces the endless `while`: that is the limit. The `for` loop's `else` only runs if the rounds ran out without reaching the `break`.
- `FUNCTIONS[b.name]` picks which function to run based on what the model asked for.
- Your code does the total, not the model, and the day too: the model does not know whether today is Tuesday.
- With this message, the code gets as far as the question "Shall I confirm it?". The customer's answer is added to `messages` and the loop runs again.

The rule about confirming before placing the order is in the system prompt, and it is a request, not a guarantee. A check in the code, one that does not allow placing an order without a saved confirmation, is firmer. That also comes later in the series.

You do not have to build this loop in your code: for Claude (from Anthropic), GPT (the OpenAI models behind ChatGPT) and Gemini (from Google) there are kits that handle it. Claude has a helper in its libraries (in beta) and Managed Agents (also in beta), where Anthropic runs the agent for you. OpenAI has its Agents SDK, and Google, its ADK. Still, understanding the loop from the inside helps you know what is going on when something fails.

## When an agent is worth it

From simplest to most complex, with the pizzeria:

- **A single call:** "How much is the Neapolitan?". The price is in the system prompt.
- **One tool, one round:** "Is there fainá?".
- **A workflow:** the usual order, with steps known in advance.
- **An agent:** the messy message, or any task where you do not know how many steps it will take.

Anthropic's rule is to look for the simplest possible solution and add complexity only when needed, and it notes that sometimes this means not building an agent. Google agrees: to summarize or translate a text, you probably do not need one.

## One agent or several

With the pizzeria, the temptation is to build an orders agent, a complaints agent, a promos agent and a "boss" that hands out the work. Anthropic, OpenAI and Google recommend the opposite: start with one.

- **Anthropic**, in an October 2026 guide, says that a single agent with skills (packages of instructions the agent loads only when it needs them) usually gives better quality than several, often at lower cost and latency. Each handoff from one agent to another loses information, like in a game of telephone. A customer that compared both approaches saw that a single agent ran twice as fast. At the pizzeria: a single assistant, with a complaints skill it loads only when someone complains.
- **OpenAI**: "start with one agent whenever you can", and split only when a part needs different instructions, different tools or different rules.
- **Google**: a single agent is ideal for multi-step tasks with external data, and it recommends starting there.

A **subagent**, another agent the main one hands part of the job to, does make sense for heavy tasks that would fill the window. For example, reading the month's 2,000 reviews and returning the three most repeated complaints: it does that in its own window and returns only the summary. It also helps for tasks in parallel.

That is the downside announced when talking about the context window: according to Anthropic, in January 2026, several agents use between 3 and 10 times more tokens than a single one for the same task. And merging agents can also break something: in an example from the October guide, after folding one subagent into another, the main assistant started answering on its own with the order lookup tool and stopped asking the shipping subagent for the delivery date. That is why the guide asks you to measure before and after each change. How to measure comes later in the series.

It is not "never several". In 2025, Anthropic showed that for researching a topic, which splits well into parts, several agents performed 90% better than one in its internal test, at the cost of many more tokens. It is "several, only with a concrete reason".

## In short

- An agent is a model that chooses its own steps with tools, in a loop that stops when it answers without asking for anything.
- If the steps are known in advance, a workflow is enough, and it is cheaper and more predictable.
- Every loop needs a way out: the model finishing, a round limit or a budget.
- Each round resends everything before it, so cost grows fast, and errors carry over from one round to the next.
- It is better to start with a single agent and add others only when there is a concrete reason and testing confirms it.

With a model that acts on its own, the next question is how to put limits on it. That comes later in the series.
