# Alphabet++

**Structured language for structuring agent behaviour.**

A method for designing natural-language concepts so that their *semantics* become
reusable control abstractions for an LLM — carrying precedence, state transitions and
proof obligations, not just meaning.

**Live site → https://abarbesgaard.github.io/alphabet-plus-plus/**

---

## The idea in one paragraph

Coding agents can solve problems; their *process* is the unreliable part. We keep
re-supplying the same method by hand — investigate first, reproduce before you change,
prove the fix, show the output, keep going. Alphabet++ asks whether that control
structure can live in the meaning of the words themselves: define a concept precisely
once, and every later invocation of its name re-imports applicability, an ordered
framework, exclusions, evidence gates and a definition of done.

```
Name → Define → Relate → Invoke
```

## The part that surprised me

Think of it in terms of shapes. When an agent works on your code it is handling
**triangles** — `fix`, `check`, `test`, `build`, `done` — thousands of them, in the diff,
the log, the tests and your own request. Write your instruction in those same words and
your instruction is just another triangle.

So make it a **square**. Still a shape, still ordinary language the model reads exactly the
same way — just not one of the triangles. `Emendatio` appears in exactly one place, so it
has one referent, and I defined it. The same property makes the *boundaries* legible:
"starting the fix" is a sentence you have to interpret, `Emendatio · Probatio` is a marker
you can see.

You can miss in two directions. Too ordinary and it collides — another triangle. Too
obscure (`Z7`, `blorf`) and it's a shape nobody can name: distinct, but carrying nothing, so
you write the whole instruction out anyway. Latin plausibly sits
between — rare in source, abundant in training data, still transparent. **That middle band
is untested.**

Caveat, stated plainly: I switched to this and never switched back. No control group, one
author, one workflow. It felt like a *stronger* constraint than writing a plan — and adding
a plan on top made it stronger still rather than redundant — but "felt like" is exactly the
problem. See [Let's discuss](https://abarbesgaard.github.io/alphabet-plus-plus/#discuss).

## Let's discuss

I'm not selling a method. This is one person's experience with no control group — I
switched to it and never switched back, so I'm comparing against memory. Where I think
it's weakest:

- **Is it the word, or just the structure?** I changed two things at once: I wrote the
  process down as ordered steps, *and* named those steps in a vocabulary the codebase never
  uses. I can't separate them from where I sit.
- **Does it survive a second person?** One author, one workflow. It may be tuned to how I
  already work rather than to anything general.
- **Would any odd word do?** Latin might be irrelevant, or might be doing real work by
  being rare in code but common in training data. I don't know which.
- **Is this prompt engineering in a costume?** Possibly. The honest version of the claim is
  small: *don't name your instructions with words your repository already uses.* If that's
  obvious to you, it's obvious — but almost nobody does it.

**How to prove me wrong:** take a skill file that works, copy it, and in the copy swap the
disjoint names for ordinary ones — `Emendatio` → `Fix`, `Testis` → `Check` — changing
nothing else. Run both against the same tasks. If they perform the same, the vocabulary is
decoration and I'll say so.

## Three primitives

| Primitive | What it is |
| --- | --- |
| **Concepts** | Named semantic objects with constrained meaning: *identity, trigger, exclusions, consequences*. The name must be **lexically disjoint** from the domain — a word your codebase never says. |
| **Relations** | Precedence, sequence, exclusion, implication, guards — `Lex > Mos`, `Prove → Mend`, `Testis fails → Mend`. |
| **Activation** | Invoking the name to load the structure. Anecdotally it holds for the rest of the session once established early — no re-invocation needed. |

## What it is not

- **Not a DSL or runtime.** No parser, no grammar. The interpreter is the model.
- **Not "write a good skill".** Skills research treats the text as procedural content;
  this is about the architecture of that text.
- **Not a substitute for formal methods.** No guarantees. When you need one, enforcement
  belongs in constrained execution.
- **Not determinism.** Writing a precedence order does not make a model obey it — which
  is why completion is defined by external witnesses.

## Status

Unproven, and deliberately cheap to falsify. The load-bearing claim is that a *lexically
disjoint* name outperforms an identical framework using colliding names — same bytes, nouns
swapped. If it doesn't, the vocabulary is decoration and the idea reduces to "structured
instructions and external checks work" — true, but not new.

[Sara](https://github.com/Abarbesgaard/Sara) is the reference implementation for
software-engineering agents.

---

## This repository

A single-page static site. No framework, no build step, no dependencies.

```
index.html      structure and copy
styles.css      design system (tokens, layout, motion)
main.js         progressive enhancement — theme, reveal, scroll-spy
scripts/check.mjs   structural verification
```

### Run locally

```sh
python3 -m http.server 8080
# → http://localhost:8080
```

### Verify

```sh
node scripts/check.mjs
```

Checks that the required files exist, that the referenced assets resolve, that the
wordmark renders the Greek alpha while remaining accessible as "Alphabet++", that every
nav link has a matching section, and that motion is gated behind
`prefers-reduced-motion`.

### Deploy

Pushing to `main` publishes via `.github/workflows/pages.yml` (GitHub Pages,
`build_type=workflow`).

## Contributing

Findings are welcome — **including negative ones**. If you run any of the experiments and
Alphabet++ does not beat the checklist baseline, that is the most valuable issue you
could open.

## Licence

[MIT](LICENSE)
