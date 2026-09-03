# AI Proof-of-Concept: Stage C Order Extractor

This folder contains a working demonstration of the **2-step anti-hallucination pipeline** described in [PROJECT_BOOK.md Section 7](../docs/submission/PROJECT_BOOK.md).

## What it does

1. **Step 1 — Structured Extraction:** Feeds the synthetic court order from `DEMO010002026` to OpenAI `gpt-4o-mini` with Structured Outputs (JSON Schema). The model extracts only facts that are explicitly stated: CNR, dates, parties, directions, deadlines, and hearing details.

2. **Step 2 — Grounded Explanation:** Passes the extracted JSON (not the original order) to a second prompt that generates a plain-language explanation. If a field is `null`, the explanation says *"the order does not state this"* — it never invents.

## Why two steps?

A single "summarise this PDF" prompt will hallucinate deadlines, invent attendance requirements, and fabricate legal obligations. The 2-step split forces the model to show its work:

- **Step 1** constrains output to a strict JSON schema — the model cannot invent fields.
- **Step 2** constrains input to only the JSON — the model cannot reach back into the order and misread it.

This is how you stop hallucinations in civic/legal applications without a 40-page system prompt.

## How to run

```bash
pip install openai
set OPENAI_API_KEY=sk-your-key-here   # Windows
# export OPENAI_API_KEY=sk-...        # macOS/Linux
python demo_order_extractor.py
```

Output is saved to `demo_output.json` and can be reviewed without an API key.

## Pre-generated output

If you don't have an API key, run the script anyway — it will display the pre-generated output from `demo_output.json`.

## Synthetic data only

All case data is synthetic. The CNR `DEMO010002026`, parties, court, and order are fictional. No real court records are processed.
