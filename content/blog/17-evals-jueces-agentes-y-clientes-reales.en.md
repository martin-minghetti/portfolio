---
title: "Evals: judges, agents and tests with real customers"
date: 2026-11-11
order: 17
draft: false
description: "How to use another model as a judge, what biases it has and how to compare it with a person before trusting it; how to measure an agent, with pass@k and pass^k; and when you need to test with real customers."
---

In the previous post, La Esquina's eval left one case ungraded. A customer writes "The pizza arrived crushed", and the assistant is expected to ask for a photo and the order number, and to offer a replacement free of charge.

That answer can't be checked by looking for a word. "Send me a photo" and "share a picture with me" say the same thing, and an assistant can ask for the photo and argue with the customer at the same time. Deciding whether it handled it well takes reading and understanding. If you don't want a person reading every answer, the option is to have another model read it.

## A model as a judge

Using a model to grade another model's answers is called **LLM-as-judge** (a language model as the judge). The judge receives the answer and a **rubric**: the list of criteria used to grade. The judge only knows what it is given, so the rubric includes the customer's message and what the assistant can't promise. For the crushed pizza:

> The customer wrote: "The pizza arrived crushed". It passes if it asks for the order number and a photo, and offers a replacement free of charge. It fails if it argues with the customer, or if it promises a refund, a discount or a delivery time.

La Esquina's judge, in Python, with the structured output we already saw in the series and Pydantic, the library that describes what a piece of data has to look like and checks it:

```python
from typing import Literal
import anthropic
from pydantic import BaseModel, Field, ValidationError

class Verdict(BaseModel):
    reason: str = Field(description="One sentence: which rubric criterion it meets or fails")
    result: Literal["pass", "fail", "unknown"]

client = anthropic.Anthropic()

def judge(answer, rubric):
    try:
        r = client.messages.parse(
            model="claude-opus-5-5",
            max_tokens=16000,
            system="You grade answers from the assistant of La Esquina, a pizzeria. "
                   "Use only the rubric. If it isn't enough to decide, answer unknown.",
            messages=[{"role": "user", "content":
                       f"<rubric>{rubric}</rubric>\n<answer>{answer}</answer>"}],
            output_format=Verdict,
        )
    except ValidationError:  # it arrived cut off, or the judge refused
        return None
    v = r.parsed_output
    return None if v is None or v.result == "unknown" else v.result == "pass"
```

What to look at:

- **The judge reasons on its own.** Claude Opus 5.5 decides how much to think before writing the verdict, and its reasoning can't be turned off. OpenAI's guide, [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices), also says that reasoning before scoring improves the eval. That is why the schema has no field for the reasoning, which in Claude can end in a refusal: `reason` is a single sentence, so a person can understand why it passed or not.
- **The judge can say "I don't know".** Anthropic's evals guide, [Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents), recommends it: give the judge a way out when it doesn't have enough information, so it doesn't make up a verdict. In the code, `unknown` comes back as `None`, just like a case that wasn't run: it does not count for or against, but if the case is critical, the change does not go in.
- **A cut-off answer or a refusal is also `None`.** Without the `try`, a single verdict that can't be read would bring down the whole eval.
- **The values are lowercase single words.** Same reason as with structured output: Claude does not guarantee the capitalization of the letter after a space.
- **One judge for each thing you measure.** The same guide advises a clear rubric for each aspect (the tone, whether it asked for the details, whether it promised too much), and a separate judge for each, instead of one that grades everything together.

This judge plugs into the `run` function from the previous post: `run(golden, answers, judge=judge)`.

Without connecting to the API, you can test that the code builds the request and reads the verdict correctly, by simulating the judge's answers. With the answer from the previous version ("Sorry! Send me a photo and the order number and we'll replace it free of charge") and a simulated verdict of "pass", the function returns `True`; with "fail", `False`; and with "unknown", a verdict cut off halfway or a refusal, `None`. What the judge really decides with this rubric has not been tested.

## The judge's biases

A judge is another model, and it gets things wrong in known ways. A 2023 study by a team from UC Berkeley and other universities, [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685), put a name to three biases, testing GPT-4 and GPT-3.5, from OpenAI, and Claude-v1, from Anthropic, as judges:

- **Order.** If the judge compares two answers, it may prefer the one that appears first. In the study, with answers very similar to each other, when the order was swapped GPT-4 kept its verdict in only 65% of the cases.
- **Length.** The judge may prefer the longer answer, even if it says nothing more. In one test from the study, 23 answers that had a list got the same list, reworded, added at the front: GPT-3.5 and Claude-v1 preferred the padded version 91.3% of the time, and GPT-4 8.7%.
- **Its own answers.** A judge may prefer what a model like itself wrote. In the study, GPT-4 favored itself with a 10% higher win rate, and Claude-v1 with 25%, although the authors note that, with so little data, they can't be sure it is a bias.

The numbers come from 2023 models, and today's may behave differently. But the biases are still in current guides: OpenAI's names the order and length ones, and asks you to control the length of the answers because models tend to prefer long ones.

For order, the study proposes a simple solution: call the judge twice, with the answers swapped, and declare a winner only if it wins in both orders. For the bias toward its own answers, Claude's documentation, in [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), says it is generally best practice to evaluate with a different model from the one that wrote the answer. If the assistant also uses Claude Opus 5.5, change the judge's model or, if you can't, compare it with a person more carefully.

The same study brings the good news: a strong judge (GPT-4) agreed with people in more than 80% of the cases, not counting ties, roughly as often as two people agree with each other. A judge can work. But you have to check it before trusting it.

## Comparing the judge with a person

Anthropic, OpenAI and Google say the same thing: before using a judge seriously, you have to **calibrate** it, that is, compare its verdicts with a person's. Anthropic asks for it to be "closely calibrated with human experts". OpenAI, in its guide, advises starting with a strong model as the judge (today it names GPT-6.2 Astra) and validating how much it agrees with human labels before looking for a cheaper or faster one. Google, in [Evaluate a judge model](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/evaluate-judge-model), proposes building a set of answers with human ratings as the ground truth the judge is measured against.

At La Esquina: a person from the location reads 50 answers to complaints and marks which ones pass. Then the judge grades the same 50. With example numbers, not measured:

| | The person says "pass" (40) | The person says "fail" (10) |
|---|---|---|
| The judge says "pass" | 38 | 4 |
| The judge says "fail" | 2 | 6 |

They agree on 44 of 50: 88%. It sounds good, but it has to be compared with something. A judge that said "pass" to everything, without reading anything, would agree on 40 of 50, 80%, because most answers are good. The 88% barely beats not reading.

What matters is in the right-hand column: of the 10 bad answers, the judge let 4 through. If those answers were about allergies, 4 out of every 10 mistakes would slip by.

It is the same problem we saw with the guardrail filters: a judge gets things wrong in two directions. It can block a good answer (a false positive, here 2 of 40) or let a bad one through (a false negative, here 4 of 10). Calibrating a judge means measuring those two errors separately, not just the total.

Google uses **balanced accuracy** for this: the average of how many good ones it recognizes as good and how many bad ones it recognizes as bad. Here it gives (38/40 + 6/10) / 2 = 0.775, quite a bit less than 88%, because it penalizes the bad ones that slip by.

If the judge isn't good enough, you adjust the rubric and measure again. Suppose that, with a more precise rubric, the judge now blocks 9 of the 10 bad ones, although it also blocks 3 of the 40 good ones: balanced accuracy rises to (37/40 + 9/10) / 2 = 0.91. At that point you can use it in the eval, with a person reviewing from time to time. And when you change the judge's model or the rubric, you calibrate again.

## How to measure an agent

When the assistant uses tools and takes several steps, like checking the stock, calculating the total and placing the order, there is more to measure than the final answer: whether it completed the task, whether it called the right tool with the right data, what steps it took and how much it cost.

**The result first.** Anthropic's guide says it is often better to grade what the agent produced and not the path it took, because agents find valid paths nobody had foreseen, and requiring the exact steps penalizes that. If La Esquina's assistant places the order correctly, it doesn't matter whether it checked the stock before or after calculating the total. The guide also asks for partial credit: an assistant that understood the complaint and verified the order, but didn't offer the replacement, is better than one that understood nothing.

Not everyone thinks the same. In the ADK, Google's kit for building agents, unless you configure it otherwise, the eval requires the agent to use the tools in the exact order that was expected.

**Once or always.** A model doesn't always answer the same, so with an agent each case is run several times. And there are two different questions there:

- **pass@k:** out of k attempts, did it get at least one right? The measure became known with [the 2021 study](https://arxiv.org/abs/2107.03374) in which OpenAI introduced Codex, a model that writes code: if one out of 10 attempts works, that's enough, because you can test which one works.
- **pass^k:** out of k attempts, did it get all of them right? It was proposed by Sierra, a company that makes customer service agents, in its 2024 study [τ-bench](https://arxiv.org/abs/2406.12045), precisely because a customer gets nothing from an assistant that is right some of the time.

If La Esquina's assistant takes an order correctly 90% of the time, and each attempt is independent of the previous one:

| Attempts (k) | pass@k: at least one right | pass^k: all right |
|---|---|---|
| 1 | 90% | 90% |
| 3 | 99.9% | 72.9% |
| 5 | 99.999% | 59% |
| 10 | almost 100% | 34.9% |

With the same assistant, one measure says "almost perfect" and the other "fails often". A customer who orders three nights in a row has a 72.9% chance that all three orders come out right. Anthropic's guide sums it up like this: pass@k for tools where one success is enough, pass^k for agents where being consistent matters. For an assistant that serves customers, the one that matters is pass^k. In Sierra's study, the best agents of 2024 got it right every time, over 8 attempts, in less than 25% of a store's customer service tasks.

## A model that plays the customer

In a real conversation, the assistant asks things and the customer answers. A golden set (the eval's list of cases) with a single message per case doesn't test that. τ-bench's solution, which Google's ADK also includes, is to have another model play the customer: it receives a plan ("order 2 mozzarellas to Barrio Norte; if they ask you something, answer") and talks with the assistant until the end.

<figure>
<p class="fig-title">A test with a simulated customer</p>
<svg viewBox="0 0 400 420" width="100%" role="img" aria-labelledby="g17t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g17t">Sequence diagram of a test with a simulated customer: another model plays the customer with a plan (order 2 mozzarellas to Barrio Norte), the assistant asks for the area, the customer answers, the assistant places the order, and your code compares the placed order with the expected one.</title>
<defs><marker id="g17c1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="oklch(52% 0.13 150)"/></marker><marker id="g17ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<path d="M72 58V410" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M200 58V410" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<path d="M328 58V410" fill="none" stroke="var(--color-ink)" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="4 4"/>
<rect x="12" y="14" width="120" height="44" rx="10" fill="oklch(88% 0.07 230)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="72.0" y="40.2" font-size="12" fill="var(--color-ink)" text-anchor="middle">Simulated customer</text>
<rect x="140" y="14" width="120" height="44" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="200.0" y="40.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">Assistant</text>
<rect x="268" y="14" width="120" height="44" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="328.0" y="40.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">Your code</text>
<path d="M76 122H196" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g17ink)"/>
<text x="136.0" y="114" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">I want 2 mozzas</text>
<path d="M196 182H76" fill="none" stroke="oklch(52% 0.13 150)" stroke-width="1.6" marker-end="url(#g17c1)"/>
<text x="136.0" y="174" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">to which area?</text>
<path d="M76 242H196" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g17ink)"/>
<text x="136.0" y="234" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">Barrio Norte</text>
<path d="M204 312H324" fill="none" stroke="oklch(52% 0.13 150)" stroke-width="1.6" marker-end="url(#g17c1)"/>
<text x="264.0" y="304" font-size="14" fill="var(--color-ink)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">places the order</text>
<text x="72" y="84" font-size="13" fill="var(--color-muted)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">plan: 2 mozzarellas,</text>
<text x="72" y="99" font-size="13" fill="var(--color-muted)" text-anchor="middle" stroke="var(--color-paper-hi)" stroke-width="5" stroke-linejoin="round" paint-order="stroke">Barrio Norte</text>
<rect x="270" y="342" width="116" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="328.0" y="366.2" font-size="14" fill="var(--color-ink)" text-anchor="middle">compares to the</text>
<text x="328.0" y="383.2" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">expected order</text>
</svg>
<figcaption><ul><li>Light blue: the simulated customer, another model that follows a plan.</li><li>Green: the assistant being tested.</li><li>Orange: your code, which grades the result: the order that was placed, not the exact words of the conversation.</li><li>Since the simulated customer doesn't always say the same thing, each test is run several times.</li></ul></figcaption>
</figure>

In the end you don't grade the conversation word by word, since it changes every time, but the result: the order that was placed, compared with the expected one. And since the simulated customer doesn't always say the same thing either, each test is run several times, with pass^k.

## With real customers

Everything above tests the assistant with saved cases, before changing anything. The most faithful test is with real customers: an **A/B**, which sends half of the customers to the old version and the other half to the new one, and compares which works better.

The downside is time. Anthropic's guide says an A/B takes days or weeks to give a reliable result, needs enough traffic, and only tests changes that are already out. With La Esquina's 300 messages a day, and assuming every message can be graded:

| Improvement you want to see | Messages in total | Days |
|---|---|---|
| From 80% to 90% | about 400 | just over 1 |
| From 80% to 85% | about 1,800 | 6 |
| From 90% to 92% | about 6,400 | 21 |

A small improvement takes three weeks to show. That is why the golden set goes first, so you don't send customers something that breaks an allergy, and the A/B is left for big changes with enough traffic.

Looking at what happens with real customers every day, and not only during an A/B, is another topic: observability, covered later in the series.

## The same in Claude, GPT and Gemini

| | Claude (Anthropic) | GPT (OpenAI) | Gemini (Google) |
|---|---|---|---|
| What it offers | Guides: Demystifying evals for AI agents and the documentation for defining criteria and building evals | It closed its evals platform (read-only since October 31, 2026, with shutdown on November 30, 2026) and recommends Promptfoo, an open source evals tool that in March 2026 announced it is joining OpenAI | Gen AI evaluation service, in its Google Cloud platform for models and agents, and evals with a simulated customer in the ADK |
| Order of graders | Code where possible, a model where needed, people with care | Automate when possible, people to calibrate | Rubrics that a model builds for each question, plus code metrics |
| On the judge | Calibrate it with experts, give it an "I don't know" way out, and use a different model | Validate how much it agrees with people; order and length biases | Measure it against human ratings, with balanced accuracy |
| Agents | Grade mostly the result; pass@k and pass^k | Choice of tool, correct data and, with several agents, handing off to the right one | Final answer and tool use metrics; the ADK requires the exact order by default |

Anthropic, OpenAI and Google agree on this: a judge isn't used without comparing it with a person first.

## In short

- When code isn't enough to grade, another model can do it with a rubric. It should be able to say "I don't know", it should not be the same model that wrote the answer, and there should be one judge per aspect.
- A judge has known biases: the order of the answers, their length and a preference for what a model like itself wrote.
- Before trusting a judge, you compare it with a person. High agreement may not be enough: look at how many bad answers it lets through.
- With an agent, you mostly grade the result. pass@k measures whether it gets it right at least once; pass^k, whether it always does, which is what a customer needs.
- Another model can play the customer to test full conversations.
- An A/B with real customers is the most faithful test, but it takes days or weeks: it is left for big changes.
