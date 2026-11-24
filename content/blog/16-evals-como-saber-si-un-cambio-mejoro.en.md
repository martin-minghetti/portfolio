---
title: "Evals: how to know if a change improved your assistant"
date: 2026-11-10
order: 16
draft: false
description: "What an eval is, how to build a golden set from the assistant's real failures, how to grade each answer with code, and why what decides whether a change goes in is not the total but which cases broke."
---

The La Esquina assistant gives long answers, and people read them on their phones. Someone changes one line of the system prompt: "answer in one sentence". They try it with four or five messages, the answers look shorter and better, and the change ships.

A week later, a customer asks whether the arugula pizza has nuts, because their son is allergic. The assistant answers "It has mozzarella, arugula and parmesan". That is true, but it leaves out the important part: the house pesto has walnuts. Before the change, the assistant said so.

Looking over a few answers is not enough to know whether a change made the assistant better or worse. That is what evals are for.

## What an eval is

Anthropic defines it this way: an eval (short for evaluation) is a test for an AI system. You give it an input and apply grading logic to its output to see if it is right.

An eval has three parts:

- **The cases:** the test messages. The list of cases, with what is expected of each one, is called a **golden set** (the name comes from "gold standard": it is what you measure against).
- **What is expected:** an exact answer when there is one ("$10,500"), or a list of criteria when there isn't ("asks for the order number and a photo").
- **The grader:** the function or the model that looks at the answer and decides whether it passes.

It is the same idea as the tests of any program, with one difference: a program always gives the same output for the same input, and a model doesn't. That is why an eval does not prove that something works, but how often it works.

## Where the cases come from

Anthropic's guide to evals, [Demystifying evals for AI agents](https://www.anthropic.com/research/demystifying-evals-for-ai-agents) (January 2026), says you don't need hundreds of cases to start: "20-50 simple tasks drawn from real failures is a great start". Early on, each change has a large effect and shows up with few cases.

The best cases are the mistakes that already happened. For La Esquina, ten cases, each with its origin:

| Case | Customer message | What is expected | Original failure |
|---|---|---|---|
| price_neapolitan | "How much is the neapolitan?" | Only $10,500 | Made-up price |
| price_off_menu | "How much is the calabrese?" | No price: it is not on the menu | Made-up price |
| total | "2 mozzas and a neapolitan, how much is it?" | $28,500 | Total added up wrong |
| allergy_arugula | "Does the arugula one have nuts? My son is allergic" | Warns that the pesto has walnuts. Critical | Allergy ignored |
| allergy_fugazzeta | "Does the fugazzeta have nuts?" | Says no | Needless alarm |
| order | "I want 2 mozzas and a fugazzeta without onion to Barrio Norte" | The exact order | Order taken wrong |
| menu | "What pizzas do you have?" | Three sentences at most | Long answer |
| huge_order | "I want 500 mozzarellas for Saturday" | Does not place it, hands it to a person. Critical | Absurd order placed |
| monday | "Are you open on Mondays?" | Says it is closed | Made-up hours |
| cold_pizza | "The pizza arrived cold" | Asks for a photo and order number, offers a replacement | Complaint handled badly |

Two things about this list:

- **Both directions.** There is a case where it has to give a price and another where it must not; one where it has to warn about an allergen and another where it must not raise an alarm. Anthropic's guide asks for this: test the cases where something should happen and the ones where it shouldn't, because a one-sided eval improves only one side. If you only tested "warns about walnuts", an assistant that answers "it may contain nuts" to everything would always pass.
- **The critical ones.** The allergy and the 500-pizza order are the mistakes you cannot allow: an allergic child, or a pizzeria baking 500 mozzarellas nobody will pay for. They are marked separately, because they weigh more than the rest.

## Three ways to grade

Claude's documentation, in [Define success criteria and build evaluations](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), lists graders from most to least convenient:

1. **With code.** Compare with the expected answer, look for a word, check a number. It is fast, cheap and always gives the same result.
2. **With people.** The most flexible and the highest quality, but slow and expensive. The documentation says: "Avoid if possible".
3. **With another model.** A model that reads the answer and grades it with a list of criteria. It is fast, flexible and works for complex judgment, but before using it seriously you have to test that it is reliable.

At La Esquina, nine of the ten cases are graded with code. "Only $10,500" is checked by looking for the amounts in the answer. "Warns about walnuts" is checked by looking for the word, and that it does not come after a "no" or a "without". The 500-pizza one looks at which tools the assistant used: `hand_off_to_person`, which leaves the conversation to someone at the pizzeria, has to be there, and `place_order` must not. The order is compared field by field with the schema we saw with structured output.

The only one that cannot be checked this way is the cold pizza complaint: "handled it well" is not solved by looking for a word. That one needs a model to grade it, and is left for the next post.

## Running the eval

This is what a golden set case looks like, stored in a separate file:

```json
{"id": "allergy_arugula", "message": "Does the arugula one have nuts? My son is allergic",
 "grader": "warns_nuts", "critical": true, "origin": "allergy ignored"}
```

To run the eval, you send each message to the assistant (with the same code as in earlier posts) and save what it answers. Then this Python program grades the answers from both versions of the prompt and compares them:

```python
import json, re

def amounts(text):  # "$10,500" -> 10500
    return [int(m.replace(",", "")) for m in re.findall(r"\$\s?(\d[\d,]*\d|\d)", text)]

# Code graders: fast, cheap and always give the same result.
GRADERS = {
    "menu_price":   lambda r, c: c["expected_amount"] in amounts(r["text"])
                    and all(m in c["valid_amounts"] for m in amounts(r["text"])),
    "no_price":     lambda r, c: amounts(r["text"]) == [],
    "warns_nuts":   lambda r, c: re.search(r"walnut", r["text"], re.I) is not None
                    and not re.search(r"(\b(no|not|without)\b|n't)[^.]*\bwalnut", r["text"], re.I),
    "says_no":      lambda r, c: re.search(r"\b(doesn't|does not) (have|contain)\b", r["text"], re.I) is not None,
    "says_closed":  lambda r, c: re.search(r"\bclosed?\b", r["text"], re.I) is not None
                    and not re.search(r"(\bnot|n't) close", r["text"], re.I),
    "short":        lambda r, c: len(re.findall(r"[.!?](?:\s|$)", r["text"])) <= 3,
    "hands_off":    lambda r, c: "hand_off_to_person" in r["tools"]
                    and "place_order" not in r["tools"],
    "same_order":   lambda r, c: r["order"] is not None
                    and {k: r["order"][k] for k in ("items", "area")} == c["expected_order"],
}

def run(golden, answers, judge=None):
    result = {}
    for case in golden:
        r = answers[case["id"]]
        if case["grader"] == "judge":
            result[case["id"]] = judge(r["text"], case["rubric"]) if judge else None
        else:
            result[case["id"]] = GRADERS[case["grader"]](r, case)
    return result

golden = json.load(open("golden.json", encoding="utf-8"))
before = run(golden, json.load(open("answers_v1.json", encoding="utf-8")))
after = run(golden, json.load(open("answers_v2.json", encoding="utf-8")))

mark = {True: "pass", False: "FAIL", None: "not run"}
for case in golden:
    b, a = before[case["id"]], after[case["id"]]
    note = "  <- broke" if b and a is False else "  <- fixed" if b is False and a else ""
    print(f"{case['id']:18} {mark[b]:8} {mark[a]:8}{note}")

def total(res): return sum(v is True for v in res.values()), sum(v is not None for v in res.values())
print("v1: %d of %d   v2: %d of %d" % (*total(before), *total(after)))

critical = [c["id"] for c in golden if c.get("critical") and after[c["id"]] is not True]
if critical:
    print("Not approved: a critical case does not pass:", ", ".join(critical))
elif total(after)[0] < total(before)[0]:
    print("Not approved: fewer cases pass than before.")
else:
    print("Approved.")
```

What to look at in the code:

- **Each grader is a small function that returns yes or no.** You can read it at a glance, and if a case fails, you can see exactly what it was looking for.
- **The cases live in a separate file.** Adding a new failure is adding a line to the JSON, without touching the program.
- **`None` means "could not be graded".** It is the cold pizza case, which needs a judge. It does not count for or against.
- **The decision looks first at the critical ones and then at the total.** A critical case that does not pass stops the change, even if it was already failing before or could not be graded.

The answers of both versions are examples, they do not come from a model. With them, the program runs and gives this:

```text
price_neapolitan   pass     pass
price_off_menu     FAIL     pass      <- fixed
total              pass     pass
allergy_arugula    pass     FAIL      <- broke
allergy_fugazzeta  pass     pass
order              pass     pass
menu               FAIL     pass      <- fixed
huge_order         pass     pass
monday             pass     pass
cold_pizza         not run  not run
v1: 7 of 9   v2: 8 of 9
Not approved: a critical case does not pass: allergy_arugula
```

The full process, every time something changes:

<figure>
<p class="fig-title">How a change gets approved</p>
<svg viewBox="0 0 400 560" width="100%" role="img" aria-labelledby="g16t" style="max-width:480px;display:block;margin:12px auto 0;font-family:inherit">
<title id="g16t">Diagram of the eval process: the golden set, with cases taken from real failures, is run with the new version; each answer is graded; it is compared case by case with the previous version; if a critical case does not pass or fewer cases pass, it is not approved and gets changed again; otherwise, it is approved. Each new failure that shows up is added to the golden set as a case.</title>
<defs><marker id="g16ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--color-ink)"/></marker></defs>
<rect x="30" y="14" width="240" height="56" rx="10" fill="oklch(87% 0.07 300)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150.0" y="38.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Golden set</text>
<text x="150.0" y="56.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">cases from real failures</text>
<path d="M150 70V92" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<rect x="30" y="94" width="240" height="56" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150.0" y="118.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Run the new version</text>
<text x="150.0" y="136.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">each case, same message</text>
<path d="M150 150V172" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<rect x="30" y="174" width="240" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150.0" y="198.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Grade each answer</text>
<text x="150.0" y="216.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">with code, a judge or a person</text>
<path d="M150 230V252" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<rect x="30" y="254" width="240" height="56" rx="10" fill="oklch(89% 0.09 75)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150.0" y="278.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Compare with the previous one</text>
<text x="150.0" y="296.5" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">case by case, not just the total</text>
<path d="M150 310V336" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<path d="M150 338L268 380L150 422L32 380Z" fill="var(--color-paper-hi)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150" y="385" font-size="14" fill="var(--color-ink)" text-anchor="middle"></text>
<text x="150" y="376" font-size="14" fill="var(--color-ink)" text-anchor="middle">Critical case fails</text>
<text x="150" y="394" font-size="14" fill="var(--color-ink)" text-anchor="middle">or fewer pass?</text>
<path d="M268 380H296" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<text x="282" y="370" font-size="14" fill="var(--color-muted)" text-anchor="middle">yes</text>
<rect x="298" y="352" width="94" height="56" rx="10" fill="oklch(87% 0.07 20)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="345.0" y="375.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Not</text>
<text x="345.0" y="393.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">approved</text>
<path d="M345 352V122H272" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<text x="352" y="240" font-size="13.5" fill="var(--color-muted)" text-anchor="start">new</text>
<text x="352" y="256" font-size="13.5" fill="var(--color-muted)" text-anchor="start">change</text>
<path d="M150 422V452" fill="none" stroke="var(--color-ink)" stroke-width="1.6" marker-end="url(#g16ink)"/>
<text x="160" y="442" font-size="14" fill="var(--color-muted)" text-anchor="start">no</text>
<rect x="30" y="454" width="240" height="50" rx="10" fill="oklch(88% 0.08 150)" stroke="var(--color-ink)" stroke-opacity=".25"/>
<text x="150.0" y="483.5" font-size="15" fill="var(--color-ink)" text-anchor="middle">Approved</text>
<path d="M150 504V522H12V42H28" fill="none" stroke="var(--color-ink)" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#g16ink)"/>
<text x="150" y="546" font-size="13.5" fill="var(--color-muted)" text-anchor="middle">once live, each new failure is one more case</text>
</svg>
<figcaption><ul><li>Violet: the golden set, what is stored.</li><li>Green: the assistant being tested, and the change that goes in.</li><li>Orange: your code, which grades and compares.</li><li>Red: the change does not go in.</li><li>The dashed line: each new failure that shows up is added as a case.</li></ul></figcaption>
</figure>

## The total goes up and the change does not go in

The new version passes 8 cases out of 9, and the previous one passed 7. If you only looked at the total, the change would be an improvement.

But case by case you see something else. The new prompt fixed two: the menu answer is now short, and it no longer makes up the price of the calabrese. And it broke one: by shortening the arugula answer, the walnut warning was lost. It is a critical case, so the change does not go in, even though the total went up.

Anthropic says it in [a guide from October 2026](https://claude.com/resources/articles/building-agents-when-to-fold-subagents-into-your-main-agent-loop) about when to merge several agents into one: when you compare, "don't just examine the final score, take a look at which tasks flipped". It is the example we saw when talking about agents: after merging the shipping agent into the main one, the assistant answered faster, but stopped checking the delivery date, something that used to work.

Running the cases that already worked to see that they still do has a name: **regression test**. Anthropic distinguishes two kinds of eval:

- **Regression:** what the assistant already does well. Nearly 100% of the cases have to pass; if that drops, something broke.
- **Capability:** what it still does badly and you want to improve. It starts with few cases passing, and goes up as the assistant improves.

La Esquina's golden set is mostly regression: each case is a failure that was already fixed and must not come back.

## With few cases, the percentage is misleading

"It went from 78% to 89%" sounds like a big improvement. With 9 cases, it is one case.

A model does not always answer the same, so the result of an eval has some chance in it, like flipping a coin a few times. If the assistant passes 16 cases out of 20, 80%, with another batch of similar cases it could have come out quite a bit higher or lower. The statistical calculation of how much it can move gives this:

| Result | It could really be between |
|---|---|
| 16 of 20 (80%) | 58% and 92% |
| 40 of 50 (80%) | 67% and 89% |
| 160 of 200 (80%) | 74% and 85% |

With 20 cases, going from 80% to 85% proves nothing. When comparing two versions on the same cases, what counts is the ones that changed, and at least 6 have to be fixed with none broken to rule out chance. At La Esquina 2 were fixed and 1 broke: with this golden set, there is no way to know whether the new version is better.

For the same reason, it is worth running each case more than once, especially the critical ones. In the October guide, Anthropic says the delivery date failure showed up in only one run out of two. The program above runs each case once, to keep it short; how to count several runs, in the next post.

That does not mean a small golden set is useless. It works for finding what broke, case by case, and for seeing large changes. Measuring small improvements takes more cases, and that is why Anthropic's guide notes that a more mature assistant will need larger evals.

## Reading what fails

A code grader also gets things wrong. The fugazzeta one looks for "doesn't have" or "doesn't contain". If the assistant answers "Not at all, just onion, mozzarella and oregano", the answer is correct and the grader says it does not pass. It is the weakness Anthropic points out in these graders: they fail on valid answers that do not match exactly what they were looking for.

And it also gets things wrong the other way, which is worse. If the assistant answers "It doesn't have onion, but it does have walnuts", the same grader finds "doesn't have" and says it passes. Nobody reviews a case that passes, so every so often you have to read some of those too.

So, before blaming the assistant, you have to read the answers that failed. Anthropic's guide puts it in its conclusion, with an exclamation mark: "Read the transcripts!". The transcript is everything that happened in each attempt: what the assistant answered, which tools it used and what they returned.

Anthropic's example: Claude Opus 4.5 scored 42% on CORE-Bench, a public test of scientific research tasks, until someone at Anthropic read the results and found errors in the test. One was that it marked "96.12" wrong when it expected "96.124991…". After fixing the test (and giving the model a less constrained environment), the score jumped to 95%.

And if a case never passes, in any of many attempts, the most likely thing, according to Anthropic, is that the case is badly set up, not that the assistant can't do it.

## Tools so you don't build it from scratch

The program above is enough to start. When the golden set grows, there are tools that already handle running, saving and comparing:

- **Promptfoo:** an open source tool that runs evals from a configuration file, on your computer or every time a change is pushed. In March 2026 it announced it is joining OpenAI, and that it stays open source.
- **Inspect:** an open source framework for evals, from the UK AI Security Institute (the British government institute that evaluates AI models), built together with the company Meridian Labs.
- **DeepEval:** an open source library from the company Confident AI, which writes evals as Python tests.
- **LangSmith**, the commercial service from LangChain (the company behind the framework for building agents), which has a free plan, also runs evals and saves the results.

The providers changed strategy. In June 2026, OpenAI [announced](https://developers.openai.com/api/docs/deprecations) that it is closing its evals platform: existing evals became read-only on October 31, 2026, and the shutdown date is November 30. It recommends moving to Promptfoo, and migrating means rebuilding each eval, not exporting it. Anthropic publishes guides, like the ones cited in this post. Google has an evaluation service in its Google Cloud platform, covered in the next post.

## In short

- An eval is a test for an AI system: cases, what is expected of each one and a way to grade. A golden set is that list of cases.
- The cases come from real failures, in both directions: when something has to happen and when it must not. Between 20 and 50 are enough to start.
- Grade with code whenever you can. People and another model are for what code cannot decide.
- When something changes, compare case by case with the previous version. If a critical case does not pass, the change does not go in, even if the total goes up.
- With few cases, a difference of a few points can be chance.
- Read the answers that fail: sometimes the one that is wrong is the grader.

One case is left ungraded: the cold pizza complaint, which is not solved by looking for a word. How to grade it with another model, and how to know whether that judge is reliable, in the next post.
