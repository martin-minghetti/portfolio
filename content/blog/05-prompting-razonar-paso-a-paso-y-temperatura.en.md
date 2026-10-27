---
title: "Prompting: step-by-step reasoning and temperature"
date: 2026-10-27
order: 5
draft: true
description: "Why thinking before answering improves the answers, how you control today how much a model reasons, and what happened to temperature in Claude, OpenAI and Gemini."
---

A customer writes to the pizzeria's assistant: "Today is Tuesday, there's 2-for-1 on mozzarella. I'll have 3 mozzarellas and one Neapolitan. Delivery is $1,500, free from $25,000. How much do I pay?". If the model answers straight away, it can easily get the promo or the delivery wrong. If it does the math first, it gets it right much more often.

This post is about that, asking the model to think before it answers, and about the other classic prompting knob: how predictable or varied its answers are.

## Thinking before answering

**Chain-of-thought** means asking the model to reason step by step before giving the final answer. Something like: "Do the math step by step and then give the total."

It works because of how the model operates, which the series covered at the start: it writes one token at a time, and each token comes out of a fixed amount of computation. If it answers straight away, it gets that computation and nothing more. If it writes the steps first, it gets more computation, and the intermediate results stay written down for the tokens that follow: "3 mozzarellas with 2-for-1 means 2 paid, $18,000" is in plain view when it is time to add up.

The technique became popular with a 2022 Google paper (Wei and others), which showed large gains on math problems, but only in large models.

## New models reason on their own

Current models are **reasoning models**: before answering, they can write their own reasoning, separate from the answer, without anyone asking. That moved the knob. You no longer need to write "think step by step"; what you adjust is how much it thinks, with an **effort** parameter.

The big three handle it in a similar way:

| | Claude | OpenAI | Gemini |
|---|---|---|---|
| How you control it | `effort`: low, medium, high, xhigh and max | `reasoning.effort`: in GPT-6.1 Sol, from low to max | `thinking_level` in Gemini 4 Argon: low, medium and high |
| Default value | medium in Opus 5.5 and Haiku 5.5, high in the rest | medium | medium |
| Can it be turned off | not in Opus 5.5 | not in GPT-6.1 Sol or GPT-6 Astra; yes in other models of the family | there is no level below low |
| What you see | a summary of the reasoning, if you ask for it | a summary, if you ask for it | a summary, if you ask for it |

In all three, the full reasoning is billed as output, even if you only see the summary or nothing at all. More effort means more paid tokens and more waiting.

In Claude, the reasoning also counts toward the output limit (`max_tokens`). If the limit is small and the model thinks a lot, the answer gets cut off halfway. The documentation recommends leaving room for both, and lets you see how much went into thinking in `usage.output_tokens_details.thinking_tokens`.

When to raise or lower the effort depends on the task. To classify reviews, which is simple and has to be fast, `low` is enough. To calculate an order with promotions, more is better. OpenAI, for GPT-6.1 Terra, recommends starting at `medium` and going up only if the improvement is worth the extra time and tokens. The way to know is to try it with real cases.

With the Claude API, in Python, you can compare the same order at two levels:

```python
import anthropic

client = anthropic.Anthropic()
order = ("Today is Tuesday, there's 2-for-1 on mozzarella ($9,000). I'll have 3 mozzarellas "
         "and one Neapolitan ($10,500). Delivery is $1,500, free from $25,000. How much do I pay?")

for effort in ["low", "high"]:
    r = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,  # the reasoning fits inside this limit
        output_config={"effort": effort},
        messages=[{"role": "user", "content": order}],
    )
    text = "".join(b.text for b in r.content if b.type == "text")
    print(effort, "| output tokens:", r.usage.output_tokens, "|", text)
```

With `high` it should spend quite a few more output tokens. The correct answer is $28,500 with free delivery, if the 2-for-1 applies to two of the three mozzarellas.

## Is it still worth asking it to think?

With reasoning models, the main knob is effort, but the prompt still pushes. Anthropic recommends adjusting the effort first and, if needed, adding a line like "this task has several steps, think carefully before answering". OpenAI, in its guide for the o-series reasoning models, recommends not asking them to think step by step, because they already do it on their own.

There is a new thing to watch with Claude: it is better not to ask it to write its reasoning inside the answer, for example in a "reasoning" section before the result or in a field of a JSON. The most recent models may refuse that request, and the refusal is billed anyway. If you need to see how it got to the answer, ask for a short explanation, or turn on the reasoning summary.

## Temperature: how it chooses between options

At the start of the series we saw that the model calculates how likely each continuation is and chooses among the most likely ones. **Temperature** decides how much it takes a chance when choosing. With low temperature, the most likely option almost always wins. With high temperature, the options even out and the less likely ones show up more often:

<figure>
<p class="fig-title">How "The cat sat on the..." continues</p>
<div class="tok-row"><div class="tok-head"><span>Low temperature</span></div><div class="tok-text"><span class="tok c1">bed</span><span class="tok" style="opacity:.35">chair</span><span class="tok" style="opacity:.35">window</span><span class="tok" style="opacity:.35">bookshelf</span></div></div>
<div class="tok-row"><div class="tok-head"><span>High temperature</span></div><div class="tok-text"><span class="tok c1">bed</span><span class="tok c1">chair</span><span class="tok c1">window</span><span class="tok c1">bookshelf</span></div></div>
<figcaption>Explanatory diagram, no numbers: with low temperature the most likely option almost always comes out; with high temperature, any of the reasonable ones, even the odd ones.</figcaption>
</figure>

The value usually goes from 0 to 1 or from 0 to 2, depending on the provider, and the default is usually 1. There are two similar controls: `top_k`, which only lets it choose among the k most likely options, and `top_p`, which drops the unlikely ones until a certain total probability is covered.

For years the rule was: low temperature to classify or extract data, high for ideas and creative writing.

## Temperature is disappearing

With reasoning models, the big three took it out of the builder's hands:

- **Claude:** since the 4.7 models (Opus 4.7 onward and the whole 5 family), sending `temperature`, `top_p` or `top_k` with a value other than the default gives an error. And since the API version of October 21, 2026 (a date your code sends with every request; new libraries send the new one), it gives an error on any model even if you send the default value.
- **OpenAI:** temperature is only accepted with reasoning turned off (level `none`). With GPT-6.1 Sol, which cannot be turned off, there is no temperature.
- **Gemini 4 Argon:** it does not give an error, it ignores it silently. What does give an error is the old way of setting a budget of thinking tokens, same as in Claude.

Besides, not even temperature 0 guaranteed getting the same answer every time. Anthropic says so in its documentation: even then, the answers are not fully deterministic. For a builder, that means two things: tests have to tolerate different answers, and if an answer must always be the same, you store it instead of asking for it again.

## What to use instead of temperature

What you used to get with temperature is now asked for in other ways:

- **For predictable answers:** a tight prompt, examples like the ones in the previous post, low effort, and asking for a fixed format. Later in the series we will see how to force the model to answer with an exact structure.
- **For varied answers:** ask for them in the prompt. For example, "suggest four names for the Tuesday promo, very different from each other", in a single call.

## In short

- Reasoning before answering gives the model more computation and keeps the intermediate steps in view. That is why it does better on multi-step tasks.
- Current models reason on their own. What you adjust is the effort, which in the big three is billed as output and adds waiting time.
- Temperature decides how much the model takes a chance when choosing. Today Claude rejects it, OpenAI accepts it only without reasoning and Gemini ignores it.
- Not even temperature 0 guaranteed the same answer. Predictable or varied is now asked for in the prompt, with examples and with the format.

The next post changes topic: the context window, or how much the model can read at once, and how to manage it.
