---
title: "MCP: the protocol for connecting tools"
date: 2026-11-04
order: 10
draft: false
description: "What MCP is, what problem it solves, the three pieces, what a server offers, local or remote, a server under 20 lines for the pizzeria, how to connect it from Claude, GPT and Gemini, when it is worth it and what to watch out for."
---

Up to here, every tool of the pizzeria assistant, the one that serves customers over WhatsApp, was yours. `check_stock` and `place_order` live in your code, and your code runs them.

Now two things happen. La Esquina starts taking table reservations with another company's system, and the assistant needs to be able to check it. And the owner wants to ask Claude on their computer "how much mozzarella is left", without going through the assistant.

Without a common agreement, that means writing code inside the assistant to talk to the reservation system. Then writing `check_stock` again for the desktop app. And again if tomorrow the owner prefers ChatGPT. Every application with every system, a different integration.

This post is about how you write a tool once and use it from any application, and how you use one that someone else wrote.

## What MCP is

**MCP** (Model Context Protocol) is a protocol: a public agreement on how two programs talk to each other. In this case, how an AI application asks another program what tools it has, and how it asks it to run one.

The official documentation compares it to a USB-C port: the same connector for any device. Anthropic created it in late 2024. Since December 2025 it has been looked after by the Agentic AI Foundation, a fund inside the Linux Foundation (the nonprofit behind Linux and other open projects) founded by Anthropic, OpenAI and Block, the payments company that owns Square. Today it is used by the Claude (from Anthropic), ChatGPT (from OpenAI, which runs on its GPT models) and Gemini (from Google) apps, and also by Microsoft Copilot and code editors like Cursor and VS Code, among others.

The problem it solves shows up with small numbers. Three applications (the assistant, Claude on the owner's computer and ChatGPT) and two systems (stock and reservations) make six integrations. With MCP, each system writes a **server** once, and every application that already speaks MCP can use it.

## For the model, nothing changes

This is the idea that organizes the whole post. The model keeps doing what was seen with tools: it gets a list, asks for one, gets the result. It does not know there is MCP in between.

What changes is where the list of tools comes from and who runs them:

<figure>
<p class="fig-title">What changes when the tool comes through MCP</p>
<svg viewBox="0 0 400 530" width="100%" role="img" aria-labelledby="g10t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g10t">Sequence diagram between the model, your application and an MCP server: the application asks the server for the list of tools, calls the model, and when the model asks for a tool it passes it to the server to run it.</title>
<defs><marker id="g10c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(55% 0.15 300)"/></marker><marker id="g10c1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(52% 0.13 150)"/></marker><marker id="g10c2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(58% 0.13 70)"/></marker></defs>
<path d="M60 58V520" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M200 58V520" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M340 58V520" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<rect x="4" y="14" width="112" height="44" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="60.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Model</text>
<rect x="144" y="14" width="112" height="44" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Your application</text>
<rect x="284" y="14" width="112" height="44" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="340.0" y="40.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">MCP server</text>
<path d="M204 100H336" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g10c2)"/>
<text x="270.0" y="92" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">1. what tools do you have?</text>
<path d="M336 140H204" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g10c2)"/>
<text x="270.0" y="132" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">check_stock and its description</text>
<path d="M196 212H64" fill="none" stroke="oklch(55% 0.15 300)" stroke-width="1.6" marker-end="url(#g10c0)"/>
<text x="130.0" y="187" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">2. system, tools</text>
<text x="130.0" y="204" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">and "Any Neapolitan?"</text>
<path d="M64 272H196" fill="none" stroke="oklch(52% 0.13 150)" stroke-width="1.6" marker-end="url(#g10c1)"/>
<text x="130.0" y="247" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">3. asks for check_stock</text>
<text x="130.0" y="264" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">(neapolitan)</text>
<path d="M204 322H336" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g10c2)"/>
<text x="270.0" y="314" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">4. run check_stock</text>
<path d="M336 362H204" fill="none" stroke="oklch(58% 0.13 70)" stroke-width="1.6" marker-end="url(#g10c2)"/>
<text x="270.0" y="354" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">neapolitan: 0 units</text>
<path d="M196 432H64" fill="none" stroke="oklch(55% 0.15 300)" stroke-width="1.6" marker-end="url(#g10c0)"/>
<text x="130.0" y="407" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">5. all of the above</text>
<text x="130.0" y="424" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">and the result</text>
<path d="M64 502H196" fill="none" stroke="oklch(52% 0.13 150)" stroke-width="1.6" marker-end="url(#g10c1)"/>
<text x="130.0" y="477" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">6. "No Neapolitan left today.</text>
<text x="130.0" y="494" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">Want a mozzarella instead?"</text>
</svg>
<figcaption><ul><li>Green: the model and what it writes.</li><li>Purple: your application (Claude, the assistant).</li><li>Orange: the MCP server and what it returns.</li><li>Steps 2, 3, 5 and 6 are the same ones seen with tools. What is new are 1 and 4: the list and the execution come from a separate program, which someone else may have written.</li></ul></figcaption>
</figure>

## The three pieces

- **Server**: the program that offers the tools. For example, one that exposes `check_stock`. It can be written by whoever owns the data or by any company. Mercado Pago, a Latin American payments platform, publishes one for developers: from Claude, Cursor or ChatGPT you can search its documentation, create test users or set up payment notifications. It is for whoever programs the integration, not for charging the customer.
- **Host**: the application where the model lives. Claude Code (Anthropic's tool for programming with Claude from the terminal), ChatGPT, the pizzeria assistant.
- **Client**: the part of the application that talks to a server. There is one for each connected server. To get started, it is enough to know that the application has it built in.

In the rest of the post, "the application" means the host with its clients.

## What a server offers

A server can offer three things, and each one is decided by someone different:

- **Tools**: functions the model decides to use, like `check_stock`.
- **Resources**: data to read, which the application brings in. For example, today's menu as text.
- **Prompts**: templates the user picks, like "put together today's sales summary".

In practice, almost everything is tools. The Claude, GPT and Gemini APIs only bring in a server's tools: Anthropic says so, and OpenAI and Google only document that. Resources and prompts are used by applications like Claude Code.

## Local or remote

There are two ways to connect a server:

- **Local.** The application starts the server as a program on your computer, and they talk through that program's input and output, like in a terminal. This is called **stdio**. It works for one person: the owner on their laptop.
- **Remote.** The server is on the internet, at a web address, and serves many. This way is called **Streamable HTTP**. It is the one the pizzeria assistant needs if it wants the model provider to connect to the server, because the Claude, GPT and Gemini APIs connect to remote servers (OpenAI also accepts a local one, through a tunnel).

Since July 2026, the current version of the protocol is simpler: each request travels with everything it needs, with no connection that has to be kept open. That makes it easier to spread a remote server across several machines.

## What it looks like in code

This is a complete server, with the official Python SDK (the library the MCP project publishes to build servers and clients), exposing `check_stock` with the same description seen with tools:

```python
from typing import Literal
from mcp.server import MCPServer

mcp = MCPServer("pizzeria-la-esquina")

STOCK = {"mozzarella": 12, "neapolitan": 0, "fainá": 5}  # in real life, a database


@mcp.tool()
def check_stock(product: Literal["mozzarella", "neapolitan", "fainá"]) -> dict:
    """Returns how many units of a product are left today at La Esquina pizzeria.
    Use it when the customer asks whether something is available or wants to order it, before confirming.
    It does not return prices: those are in the menu. If it returns 0, it is sold out for today."""
    return {"units": STOCK[product]}


if __name__ == "__main__":
    mcp.run()  # local by default: the application starts it as a program
```

And to use it from Claude Code, on the owner's computer:

```bash
pip install mcp
claude mcp add pizzeria -- python /full/path/pizzeria_server.py
```

Three things to look at:

- With tools, the definition was separate from the function: the name, the description and the data with its options. Here the SDK takes it from the function itself. The name comes from the function name, the description from the text between triple quotes, and the data from the types: `product` ends up required and with three options.
- If someone asks for `check_stock("pepperoni")`, the server does not run the function: it returns an error that says which options are valid.
- In the command, the `--` separates Claude Code's options from the command that starts the server.

A heads-up for anyone looking for more examples: almost every tutorial starts with `from mcp.server.fastmcp import FastMCP`. With the current version of the SDK, version 2, that line throws an error. The class is now called `MCPServer`.

To make the server remote, the last line changes to `mcp.run(transport="streamable-http")`. For a provider's API to use it, it also has to be published on the internet.

## How to use it from your program

If the application is yours, like the pizzeria assistant, there are two ways to connect a server.

**Let the provider call it for you.** You pass the server's address in the request, and the provider talks to it. In Claude this is the API's MCP connector, which is still in beta (the feature exists, but it may change):

```python
r = client.beta.messages.create(
    model="claude-opus-5-5", max_tokens=16000,
    betas=["mcp-client-2025-11-20"],
    mcp_servers=[{"type": "url", "name": "pizzeria",
                  "url": "https://your-server.example/mcp"}],
    tools=[{"type": "mcp_toolset", "mcp_server_name": "pizzeria"}],
    messages=[{"role": "user", "content": "Any Neapolitan?"}],
)
```

There is no loop: Anthropic calls the server, and the response already includes the model's request and the result. It is convenient, but it has an important downside. Your code does not see the request before it runs. What you control is which of the server's tools you enable.

**Be the client yourself.** Your program connects to the server with the MCP SDK, asks it for the list of tools and passes them to the model as normal tools. When the model asks for one, your code passes it on to the server. It is more work, but the request goes through your code, and the checks seen with guardrails still apply. It is also the way to use a local server, or resources and prompts.

An example of why it matters: if `place_order` were on an MCP server and the assistant connected it through the provider's connector, the "do not place without confirmation" check would have to live on the server. There is no longer a place in the assistant to put it.

## When MCP is worth it

MCP is not always needed. A simple rule of thumb:

- **Your own tool.** If only one application uses it and it is yours, defining it as seen with tools is enough. The assistant with `place_order` gains nothing from MCP: it adds one more program to maintain.
- **MCP.** If the tool already exists and someone else built it (the reservation system, GitHub, where code is stored, or Notion, a notes and documents app), or if you want to use it from several applications: the assistant, Claude on the owner's computer and ChatGPT.
- **Skill** (a package of instructions the model loads only when it needs it). If what is missing is not access to a system but knowing how to do something, like the procedure for a complaint, which already came up in the series. Anthropic sums it up like this, in a 2026 article: MCP connects Claude to data; skills teach Claude what to do with that data. They are used together.

And a cost worth keeping in mind: each server adds tool definitions to every call. In a November 2025 article, [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp), Anthropic described a case that went from 150,000 tokens to 2,000 by loading tools only when they were needed. Connecting ten servers "just in case" fills up the context window, as seen earlier in the series.

## What to watch out for

A server you connect brings two things into your agent. Text the model reads, like the tool descriptions and what they return. And actions that run outside your code.

With a local server it is even more direct. MCP's [security guide for local servers](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/local-server-security) says it plainly: it is code downloaded from the internet that runs as your user, and it can read anything your user can read. On the remote side, OpenAI warns in its guide that a malicious server can exfiltrate data from anything that enters the model's context.

Three rules to start with:

1. **Know who owns each server.** Being in MCP's official server registry is not a guarantee: its own policy says to assume minimal to no moderation.
2. **Enable only the tools you use**, and remove the servers you no longer use.
3. **Approval for anything with an effect.** Claude Code asks for approval before using a server shared in a project, and OpenAI asks for approval before every call, unless you turn it off.

Named attacks and how to defend against them come later in the series.

## The same in all three

This is how it looks in Claude, GPT and Gemini:

| | Claude | GPT | Gemini |
|---|---|---|---|
| Connecting a server from the API | MCP connector (beta) | `mcp` tool | `mcp_server` tool |
| Which servers it accepts | Remote | Remote; local through a tunnel | Remote, only with Streamable HTTP |
| Who approves each call | Nobody: you choose which tools to enable | Asks for approval by default; it can be turned off | Its guide does not mention it |
| In its agent tools | Claude Code and the Agent SDK, local and remote | Agents SDK, local and remote | ADK (Google's kit for agents), local and remote |

All three bring in the server's tools, and OpenAI makes clear it does not charge extra for using it: only the tokens. In Gemini there is an unresolved detail: one Google page says Gemini 3 does not yet accept remote servers, and another shows it working with a Gemini 3. Before counting on it, it is worth testing.

And to avoid confusion, what MCP is not. It is not a model or a provider's API. It does not replace tool use: it is the same thing, with the list and the execution outside. And it is not A2A, another open protocol, created by Google and now also in the Agentic AI Foundation, which is for one agent to talk to another agent.

## In short

- MCP is an agreement so that any application can use the tools of any server. You write the tool once and use it from many.
- For the model, nothing changes: an MCP tool is just another tool. What changes is who has the list and who runs it.
- A server mostly offers tools. It can be local, on your computer, or remote, on the internet.
- With the official SDK, a server fits in under 20 lines.
- It is worth it when someone else built the tool or you want it in several applications. For your own tool in a single application, you do not need it.
- Connect only servers you know, with the tools you use, and with approval for anything with an effect.

With your own tools and other people's, an agent can do a lot. Later in the series: how to organize several steps with a framework.
