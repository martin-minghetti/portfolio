---
title: "What an AI Builder is and what they do"
date: 2026-10-25
order: 1
description: "An AI Builder is someone who builds software whose brain is a language model."
---

Lately I keep hearing the term AI Builder everywhere, and the definition changes depending on who tells it. This is what I understood, written as simply as I could.

## The idea in one sentence

An AI Builder is someone who builds software whose brain is a language model.

A language model is what sits behind Claude, ChatGPT or Gemini: a program that reads text and writes text. An AI Builder does not make it. They use it, already built, and put a product around it.

## How it differs from a traditional developer

A traditional developer writes explicit rules: "if X happens, do Y". Everything the program decides, a person decided beforehand, line by line.

An AI Builder leaves part of the decision to a model that reasons about language. For example, instead of coding twenty rules to sort customer messages, they explain to the model what to look for and the model decides. The work becomes something else: making that model behave in a way that is reliable, cheap and measurable inside a real product.

## What it is not

It is not an AI researcher. That person trains models from scratch, with heavy math and many graphics cards. An AI Builder uses models that already exist (Claude, GPT, Gemini) through their API, which is the door the code of an app uses to talk to the model.

## What they do day to day

1. **Connect models to products.** A chat, an assistant, a content generator, a data analyzer.
2. **Design the steps.** When to call the model, what to give it, what to do with the answer, when to use another tool.
3. **Control the behavior.** That it follows the rules, that it does not wander off, that it does not make things up and that it does not spend more than needed.
4. **Measure and operate.** Set metrics, notice when something goes wrong and fix it.
5. **Decide the architecture.** Choose between several ways of building the system and justify the choice with cost, speed and scale.

There is a term that has been used a lot since late 2025: **context engineering**. It means taking care of everything the model sees in each call (instructions, documents, tools, history), not just writing a good prompt. Later in the series there is a whole post about it.

## The levels

- **Junior or mid:** knows how to call the API, builds flows, uses frameworks. Builds.
- **Senior:** has a justified opinion on when not to use AI, takes systems to production with control over costs and errors, and resolves incidents. Decides and operates, not just builds.

The sentence that sums up the difference: a mid knows the model can do something; a senior knows when it is better that it does not.

## What this series is about

It is 22 posts, at most one per week, to understand what happens underneath when you build with a language model: how a model works, prompting, context, tools, agents, RAG, evaluation, costs, security. These are learning notes, not from someone who already knows everything. The idea is to learn out loud, and for whoever reads it to learn too.

The next post starts with the basics: what a language model is and how it reads text.
