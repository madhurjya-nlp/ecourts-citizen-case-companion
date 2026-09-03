# eCourts Citizen Case Companion — AI Proof-of-Concept
# Stage C: Structured Extraction → Grounded Explanation
#
# This script demonstrates the 2-step anti-hallucination architecture
# described in Section 7 of the PROJECT_BOOK:
#
#   Step 1: Extract structured facts from a court order into JSON
#   Step 2: Generate a plain-language explanation using ONLY the extracted JSON
#
# If a field is null or missing, the explanation says so — it never invents.
# This is how you stop hallucinations without a 40-page system prompt.
#
# Usage:
#   pip install openai
#   set OPENAI_API_KEY=sk-...
#   python demo_order_extractor.py
#
# The script uses the same synthetic order from DEMO010002026 that ships
# with the live prototype. No real court data is touched.

import json
import os
import sys
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("ERROR: openai package not installed. Run: pip install openai")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Synthetic court order (same matter as DEMO010002026 in the live prototype)
# ---------------------------------------------------------------------------
SYNTHETIC_ORDER = """
IN THE COURT OF THE CIVIL JUDGE (SENIOR DIVISION)
DEMO DISTRICT COURT, KAMRUP (METROPOLITAN), GUWAHATI

CIVIL SUIT NO. CS/1234/2026
CNR: DEMO010002026

Demo Petitioner A
        … Petitioner
    vs.
Demo Respondent B
        … Respondent

ORDER (Interim — 15 July 2026)

This matter was listed today for hearing on the application under Order XXXIX
Rules 1 and 2 of the Code of Civil Procedure, 1908.

After hearing learned counsel for both sides and perusing the record, the Court
is of the prima facie view that the petitioner has made out a case for interim
protection of the suit property.

It is hereby ORDERED:

1. The respondent shall produce all original property-related documents,
   including the registered sale deed, mutation records, and land revenue
   receipts, before this Court within 30 (thirty) days from the date of
   this order.

2. Neither party shall alienate, encumber, or create any third-party interest
   in the suit property during the pendency of this suit.

3. The petitioner's counsel shall file written objections, if any, to the
   respondent's reply by 10 August 2026.

4. List for next hearing on 20 August 2026 at 10:30 AM in Court Room 4.

                                                    Sd/-
                                        Civil Judge (Senior Division)
                                        Demo District Court, Guwahati
""".strip()

# ---------------------------------------------------------------------------
# JSON schema for structured extraction (Stage C, Step 1)
# ---------------------------------------------------------------------------
EXTRACTION_SCHEMA = {
    "name": "court_order_extraction",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "cnr": {
                "type": ["string", "null"],
                "description": "Case Number Record (CNR) identifier"
            },
            "case_number": {
                "type": ["string", "null"],
                "description": "Official case number as stated in the order"
            },
            "court_name": {
                "type": ["string", "null"],
                "description": "Name and location of the court"
            },
            "order_type": {
                "type": ["string", "null"],
                "description": "Whether the order is interim, final, procedural, etc."
            },
            "order_date": {
                "type": ["string", "null"],
                "description": "Date the order was passed, in ISO 8601 or as stated"
            },
            "petitioner": {
                "type": ["string", "null"],
                "description": "Name of the petitioner / plaintiff"
            },
            "respondent": {
                "type": ["string", "null"],
                "description": "Name of the respondent / defendant"
            },
            "directions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "direction_number": {"type": "integer"},
                        "text": {"type": "string"},
                        "deadline": {"type": ["string", "null"]},
                        "responsible_party": {"type": ["string", "null"]}
                    },
                    "required": ["direction_number", "text", "deadline", "responsible_party"],
                    "additionalProperties": False
                },
                "description": "Explicit directions or orders given by the court"
            },
            "next_hearing_date": {
                "type": ["string", "null"],
                "description": "Date and time of the next hearing, if stated"
            },
            "next_hearing_location": {
                "type": ["string", "null"],
                "description": "Court room or location for the next hearing"
            },
            "attendance_required": {
                "type": ["string", "null"],
                "description": "Whether personal attendance is explicitly required, or null if not stated"
            },
            "legal_provision_cited": {
                "type": ["string", "null"],
                "description": "Any statute, order, rule, or section cited in the order"
            }
        },
        "required": [
            "cnr", "case_number", "court_name", "order_type", "order_date",
            "petitioner", "respondent", "directions", "next_hearing_date",
            "next_hearing_location", "attendance_required", "legal_provision_cited"
        ],
        "additionalProperties": False
    }
}

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
EXTRACTION_SYSTEM = """You are a precise legal document parser for Indian court orders.

Extract ONLY facts that are explicitly stated in the order text.
- If a field is not mentioned in the order, set it to null.
- Do not infer, predict, or assume anything not written.
- For directions, extract each numbered direction verbatim with its deadline and responsible party.
- Use the exact names, dates, and identifiers from the document.

Output valid JSON matching the provided schema. Nothing else."""

EXPLANATION_SYSTEM = """You are a plain-language legal companion for Indian citizens who have never been to court.

You will receive a JSON object containing facts extracted from a court order.
Your job is to explain what these facts mean in simple, clear language.

Rules:
1. Explain ONLY what is in the JSON. Do not add legal advice or predictions.
2. If a field is null, say "The order does not state this" or "This is not mentioned."
3. Use short sentences. Avoid legal jargon — if you must use a term, explain it in parentheses.
4. Structure your response with these sections:
   - WHAT HAPPENED: What is this order about?
   - WHAT YOU MUST DO: Any actions required and their deadlines.
   - NEXT HEARING: When and where to appear.
   - WHAT IS NOT CLEAR: Fields that were null or uncertain — suggest verifying with a lawyer or legal aid.
5. End with: "For free legal help, contact NALSA (National Legal Services Authority) or Tele-Law through the Department of Justice."
6. Never predict the outcome of the case.
7. Never say "I" — you are a tool, not a person."""

EXPLANATION_USER = """Here are the extracted facts from the court order. Explain them in plain language for a citizen:

{extracted_json}"""


def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("=" * 70)
        print("ERROR: OPENAI_API_KEY environment variable not set.")
        print()
        print("To run this demo:")
        print("  set OPENAI_API_KEY=sk-your-key-here")
        print("  python demo_order_extractor.py")
        print()
        print("Falling back to pre-generated output in demo_output.json...")
        print("=" * 70)

        output_path = Path(__file__).parent / "demo_output.json"
        if output_path.exists():
            with open(output_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            print()
            print("-" * 70)
            print("STEP 1 — STRUCTURED EXTRACTION (pre-generated)")
            print("-" * 70)
            print(json.dumps(data["step_1_extraction"], indent=2))
            print()
            print("-" * 70)
            print("STEP 2 — PLAIN-LANGUAGE EXPLANATION (pre-generated)")
            print("-" * 70)
            print(data["step_2_explanation"])
        else:
            print("No pre-generated output found. Please set OPENAI_API_KEY.")
        return

    client = OpenAI(api_key=api_key)
    model = "gpt-4o-mini"

    print("=" * 70)
    print("eCourts Citizen Case Companion — AI Proof-of-Concept")
    print("Stage C: Structured Extraction → Grounded Explanation")
    print(f"Model: {model}")
    print("=" * 70)

    # -----------------------------------------------------------------------
    # STEP 1: Extract structured facts from the court order
    # -----------------------------------------------------------------------
    print()
    print("-" * 70)
    print("SYNTHETIC COURT ORDER (input)")
    print("-" * 70)
    print(SYNTHETIC_ORDER)
    print()

    print("-" * 70)
    print("STEP 1: Extracting structured facts...")
    print("-" * 70)

    extraction_response = client.chat.completions.create(
        model=model,
        response_format={
            "type": "json_schema",
            "json_schema": EXTRACTION_SCHEMA
        },
        messages=[
            {"role": "system", "content": EXTRACTION_SYSTEM},
            {"role": "user", "content": f"Extract facts from this Indian court order:\n\n{SYNTHETIC_ORDER}"}
        ],
        temperature=0.0
    )

    extracted_json_str = extraction_response.choices[0].message.content
    extracted = json.loads(extracted_json_str)

    print(json.dumps(extracted, indent=2))
    print()

    # -----------------------------------------------------------------------
    # STEP 2: Generate plain-language explanation from ONLY the extracted JSON
    # -----------------------------------------------------------------------
    print("-" * 70)
    print("STEP 2: Generating plain-language explanation from extracted facts...")
    print("-" * 70)

    explanation_response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": EXPLANATION_SYSTEM},
            {"role": "user", "content": EXPLANATION_USER.format(
                extracted_json=json.dumps(extracted, indent=2)
            )}
        ],
        temperature=0.3
    )

    explanation = explanation_response.choices[0].message.content

    print(explanation)
    print()

    # -----------------------------------------------------------------------
    # Save output for judges who may not have an API key
    # -----------------------------------------------------------------------
    output = {
        "meta": {
            "project": "eCourts Citizen Case Companion",
            "stage": "Stage C — Structured Extraction + Grounded Explanation",
            "model": model,
            "description": (
                "2-step anti-hallucination pipeline: (1) extract facts to JSON, "
                "(2) explain only what the JSON contains. Null fields become "
                "'the order does not state this' in the explanation."
            ),
            "synthetic_data_only": True,
            "cnr": "DEMO010002026"
        },
        "input_order": SYNTHETIC_ORDER,
        "step_1_extraction": extracted,
        "step_2_explanation": explanation,
        "usage": {
            "step_1_tokens": {
                "prompt": extraction_response.usage.prompt_tokens,
                "completion": extraction_response.usage.completion_tokens
            },
            "step_2_tokens": {
                "prompt": explanation_response.usage.prompt_tokens,
                "completion": explanation_response.usage.completion_tokens
            }
        }
    }

    output_path = Path(__file__).parent / "demo_output.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print("-" * 70)
    print(f"Output saved to: {output_path}")
    print("-" * 70)
    print()
    print("KEY DESIGN INSIGHT:")
    print("  The explanation in Step 2 is grounded entirely in Step 1's JSON.")
    print("  If a field is null, the explanation says 'the order does not state this.'")
    print("  This is how you stop LLM hallucinations in civic/legal applications")
    print("  without a 40-page system prompt.")
    print()
    print("  For free legal help: NALSA (doj.gov.in) or Tele-Law (doj.gov.in)")


if __name__ == "__main__":
    main()
