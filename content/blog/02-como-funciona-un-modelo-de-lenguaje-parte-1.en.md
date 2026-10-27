---
title: "How a language model works: what it is, tokens and training"
date: 2026-10-27
order: 2
description: "What a language model does, how it goes from predicting text to following instructions, what tokens are and why they set what you pay and how long you wait."
---

Give a language model the text "The cat sat on the" and what it does is pick what comes next: "mat", "chair", "windowsill". It picks one option, adds it to the text and starts again. Everything built with AI, from a chatbot to an agent, rests on that mechanism. This post and the next one explain it, with just enough to work with it.

## What a language model is

A language model is a program that learned, by reading enormous amounts of text, to **predict the next piece of text** from what came before. That piece is called a token, and it is explained further down. It is also called an **LLM** (Large Language Model).

It works in a loop: it receives a text, predicts the next token, adds it to the text and predicts again. One token at a time, that is how every answer gets written.

The model does not have a single stored answer for each text. It works out how likely each possible continuation is and picks among the most likely ones. That is why the same question can get slightly different answers each time. How much room it has to choose can be adjusted.

It sounds like little for everything it does, but the learning is huge: a model is trained on trillions of tokens. Meta, for example, trained Llama 3 on more than 15 trillion; Anthropic, OpenAI and Google do not publish the figure for their models. To predict that much text well, the model has to pick up grammar, facts about the world and ways of reasoning, and that is where abilities like summarizing, translating or coding come from. Nobody programmed them one by one.

## From predicting text to following instructions

Predicting text is not enough to get an assistant. Training has two stages:

- **Pre-training:** the model learns to predict text by reading a huge part of the internet and other documents. According to Anthropic's documentation, a model that has only gone through this stage is not good at answering questions or following instructions: it tends to continue the text, not to reply to it.
- **Post-training:** it keeps being trained on example conversations and on the preferences of people who compare answers and pick the best one. That last technique is called **RLHF** (Reinforcement Learning from Human Feedback).

The second stage is what teaches it to follow instructions, to answer in an assistant's tone and to refuse certain requests. That is why a model follows the instructions it gets before the conversation (the system prompt), and why it sometimes says no.

## Tokens: what the model actually sees

The model does not see words or letters. It sees **tokens**, which are pieces of text: a whole word, part of a word or a punctuation mark. The program that cuts text into tokens is called a **tokenizer**, and each provider has its own.

An example: in OpenAI's tokenizer, "Hello world" is 2 tokens, "Hello" and " world". The space is attached to the second token, which shows that tokens are not words.

Pieces are used instead of words because the possible words are endless, and the model would not know what to do with one it never saw. Single letters are not used either, because every text would be far too long to process. Pieces are the middle ground: common words fit whole and rare ones are built from parts.

Other languages usually cost more than English. In Spanish, for example, long words break into more pieces:

<figure>
<p class="fig-title">The same sentence, split into tokens</p>
<div class="tok-row"><div class="tok-head"><span>Spanish: 4 words</span><b>9 tokens</b></div><div class="tok-text"><span class="tok-word"><span class="tok c0">Los</span></span><span class="tok-word"><span class="tok c1">electro</span><span class="tok c2">domést</span><span class="tok c3">icos</span></span><span class="tok-word"><span class="tok c4">llegaron</span></span><span class="tok-word"><span class="tok c0">des</span><span class="tok c1">arm</span><span class="tok c2">ados</span><span class="tok c3">.</span></span></div></div>
<div class="tok-row"><div class="tok-head"><span>English: 5 words</span><b>7 tokens</b></div><div class="tok-text"><span class="tok-word"><span class="tok c0">The</span></span><span class="tok-word"><span class="tok c1">household</span></span><span class="tok-word"><span class="tok c2">appliances</span></span><span class="tok-word"><span class="tok c3">arrived</span></span><span class="tok-word"><span class="tok c4">dis</span><span class="tok c0">assembled</span><span class="tok c1">.</span></span></div></div>
<figcaption>Each color is one token. Long Spanish words break into more pieces. Split with o200k_base, the public OpenAI tokenizer used by GPT-4o and GPT-5; every model splits differently, and with short, common words the gap between languages is smaller.</figcaption>
</figure>

How much text fits in a token also depends on the provider. For English, this is the rule each one publishes:

<figure>
<p class="fig-title">How many English words fit in one million tokens</p>
<div class="bars">
<div class="bar-row"><span>Claude</span><div class="bar-track" title="Claude: about 555,000 words"><div class="bar" style="width:55.5%"></div></div><span class="bar-val">555k</span></div>
<div class="bar-row"><span>GPT</span><div class="bar-track" title="GPT: about 750,000 words"><div class="bar" style="width:75%"></div></div><span class="bar-val">750k</span></div>
<div class="bar-row"><span>Gemini</span><div class="bar-track" title="Gemini: between 600,000 and 800,000 words"><div class="bar" style="width:60%;border-radius:0"></div><div class="bar bar--range" style="left:60%;width:20%"></div></div><span class="bar-val">600k to 800k</span></div>
<div class="bar-axis"><span></span><span><span style="left:0">0</span><span style="left:25%">250k</span><span style="left:50%">500k</span><span style="left:75%">750k</span><span style="left:100%">1M</span></span><span></span></div>
</div>
<figcaption>The Claude figure is for its current tokenizer. The OpenAI and Google figures are general rules for any of their models (Google gives a range, hence the striped bar), so the comparison is approximate. Sources: Anthropic, OpenAI and Google documentation, October 2026.</figcaption>
</figure>

The math can change even within the same provider. Anthropic switched tokenizers with Claude Opus 4.7: before, about 750,000 English words fit in a million tokens, and now 555,000 do. According to Anthropic, the same text comes out at about 30% more tokens.

No provider publishes an official figure for Spanish. To know the exact number for a text you have to measure it: Anthropic and Google offer a function in their API that counts tokens before you send the request, and OpenAI publishes its tokenizer (tiktoken) and a web page to try it.

With the Claude API, in Python, it looks like this:

```python
import anthropic

client = anthropic.Anthropic()  # reads the key from the ANTHROPIC_API_KEY variable
messages = [{"role": "user", "content": "The household appliances arrived disassembled."}]

# Before sending: how many input tokens the request will take
count = client.messages.count_tokens(model="claude-opus-5-5", messages=messages)
print(count.input_tokens)

# After sending: how many tokens were billed on each side
response = client.messages.create(model="claude-opus-5-5", max_tokens=1024, messages=messages)
print(response.usage.input_tokens, response.usage.output_tokens)
```

Counting is free and gives an estimate. What you are actually billed shows up in `usage`, in the response: `input_tokens` is what went in and `output_tokens` is what the model generated.

## Why tokens matter

Tokens are the unit of almost everything that matters when building with a model:

- **Cost.** You pay per token, and the tokens the model generates cost a lot more than the ones you send it. Across the big three, in October 2026, an output token costs 5 times an input token: Claude Opus 5.5 charges 4 dollars per million input tokens and 20 per million output tokens; GPT-6.1 Sol, 2 and 10; Gemini 4 Argon, 2 and 10 until November 30 and 4 and 20 from December. If the model reasons before answering, that reasoning is billed as output too, even when it is not shown.
- **Waiting time.** Since the model writes one token at a time, the answer is what takes longest. According to OpenAI's guide, cutting the output in half can cut the wait by close to 50%, while cutting the text you send in half only cuts it by 1% to 5%.
- **Limits.** What the model can process in a single call is measured in tokens: today, around a million between what goes in and what comes out, with a separate cap for the answer (128,000 tokens on Claude).

## Training and inference

There are two very different moments in a model's life:

- **Training:** the expensive, slow process in which the model learns. It is done by companies like Anthropic, OpenAI or Google, with thousands of graphics cards (GPUs) over months. Someone building a product with AI never does the pre-training; adjusting an already trained model is possible, and it is called fine-tuning.
- **Inference:** using the already trained model to generate an answer. It is what happens every time someone writes to Claude or an app calls its API.

Training has a cutoff date. Current Claude models, for example, know the world up to June 2026, according to Anthropic. Using the model does not teach it anything new: if it needs later or private information, you have to give it in the request.

A model can also run on your own computer. Small and medium open models run on a desktop computer. Claude, GPT and Gemini do not: their companies do not release the model, so they are only used through the API. In an app that customers use, the API is the norm: inference happens on the provider's servers and your own computer only sends and receives text. That is why you do not need powerful machines to build with AI.

## In short

- A language model predicts the next token, one at a time, picking among the most likely options.
- It learns to predict text in pre-training, and to follow instructions in post-training.
- Tokens set what you pay, how long you wait and what fits. Output costs 5 times as much as input and is what takes longest.
- Training is expensive and only a few do it. Using the model (inference) is what everyone does, and the model knows nothing after its cutoff date.

The next post continues with two more ideas: where what the model learned is stored (the weights) and how a conversation is structured (the roles).
