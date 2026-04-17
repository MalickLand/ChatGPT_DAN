# Zapier Zillow Alert Automation — Setup Guide

Monitors Zillow email alerts for **Hampshire, Mineral, and Hardy County WV** and forwards each to ChatGPT for analysis.

| Category | Price Range | Zap |
|----------|-------------|-----|
| Houses   | $150,000 – $400,000 | `zap_houses_150k_400k` |
| Land     | $50,000 – $400,000  | `zap_land_50k_400k`   |

---

## Prerequisites

1. **Zillow saved searches** — Create two saved searches on Zillow:
   - **Houses**: Hampshire County WV + Mineral County WV + Hardy County WV, $150K–$400K, property type = House
   - **Land**: Same counties, $50K–$400K, property type = Land/Lots
   - Enable **email alerts** (daily or instant) for both.

2. **Gmail labels** — Create two labels in Gmail:
   - `Zillow/Houses`
   - `Zillow/Land`
   - Set up Gmail filters to auto-label incoming Zillow alerts by property type.

3. **Zapier account** — Free tier works for low volume; Professional tier recommended for 15-minute polling.

4. **ChatGPT Zapier integration** — Connect your OpenAI account in Zapier (requires an OpenAI API key with GPT-4 access).

---

## Zap 1: Houses ($150K–$400K)

### Step 1 — Trigger: Gmail → New Email Matching Search
- **Search string**: `from:zillow.com label:Zillow/Houses`
- **Polling interval**: 15 minutes

### Step 2 — Code by Zapier → Run Javascript
- Copy the contents of `parse-zillow-email.js` into the code field.
- **Input Data**:
  - `email_subject` → `{{trigger.subject}}`
  - `email_body` → `{{trigger.body_plain}}`
  - `email_date` → `{{trigger.date}}`

### Step 3 — Filter by Zapier
- **Only continue if**: Price is between $150,000 and $400,000
- **AND**: Body does NOT contain "land", "vacant lot", "acres only"

### Step 4 — ChatGPT → Conversation
- **Model**: GPT-4
- **System prompt**: Copy contents of `chatgpt-prompt-houses.txt`
- **User message**: Use the template from `zap-config.json` → `zaps[0].actions[1].config.user_message`, replacing `{{steps.1.*}}` with the mapped fields from Step 2.

### Step 5 — Gmail → Send Email
- **To**: Your email
- **Subject**: `🏠 Zillow Analysis: {{steps.2.address}} — {{steps.2.price}}`
- **Body**: `{{steps.4.reply}}`

---

## Zap 2: Land ($50K–$400K)

### Step 1 — Trigger: Gmail → New Email Matching Search
- **Search string**: `from:zillow.com label:Zillow/Land`
- **Polling interval**: 15 minutes

### Step 2 — Code by Zapier → Run Javascript
- Same `parse-zillow-email.js` as Zap 1.
- Same input data mapping.

### Step 3 — Filter by Zapier
- **Only continue if**: Price is between $50,000 and $400,000
- **AND**: Body CONTAINS at least one of: "land", "lot", "acres", "vacant", "parcel"

### Step 4 — ChatGPT → Conversation
- **Model**: GPT-4
- **System prompt**: Copy contents of `chatgpt-prompt-land.txt`
- **User message**: Use the template from `zap-config.json` → `zaps[1].actions[1].config.user_message`, replacing `{{steps.1.*}}` with the mapped fields from Step 2.

### Step 5 — Gmail → Send Email
- **To**: Your email
- **Subject**: `🏞️ Zillow Land Analysis: {{steps.2.address}} — {{steps.2.price}} ({{steps.2.acreage}})`
- **Body**: `{{steps.4.reply}}`

---

## File Reference

| File | Purpose |
|------|---------|
| `zap-config.json` | Full Zap configuration (both automations) |
| `parse-zillow-email.js` | Code by Zapier step — extracts structured data from Zillow emails |
| `chatgpt-prompt-houses.txt` | ChatGPT system prompt for house analysis |
| `chatgpt-prompt-land.txt` | ChatGPT system prompt for land analysis |

---

## Troubleshooting

- **No emails matching**: Verify your Zillow saved searches have email alerts enabled and check that Gmail labels are being applied correctly.
- **Price filter not working**: Zillow email formats change periodically. Update the regex patterns in `parse-zillow-email.js` if price extraction fails.
- **ChatGPT returning generic responses**: Ensure the system prompt is in the "System" field, not concatenated with the user message.
- **Duplicate alerts**: Add a Zapier "Dedupe" step using the listing URL as the unique key.
