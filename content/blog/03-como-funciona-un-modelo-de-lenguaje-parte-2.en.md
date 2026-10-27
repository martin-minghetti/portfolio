---
title: "How a language model works: roles, memory and weights"
date: 2026-10-27
order: 3
draft: true
description: "How a conversation with a model is put together, why it remembers nothing from one call to the next, what that costs and where what it learned is stored."
---

A pizzeria puts an assistant on its website. A customer asks "do you have gluten-free pizza?", the assistant says yes, and the customer goes on: "and how much is it?". To answer the second question, the assistant has to know which pizza they are talking about. But the model remembers nothing: every time the application calls it, it starts from scratch.

This post explains how that gets solved, with the roles of a conversation, what solving it that way costs, and where what the model does know is stored.

## A conversation is a list of messages

When an application talks to a model through the API, it does not send a loose block of text. It sends a list of messages, in order, and each one has a **role** that says whose it is:

- **system:** the background instructions. Who the assistant is, what rules it follows, what format it answers in. For example: "you are a pizzeria's assistant and you keep answers short". It goes before everything else.
- **user:** what the application sends on the user's side. Most of the time it is what the person wrote, but it can also include documents or data the application adds to the question.
- **assistant:** the model's answers. The application can also write messages with this role, for example to show the model how it should answer. Anthropic says so in its documentation: earlier turns do not need to have come from the model.

The idea is the same across the big three, but each one names things its own way:

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| Background instructions | `system` parameter, separate from the list | `developer` role or `instructions` parameter | `system_instruction` parameter |
| What the user sends | `user` | `user` | `user` |
| What the model answers | `assistant` | `assistant` | `model` |

OpenAI also points out that developer instructions take priority over whatever the user says.

## Inside, roles are text with markers

The model, as the previous post showed, only sees a sequence of tokens. Before it gets there, the list of messages is turned into a single text, with special markers that show where each message starts and whose it is. Each model family uses its own markers; in some open models, for example, each message starts with something like `<|im_start|>user`.

The model respects those markers because during post-training it learned from conversations written in that format. That is why it can tell a system instruction from a user question, and why the system carries more weight: that is how it was trained.

## The model remembers nothing

The Claude API keeps nothing between one call and the next. According to its documentation, you always have to send the whole conversation. For the pizzeria assistant to "remember" the first question, the application sends everything again: the system, the first question, the first answer and the new question. The memory of a chat is, underneath, that list being sent again every time.

That has a cost. Since you pay for every token that goes in, every call pays again for everything before it, and what gets sent grows with each turn:

<figure>
<p class="fig-title">What gets sent on each call of a conversation</p>
<div class="tok-row"><div class="tok-head"><span>Call 1</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c4">question 1</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Call 2</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c4">question 1</span><span class="tok c1">answer 1</span><span class="tok c4">question 2</span></div></div>
<div class="tok-row"><div class="tok-head"><span>Call 3</span></div><div class="tok-text"><span class="tok c0">system</span><span class="tok c4">question 1</span><span class="tok c1">answer 1</span><span class="tok c4">question 2</span><span class="tok c1">answer 2</span><span class="tok c4">question 3</span></div></div>
<figcaption>Purple: system. Light blue: user messages. Green: model answers. Not to scale: each call carries everything before it plus what is new.</figcaption>
</figure>

OpenAI and Google offer to store the history on their side, so you do not have to resend it: OpenAI with an ID for the previous response and Google with its Interactions API, which keeps conversations for 55 days on the paid tier. That saves work, but the model still remembers nothing: the provider puts the list together and passes it in whole. OpenAI points out that, even so, all earlier tokens are billed again as input. There are ways to make that repetition cheaper, such as caching, which come later in the series.

When the model uses tools, like looking up a fact or querying a database, the results also go into this list as messages. That comes later too.

With the Claude API, in Python, the pizzeria conversation is put together like this:

```python
import anthropic

client = anthropic.Anthropic()
system = "You are a pizzeria's assistant. Keep answers short."
history = []

for question in ["Do you have gluten-free pizza?", "And how much is it?"]:
    history.append({"role": "user", "content": question})
    # Every turn sends the full history
    r = client.messages.create(model="claude-opus-5-5", max_tokens=2048, system=system, messages=history)
    history.append({"role": "assistant", "content": r.content})
    text = "".join(b.text for b in r.content if b.type == "text")
    print(text, "| input tokens:", r.usage.input_tokens)
```

On the second turn, `input_tokens` is bigger than on the first, even though the question is shorter: it carries everything before it.

## Weights: what the model learned

What the model does know, it learned in training, and it was stored in billions of numbers. Those numbers are called **weights** or **parameters**; in practice the two words are used as synonyms.

To make it concrete: Llama 2 70B, a Meta model, has 70 billion parameters (that is what the B stands for). Stored, it is a file of about 140 GB, because each number takes 2 bytes. None of those numbers holds a sentence or a fact you could read: what was learned is spread across all of them, and it only shows up when the model makes a prediction. That is why you cannot "open" a model and see what it knows.

Using the model or writing it a prompt does not change its weights. Only training changes them, or a later adjustment (fine-tuning).

In general, more parameters give more capability, but they also make the model more expensive to run. There is a nuance: many current models use only part of their parameters for each token. OpenAI's gpt-oss-120b has 117 billion and uses 5.1 billion per token. Anthropic, OpenAI and Google do not publish how many parameters their closed models have.

## Open and closed models

- **Open-weight models:** the company publishes the weights, and anyone can download them and run them on their own computer or server, or use them through a third party that offers them. Open weights are not the same as open source: in general, the data and the code they were trained with are not published.
- **Closed models:** the weights are not published, and the model is only used through the provider's API or the clouds that offer it (Claude, for example, is also on Amazon, Google Cloud and Microsoft).

Of the big three, OpenAI and Google also publish open models: OpenAI has gpt-oss and Google has Gemma, whose version 4 came out in April 2026 under the Apache 2.0 license, which allows commercial use. Anthropic does not publish open models. Other well-known open families are Meta's Llama, and Qwen and DeepSeek, from Chinese companies.

Being open does not make a model better or worse. It changes other things: data never leaves your own server, at high volume it can be cheaper, and the model is never retired. Closed models do have retirement dates: Anthropic, for example, commits to keeping Claude Opus 5.5 available until at least September 2027. In exchange, an open model is yours to run and maintain.

## In short

- A conversation is a list of messages with roles: the background instructions (system), what the user sends (user) and what the model answers (assistant). Each provider names them a bit differently.
- Inside, that list is turned into text with markers, and the model respects them because it was trained that way.
- The model remembers nothing: every call sends the whole conversation, and that is why what you pay for input grows with each turn.
- What the model learned lives in its weights, which are numbers, not sentences. Open or closed depends on whether those weights are published, not on how good the model is.

The next post gets into prompting: how to write the system prompt and why giving the model examples changes its answer so much.
