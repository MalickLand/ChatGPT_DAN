# Zapier Automation: Zillow Property Alert Emails → ChatGPT Analysis

This guide sets up a Zapier workflow that watches your Zillow alert emails, filters
them by property category and price range, then forwards each listing to ChatGPT
for a plain-English analysis and summary.

---

## Property Categories Monitored

| Category | Price Range |
|----------|-------------|
| Houses   | $150,000 – $400,000 |
| Land     | $50,000 – $400,000 |

---

## Prerequisites

- A Zapier account (Free tier works; multi-step Zaps require a paid plan)
- Gmail (or any IMAP email account) connected to Zapier
- An OpenAI account with API access connected to Zapier
- Zillow saved searches set up for each category (see Step 0 below)

---

## Step 0 — Configure Zillow Saved Searches

Set up two saved searches on Zillow so you receive separate alert emails per category:

1. **Houses Search**
   - Property type: `Houses`
   - Min price: `$150,000` / Max price: `$400,000`
   - Enable email alerts: *Immediately* or *Daily digest*

2. **Land Search**
   - Property type: `Land`
   - Min price: `$50,000` / Max price: `$400,000`
   - Enable email alerts: *Immediately* or *Daily digest*

Zillow alert emails arrive from `alerts@zillow.com` with subject lines like:
- `"3 new homes for sale matching your search"`
- `"New land listing matching your search"`

---

## Zap 1 — Houses ($150K–$400K)

### Trigger — New Zillow House Alert Email

| Field | Value |
|-------|-------|
| App | **Gmail** (or Email by Zapier) |
| Event | `New Email Matching Search` |
| From | `alerts@zillow.com` |
| Subject contains | `home` OR `house` |
| Label / Folder | `Inbox` |

> **Tip:** In Gmail, create a filter that auto-labels Zillow house alerts with
> `zillow-houses` so the Zap trigger is precise.

### Filter (Zap built-in Filter step)

Only continue if **all** of the following are true:

```
Email From  →  Contains  →  zillow.com
Email Subject  →  Does not contain  →  land
```

### Action — ChatGPT Analysis

| Field | Value |
|-------|-------|
| App | **OpenAI (ChatGPT)** |
| Event | `Send Message` |
| Model | `gpt-4o` (or `gpt-4-turbo`) |
| System Prompt | *(see ChatGPT Prompt section below)* |
| User Message | `{{Email Body Plain}}` |

### Action — Send Summary (optional)

Forward the ChatGPT response to yourself:

| Field | Value |
|-------|-------|
| App | **Gmail** |
| Event | `Send Email` |
| To | `your@email.com` |
| Subject | `[House Alert Summary] {{Email Subject}}` |
| Body | `{{ChatGPT Response}}` |

---

## Zap 2 — Land ($50K–$400K)

### Trigger — New Zillow Land Alert Email

| Field | Value |
|-------|-------|
| App | **Gmail** |
| Event | `New Email Matching Search` |
| From | `alerts@zillow.com` |
| Subject contains | `land` |
| Label / Folder | `Inbox` |

> **Tip:** Label these emails `zillow-land` in Gmail for a clean trigger.

### Filter

Only continue if **all** of the following are true:

```
Email From  →  Contains  →  zillow.com
Email Subject  →  Contains  →  land
```

### Action — ChatGPT Analysis

Same as Zap 1 but use the **Land-specific system prompt** below.

### Action — Send Summary (optional)

| Field | Value |
|-------|-------|
| Subject | `[Land Alert Summary] {{Email Subject}}` |
| Body | `{{ChatGPT Response}}` |

---

## ChatGPT Prompts

### System Prompt — Houses

```
You are a real estate assistant helping a buyer find houses priced between $150,000
and $400,000. When given a Zillow alert email, extract and analyze every listing.

For each property, produce a concise summary with:

1. **Address & Price** – full address and listing price
2. **Key Stats** – beds, baths, square footage, lot size (if listed), year built
3. **Price Per Sq Ft** – calculate if data is available
4. **Highlights** – notable features (garage, updated kitchen, large yard, etc.)
5. **Concerns** – anything that might warrant caution (high DOM, price reduced, etc.)
6. **Verdict** – one sentence: is this worth a closer look? Why or why not?

After all individual listings, add a **Top Pick** section naming the single best
value in the batch and a one-paragraph justification.

Keep the tone practical and buyer-focused. Do not invent data not present in the email.
```

### System Prompt — Land

```
You are a real estate assistant helping a buyer find land parcels priced between
$50,000 and $400,000. When given a Zillow alert email, extract and analyze every
listing.

For each parcel, produce a concise summary with:

1. **Address / Parcel ID & Price** – location and listing price
2. **Size** – acreage or square footage
3. **Price Per Acre** – calculate if data is available
4. **Zoning / Use** – residential, agricultural, commercial, unzoned, etc.
5. **Utilities** – water, sewer, electric availability (if mentioned)
6. **Access** – road frontage, easements noted
7. **Highlights** – topography, wooded, cleared, views, etc.
8. **Concerns** – flood zone, landlocked, restrictions, etc.
9. **Verdict** – one sentence: is this worth a closer look? Why or why not?

After all individual listings, add a **Top Pick** section naming the best
opportunity in the batch and a one-paragraph justification.

Keep the tone practical and buyer-focused. Do not invent data not present in the email.
```

---

## Zap Architecture Diagram

```
Zillow Alert Email
        │
        ▼
  Gmail Trigger
  (from: alerts@zillow.com)
        │
        ├──── Subject contains "home/house" ──────────────────────────┐
        │                                                              │
        │                                                              ▼
        │                                                    Filter: exclude "land"
        │                                                              │
        │                                                              ▼
        │                                                  OpenAI: House Prompt
        │                                                              │
        │                                                              ▼
        │                                                 Gmail: Send House Summary
        │
        └──── Subject contains "land" ────────────────────────────────┐
                                                                       │
                                                                       ▼
                                                             Filter: confirm "land"
                                                                       │
                                                                       ▼
                                                          OpenAI: Land Prompt
                                                                       │
                                                                       ▼
                                                        Gmail: Send Land Summary
```

---

## Tips & Troubleshooting

| Issue | Fix |
|-------|-----|
| Zap triggers on non-Zillow emails | Tighten Gmail filter label or add `From Contains zillow.com` filter step |
| ChatGPT returns "no listings found" | Zillow may send HTML-only emails; switch trigger field to `Email Body HTML` and ask GPT to parse HTML |
| Token limit exceeded | Add a **Formatter by Zapier** step to truncate `{{Email Body Plain}}` to 8,000 characters before passing to OpenAI |
| Duplicate alerts | Add a **Storage by Zapier** step to track processed email IDs and skip duplicates |
| Price range slipped past Zillow | Add a Filter step using **Formatter** to extract prices from the email body and confirm they fall within range |

---

## File Reference

```
zapier_zillow_property_alerts.md   ← this file (setup guide + prompts)
```
