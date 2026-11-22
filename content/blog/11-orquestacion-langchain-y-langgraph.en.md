---
title: "Orchestration: when LangChain or LangGraph is worth it"
date: 2026-11-05
order: 11
draft: false
description: "What orchestrating means, what frameworks add, LangChain today, how a LangGraph graph works with pauses and saved state, the same flow with and without a framework, when it is worth it and what Claude, GPT and Gemini do."
---

The pizzeria assistant already takes orders over WhatsApp. It is an agent with two or three tools, a twenty-line loop and a check in the code that places nothing without the customer's confirmation.

Now La Esquina wants to take bookings for birthday parties in the dining room, with a deposit. The flow is different: check availability in the booking system (another company's, connected through MCP, the standard protocol for connecting other companies' tools), ask for the deposit, wait for the customer to pay, confirm the booking in the system and send a reminder the day before.

What is new is not the number of steps. It is the waiting. Hours can go by between one step and the next, the server can restart in the middle, and when the customer writes again you need to know where things stood.

This post is about how to organize steps that wait, split into paths and have to survive a restart. And about whether you need a framework for that.

## What orchestrating means

Orchestrating is deciding the order of the steps: which model call goes first, which tool comes next, what happens if something fails.

If you have been following the series, you were already doing it. The agent loop, which calls the model until it stops asking for tools, is orchestration. So is the workflow with fixed steps. Both were your own code: a `while` and a few `if`s, no library at all.

The model does not orchestrate anything on its own: it answers one message at a time and remembers nothing between one call and the next. Someone has to keep track of which step each customer is on. That someone is your code.

An **orchestration framework** is a library that comes with what everyone ends up writing already solved:

- Saving the state of each conversation.
- Resuming after a crash.
- Pausing so someone can approve, and continuing afterwards.
- Retrying what failed and setting limits.
- Seeing what happened, step by step.

That is what they sell. None of it is magic, and today an AI writes any of those pieces for you in minutes. Writing them is not the expensive part: the expensive part is having to understand, test and maintain that code. The framework gives you those pieces already tested by a lot of people, in exchange for learning its way of doing things and depending on it.

## LangChain today

LangChain is an open source library, in Python and JavaScript, from the company of the same name. It is the best known in the field.

Since version 1.0, from October 2025, its central piece is `create_agent`: the agent loop the series already covered, assembled and ready, with a connection to almost any provider. You pass it the model, the tools and the system prompt, and that's it.

What it adds is **middleware**: pieces that plug into the loop to add things without writing them. Asking for approval before using a tool, stopping after a certain number of calls, switching to another model if the first one fails, summarizing the conversation when it gets long. They are the checks covered with guardrails, packaged.

Its most concrete advantage is not tying you to one provider. Switching from Claude (by Anthropic) to GPT (the OpenAI models behind ChatGPT) or to Gemini (by Google) means changing a string: `"anthropic:claude-opus-5-5"` for the name of the other model. The flip side: the newest features of each provider reach its own SDK (each one's official library) first, and LangChain later.

A warning for anyone looking for tutorials: almost all the ones from 2023 and 2024 use "chains" (`LLMChain` and similar). Since 1.0 they moved to a separate package, and the old import fails. If a tutorial starts with `from langchain.chains import ...`, it is out of date.

## LangGraph: the steps as a graph

LangGraph comes from the same company. Its documentation describes it as a low-level framework for "long-running" and "stateful" agents: long processes that remember where they are.

The idea is to draw the steps and how they connect, like a diagram of arrows where an arrow can go back. That is a **graph**. LangGraph takes care of walking through it, saving where each conversation stopped and picking it up again.

The pieces, with the pizzeria order:

- **State**: what is known about the order so far. What they ordered, whether it is in stock, the total, whether they confirmed.
- **Steps** (the graph's **nodes**): each one is a regular function. Some call the model and some don't. Checking stock does not need a model.
- **Paths** (the **edges**): which step follows which. Some paths choose based on the state: if something is missing, tell the customer; if not, calculate the total.
- **Pause**: the graph stops, saves everything and waits. When the customer answers, it continues from there.
- **Threads**: the state saved after each step, one per conversation. At the pizzeria, one thread per WhatsApp number.

<figure>
<p class="fig-title">The order as a graph</p>
<svg viewBox="0 0 400 800" width="100%" role="img" aria-labelledby="g11t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g11t">Diagram of the order: the customer's message goes through understanding the order, checking stock and calculating the total; if there is no stock it tells the customer and ends; then it pauses until the customer answers; if they say yes it places the order, if not it ends without placing it.</title>
<defs><marker id="g11a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<g stroke="var(--color-ink)" stroke-width="1.5" fill="none" marker-end="url(#g11a)">
<path d="M110 72V98"/><path d="M110 156V182"/><path d="M110 234V262"/><path d="M110 338V364"/><path d="M110 416V444"/><path d="M110 538V564"/><path d="M110 640V666"/><path d="M110 718V744"/>
<path d="M180 300H243"/><path d="M180 602H243"/>
</g>
<g font-size="15" fill="var(--color-muted)"><text x="198" y="291">no</text><text x="120" y="356">yes</text><text x="198" y="593">no</text><text x="120" y="658">yes</text></g>
<g stroke="var(--color-ink)" stroke-opacity=".25">
<rect x="10" y="20" width="200" height="52" rx="10" fill="oklch(88% 0.07 230)"/>
<rect x="10" y="100" width="200" height="56" rx="10" fill="oklch(88% 0.08 150)"/>
<rect x="10" y="184" width="200" height="50" rx="10" fill="oklch(89% 0.09 75)"/>
<path d="M110 264L180 300L110 336L40 300Z" fill="var(--color-paper-hi)"/>
<rect x="10" y="366" width="200" height="50" rx="10" fill="oklch(89% 0.09 75)"/>
<rect x="10" y="446" width="200" height="92" rx="10" fill="oklch(87% 0.07 300)"/>
<path d="M110 566L180 602L110 638L40 602Z" fill="var(--color-paper-hi)"/>
<rect x="10" y="668" width="200" height="50" rx="10" fill="oklch(87% 0.07 20)"/>
<rect x="245" y="274" width="145" height="52" rx="10" fill="oklch(89% 0.09 75)"/>
<rect x="245" y="576" width="145" height="52" rx="10" fill="oklch(89% 0.09 75)"/>
<rect x="72" y="746" width="76" height="34" rx="17" fill="var(--color-paper-hi)"/>
</g>
<g fill="var(--color-ink)" font-size="17" text-anchor="middle">
<text x="110" y="52">"3 mozzarellas, please"</text>
<text x="110" y="125">Understand the order</text><text x="110" y="145" font-size="14" fill="var(--color-muted)">the step with the model</text>
<text x="110" y="215">Check stock</text>
<text x="110" y="306" font-size="16">In stock?</text>
<text x="110" y="397">Calculate total</text>
<text x="110" y="472">Pause: "That's $27,000.</text><text x="110" y="492">Shall I place it?"</text>
<text x="110" y="513" font-size="14" fill="var(--color-muted)">saves the order and waits,</text><text x="110" y="529" font-size="14" fill="var(--color-muted)">even if hours go by</text>
<text x="110" y="608" font-size="16">Said yes?</text>
<text x="110" y="699">Place order</text>
<text x="110" y="769" font-size="15">End</text>
<text x="317" y="297" font-size="16">Tell them</text><text x="317" y="316" font-size="14" fill="var(--color-muted)">and end</text>
<text x="317" y="599" font-size="16">Don't place it</text><text x="317" y="618" font-size="14" fill="var(--color-muted)">and end</text>
</g>
</svg>
<figcaption><ul><li>Light blue: what the customer writes.</li><li>Green: the step that uses the model.</li><li>Orange: steps in your code.</li><li>Purple: the pause.</li><li>Red: the step that actually changes something (places the order).</li><li>The diamonds are the paths chosen based on the state.</li><li>"Place order" can only be reached one way, after a "yes".</li></ul></figcaption>
</figure>

This is how LangChain and LangGraph relate: `create_agent` is built on top of LangGraph. One is the assembled car and the other is the engine. And the engine can be used on its own. The documentation says it plainly: "LangGraph does not require LangChain". Inside a step you can call Anthropic's SDK directly, without LangChain.

## Workflow or agent, again

The difference covered with agents comes back here. A graph is a workflow: your code decides the steps and the paths. `create_agent` is an agent: the model decides the steps.

LangGraph lets you mix the two. A graph of fixed steps where one of the steps is an agent that decides on its own. For the pizzeria: the booking flow is fixed (availability, deposit, payment, confirmation), but the "understand what the customer wants" step can be an agent with tools.

## What it looks like in code

This is the full order as a graph, with LangGraph in Python. The step that would call the model in real life returns a fixed order here, so it can run without an API key:

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command

STOCK = {"mozzarella": 12, "neapolitan": 0}
PRICES = {"mozzarella": 9000, "neapolitan": 10500}

class Order(TypedDict, total=False):
    message: str
    items: dict
    missing: list
    total: int
    confirmed: bool
    reply: str

def understand_order(o):
    # Here the model reads o["message"] and returns the products; for testing, fixed:
    return {"items": {"mozzarella": 3}}

def check_stock(o):
    return {"missing": [x for x, n in o["items"].items() if STOCK[x] < n]}

def calculate_total(o):
    total = sum(PRICES[x] * n for x, n in o["items"].items())
    return {"total": total + (0 if total >= 25000 else 1500)}  # free delivery from $25,000

def ask_confirmation(o):
    said = interrupt(f"That's ${o['total']}. Shall I place it?")  # stops until the customer answers
    return {"confirmed": said == "yes"}

def place_order(o):
    return {"reply": "Done, order 128."}

def dont_place(o):
    return {"reply": "Sure, I won't place it."}

def tell_missing(o):
    return {"reply": f"We're out of {', '.join(o['missing'])} today."}

g = StateGraph(Order)
for step in (understand_order, check_stock, calculate_total,
             ask_confirmation, place_order, dont_place, tell_missing):
    g.add_node(step)
g.add_edge(START, "understand_order")
g.add_edge("understand_order", "check_stock")
g.add_conditional_edges("check_stock",
    lambda o: "tell_missing" if o["missing"] else "calculate_total")
g.add_edge("calculate_total", "ask_confirmation")
g.add_conditional_edges("ask_confirmation",
    lambda o: "place_order" if o["confirmed"] else "dont_place")
g.add_edge("place_order", END)
g.add_edge("dont_place", END)
g.add_edge("tell_missing", END)
graph = g.compile(checkpointer=InMemorySaver())

chat = {"configurable": {"thread_id": "+54 9 294 555-0101"}}  # one thread per customer
r = graph.invoke({"message": "3 mozzarellas, please"}, chat)
print(r["__interrupt__"][0].value)                  # That's $27000. Shall I place it?
r = graph.invoke(Command(resume="yes"), chat)       # minutes later, the customer says "yes"
print(r["reply"])                                   # Done, order 128.
```

What to look at:

- **The check now lives in the shape of the graph.** `place_order` can only be reached through the path that leaves the confirmation when the customer said yes. The "don't place anything without confirmation" covered with guardrails is no longer an `if` someone can forget: there is no other path that gets there.
- **The thread joins the two halves.** Hours can go by between the first `invoke` and the second. What connects them is the `thread_id`, the customer's WhatsApp number.
- **LangGraph does not message the customer.** The pause text comes back in `r["__interrupt__"]`, and your code sends it over WhatsApp.
- **In memory is not enough.** `InMemorySaver` keeps the state in the program's memory: if it restarts, it is lost. For it to survive, you swap it for one that saves to a database, such as SQLite or Postgres, two widely used databases.

And a trap worth knowing before it bites. When the graph resumes, the pause step runs again from the beginning. The [documentation on interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) warns about it: everything before the `interrupt` runs again. If `ask_confirmation` sent a WhatsApp message before pausing, the customer would get it twice. That is why the total is calculated in the previous step, and the pause step does nothing before stopping.

## The same without a framework

This is the same flow in plain Python, without any library:

```python
STOCK = {"mozzarella": 12, "neapolitan": 0}
PRICES = {"mozzarella": 9000, "neapolitan": 10500}
pending = {}  # in real life, a table in the database

def new_order(phone, items):
    missing = [p for p, n in items.items() if STOCK[p] < n]
    if missing:
        return f"We're out of {', '.join(missing)} today."
    total = sum(PRICES[p] * n for p, n in items.items())
    total += 0 if total >= 25000 else 1500  # free delivery from $25,000
    pending[phone] = {"items": items, "total": total}
    return f"That's ${total}. Shall I place it?"

def customer_reply(phone, said):
    order = pending.pop(phone, None)
    if order is None or said != "yes":
        return "Sure, I won't place it."
    return "Done, order 128."  # this is where place_order gets called
```

It does the same with two functions and a dictionary. That is 18 lines against about 60. The wait is saving the pending order under the customer's phone number: it is LangGraph's thread, done with your own code.

What it lacks: saving automatically after each step, resuming any point of a long flow, seeing the history of steps, retries. With a single wait, you don't miss them. With five waits and three paths, like the bookings with a deposit, you do.

## When a framework is worth it

The pizzeria makes it clear.

**Today's order assistant: no framework.** One agent, a few tools, a single wait. Your own loop and a table of pending orders are enough. A framework would add a dependency that updates often, a new way of thinking and a layer between you and the model.

Anthropic puts it this way in [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), from December 2024: start by using the API directly, because many patterns can be solved in a few lines. And it warns that frameworks often add layers that hide the prompts sent to the model, which makes errors harder to find. Anthropic itself notes at the top of that article that the tooling has changed a lot since then, but the advice to start simple still stands.

**Bookings with a deposit: that is where it starts to pay off.** Several waits: the payment, the confirmation from the booking system, the reminder the day before. Different paths: if they don't pay within an hour, the table is released; if the booking system fails, it retries. And a process that lasts days and has to survive a restart. That is exactly what LangChain says LangGraph is for in its 1.0 announcement: long-running business processes, and sensitive flows where a person has to approve.

**Trying several providers without rewriting: LangChain helps.** If today you don't know whether you will stay with Claude, GPT or Gemini, switching from one to another means changing a string.

**A team that needs a common way to build agents: a framework brings order.** For one person with one assistant, it is not needed.

A rule to keep: start without a framework, and add it when your code starts needing what the framework already brings, such as saving the state of each conversation, pauses or retries. Even if the AI writes it for you quickly, that code is then yours to understand and maintain. And if you use one, understand what it does underneath. It is the same advice Anthropic gives.

## The same in Claude, GPT and Gemini

This is how it looks in Claude, GPT and Gemini:

| | Claude | GPT | Gemini |
|---|---|---|---|
| Its agent kit | Claude Agent SDK: the agent behind Claude Code (Anthropic's tool for programming with Claude) as a library | Agents SDK | ADK (Agent Development Kit) |
| How several steps are ordered | The model builds the flow for each task (dynamic workflows) | With plain Python code, or by handing the conversation to another agent | Fixed graphs in your code, since ADK 2.0 |
| Hosted by the provider | Managed Agents (beta) | Agents API (beta) | Agent Runtime, which also hosts LangGraph agents |

Each one bets on something different:

- **Google**, on graphs: the flow stays fixed in your code, like in LangGraph. They arrived in ADK 2.0, for Python, TypeScript and Go.
- **OpenAI**, on plain code. Its Agents SDK documentation puts it this way: orchestrating with code makes tasks more predictable in speed, cost and outcome. And in June 2026 it announced that on November 30 it shuts down Agent Builder, its editor for building flows by dragging boxes.
- **Anthropic**, on letting the model build the flow. In Claude Code and in Managed Agents, the agent can write its own program that splits the work among several agents. In [A harness for every task](https://claude.dev/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code/), from June 2026, it warns that this usually spends more tokens and is worth it for complex tasks that justify it.

Claude, GPT and Gemini can all be used from LangChain and LangGraph, but neither Anthropic nor OpenAI nor Google builds its own kit on top of them.

Two more things from the LangChain world that you will see mentioned. **LangSmith** is the company's paid product: it is for seeing step by step what an agent did, measuring it and hosting it. It has a free plan, it is not required, and it comes up later in the series. LangGraph is open source and free. And LangChain can load the tools of an MCP server as its own tools: the other company's booking system comes in as one more tool for the agent.

## In short

- Orchestrating is deciding the order of the steps. The agent loop and the fixed-step workflow already were.
- A framework does nothing your code can't do. What it gives you is pieces already tested, in exchange for learning its way and depending on it.
- LangChain today is an assembled agent (`create_agent`) with pluggable pieces. The chains from old tutorials are behind us.
- LangGraph arranges the steps as a graph that saves where each conversation stopped, and can pause and resume hours later.
- For a short flow, your own code is enough and is easier to understand. A framework pays off when there are long waits, many paths and processes that have to survive a restart.
- Anthropic, OpenAI and Google each have their own kit, and each one orders the steps in its own way.

So far, the assistant knows what is in its prompt and what its tools return. Later in the series: how to give it access to documents that don't fit in the context window.
