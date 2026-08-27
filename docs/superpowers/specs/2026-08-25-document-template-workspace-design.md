# eCourts Document Template Workspace

## Goal

Give first-time citizens a private, template-led way to prepare useful drafts without presenting generated text as a filed court document, legal advice, or a substitute for an official form.

## Research notes

- NALSA permits a legal-aid request through its prescribed form or a written application containing the necessary details: https://nalsa.gov.in/legal-aid/
- eCourts e-Filing accepts prescribed filing information, pleadings, replies, applications and uploaded PDF documents through the official workflow: https://filing.ecourts.gov.in/
- Section 10 of the Indian Contract Act makes validity depend on competent parties, free consent, lawful consideration and a lawful object, while preserving other writing, witnessing and registration requirements: https://www.indiacode.nic.in/show-data?actid=AC_CEN_3_20_00035_187209_1523268996428&orderno=10
- Section 17 of the Registration Act requires registration for specified property instruments and leases: https://www.indiacode.nic.in/bitstream/123456789/15937/1/the_registration_act%2C1908.pdf
- The workspace therefore generates editable drafts and preparation notes, not final pleadings, affidavits, bail applications, deeds, powers of attorney or court orders.

## Included templates

1. Legal aid application
2. Payment demand letter
3. Settlement proposal
4. Case chronology
5. Evidence index
6. Service agreement
7. Confidentiality agreement
8. Loan acknowledgement

## Interaction

Documents appears in desktop navigation, the mobile menu and the public home task list. A template selector opens guided fields beside a live paper preview. Required fields use browser validation. Review updates the preview, Clear removes the current answers, and Download PDF creates the file locally.

## Privacy and safety

- Draft values remain in memory and are not added to localStorage.
- User values enter the preview through `textContent`, not HTML parsing.
- Every screen and PDF labels the output as a draft that is not filed or signed.
- Agreement templates warn about review, signatures, witnesses, stamp duty and registration.
- PDF export currently supports English text. Regional-script text remains visible in the preview and export is blocked rather than silently corrupting characters.

## Verification

Test all templates, required-field validation, literal hostile input, mobile and desktop layout, long multi-page documents, repeated page warnings, case-document download, and PDF parsing/rendering.

