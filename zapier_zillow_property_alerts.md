# Zapier Automation: Zillow Property Alert Emails → ChatGPT Analysis

This guide sets up a Zapier workflow that watches your Zillow alert emails for
**Hampshire, Hardy, and Mineral counties, WV**, filters them by property category
and price range, then forwards each listing to ChatGPT for a plain-English
analysis and summary.

---

## Target Area

| County | State | Notes |
|--------|-------|-------|
| Hampshire County | WV | County seat: Romney; rural/mountain terrain, South Branch Potomac River corridor |
| Hardy County | WV | County seat: Moorefield; Cacapon/Lost River valleys, agricultural flats and ridges |
| Mineral County | WV | County seat: Keyser; Potomac River, more developed than Hardy/Hampshire, closer to MD |

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
- Zillow saved searches set up for each category and county (see Step 0 below)

---

## Step 0 — Configure Zillow Saved Searches

Set up **six saved searches** on Zillow (one per category per county) so you
receive clearly labeled alert emails. Alternatively, create two searches with
all three counties drawn on the map tool.

### Recommended approach — draw map boundaries

On Zillow, use the **Draw** tool to outline all three counties in one search:

1. **Houses Search**
   - Draw boundary covering Hampshire + Hardy + Mineral counties
   - Property type: `Houses`
   - Min price: `$150,000` / Max price: `$400,000`
   - Sort: `Newest`
   - Enable email alerts: *Immediately*

2. **Land Search**
   - Same boundary
   - Property type: `Land / Lots`
   - Min price: `$50,000` / Max price: `$400,000`
   - Sort: `Newest`
   - Enable email alerts: *Immediately*

### Alternative — per-county searches

| Search Name | County | Type | Min | Max |
|-------------|--------|------|-----|-----|
| WV Houses – Hampshire | Hampshire County, WV | Houses | $150K | $400K |
| WV Houses – Hardy | Hardy County, WV | Houses | $150K | $400K |
| WV Houses – Mineral | Mineral County, WV | Houses | $150K | $400K |
| WV Land – Hampshire | Hampshire County, WV | Land | $50K | $400K |
| WV Land – Hardy | Hardy County, WV | Land | $50K | $400K |
| WV Land – Mineral | Mineral County, WV | Land | $50K | $400K |

Zillow alert emails arrive from `alerts@zillow.com` with subject lines like:
- `"3 new homes for sale matching your search"`
- `"New land listing matching your search"`

> **Tip:** Create a Gmail filter (`from:alerts@zillow.com`) that auto-labels
> emails as `zillow-houses` or `zillow-land` based on subject keywords.
> This keeps Zap triggers clean and avoids cross-firing.

---

## Zap 1 — Houses ($150K–$400K) | Hampshire, Hardy & Mineral Counties WV

### Trigger — New Zillow House Alert Email

| Field | Value |
|-------|-------|
| App | **Gmail** (or Email by Zapier) |
| Event | `New Email Matching Search` |
| From | `alerts@zillow.com` |
| Subject contains | `home` OR `house` |
| Label / Folder | `zillow-houses` (or `Inbox`) |

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
| Model | `gpt-4o` |
| System Prompt | *(see Houses prompt below)* |
| User Message | `{{Email Body Plain}}` |

### Action — Send Summary (optional)

| Field | Value |
|-------|-------|
| App | **Gmail** |
| Event | `Send Email` |
| To | `your@email.com` |
| Subject | `[WV House Alert] {{Email Subject}}` |
| Body | `{{ChatGPT Response}}` |

---

## Zap 2 — Land ($50K–$400K) | Hampshire, Hardy & Mineral Counties WV

### Trigger — New Zillow Land Alert Email

| Field | Value |
|-------|-------|
| App | **Gmail** |
| Event | `New Email Matching Search` |
| From | `alerts@zillow.com` |
| Subject contains | `land` |
| Label / Folder | `zillow-land` (or `Inbox`) |

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
| Subject | `[WV Land Alert] {{Email Subject}}` |
| Body | `{{ChatGPT Response}}` |

---

## ChatGPT Prompts

### System Prompt — Houses (Hampshire / Hardy / Mineral Counties, WV)

```
You are a real estate assistant helping a buyer find houses in Hampshire, Hardy,
and Mineral counties, West Virginia, priced between $150,000 and $400,000.

Regional context you should apply when analyzing listings:
- These are rural Appalachian mountain counties in the Eastern Panhandle / Potomac
  Highlands region of WV.
- Property values are generally below national averages; $150-$250/sqft is
  typical for updated homes in this area.
- Well and septic are standard (municipal water/sewer is a notable positive).
- Gravel or unpaved road access is common; state-maintained road frontage is a plus.
- Flood zones along the South Branch Potomac, Cacapon River, Lost River, and
  North Fork South Branch are important to flag.
- Many homes are older (pre-1970); check for noted updates to roof, HVAC, plumbing.
- Mineral County (Keyser area) tends to have more services and commuter access
  to Cumberland, MD (~10 mi); Hardy and Hampshire are more remote.
- Hardy County (Moorefield) has a notable agricultural/poultry industry presence.
- Hampshire County (Romney) is the oldest incorporated town in WV; mix of historic
  homes and rural properties.

When given a Zillow alert email, extract and analyze every listing.

For each property, produce a concise summary with:

1. **Address & County** – full address, identify which of the three counties
2. **Price** – listing price
3. **Key Stats** – beds, baths, square footage, lot size, year built
4. **Price Per Sq Ft** – calculate if data is available; note if above/below
   regional average (~$150-$250/sqft)
5. **Highlights** – positive features (updated systems, garage, large lot,
   mountain views, creek, state road access, municipal utilities, etc.)
6. **Concerns** – red flags (flood zone, well/septic age unknown, steep access,
   high DOM, price reduced multiple times, mobile home on permanent foundation, etc.)
7. **Commute / Access note** – proximity to Romney, Moorefield, Keyser, or
   Cumberland MD if discernible from address
8. **Verdict** – one sentence: is this worth a closer look? Why or why not?

After all individual listings, add a **Top Pick** section naming the single best
value in the batch with a one-paragraph justification that factors in WV rural
market norms.

Keep the tone practical and buyer-focused. Do not invent data not present in the email.
```

---

### System Prompt — Land (Hampshire / Hardy / Mineral Counties, WV)

```
You are a real estate assistant helping a buyer find land parcels in Hampshire,
Hardy, and Mineral counties, West Virginia, priced between $50,000 and $400,000.

Regional context you should apply when analyzing listings:
- Rural Appalachian terrain: ridges, hollows, creek bottoms, and valley floors.
  Topography varies dramatically — flat bottomland commands a premium.
- Typical raw land price range: $1,000–$5,000/acre for wooded ridge land;
  $3,000–$10,000/acre for cleared bottomland or land with creek frontage;
  higher for land with existing well/septic, road frontage, or structures.
- Well and septic will be needed on most parcels; confirm perc test results if
  mentioned.
- WVDOH (WV Division of Highways) maintained road frontage vs. private road or
  deeded right-of-way is a key access distinction.
- Mineral rights: WV has a long history of severed mineral rights (coal, gas,
  oil). Note if mineral rights convey or are severed.
- Flood plain: South Branch Potomac, Cacapon River, Lost River, and North Fork
  South Branch all have significant 100-year flood zones.
- Timber value: mature hardwood stands (oak, cherry, walnut) add value.
- Cell/internet service can be poor in many hollows; Starlink is increasingly
  available but note if location is highly remote.
- Hardy County has more agricultural flat ground (Moorefield/Baker corridor).
  Hampshire County has diverse terrain with river-bottom farms and mountain tracts.
  Mineral County has more developed infrastructure near Keyser/Piedmont.
- Hunting/recreational use is common; check for posted boundaries, hunting leases.

When given a Zillow alert email, extract and analyze every listing.

For each parcel, produce a concise summary with:

1. **Address / Location & County** – location description, identify county
2. **Price & Acreage** – listing price and total acreage
3. **Price Per Acre** – calculate; note if above/below regional norms
4. **Zoning / Use** – residential, agricultural, timber, unzoned (most WV rural
   land is unzoned), etc.
5. **Topography** – flat bottomland, rolling, steep ridge, mix
6. **Water** – creek/river frontage, pond, spring, or none noted
7. **Utilities** – electric at road, well/septic present or needed, internet noted
8. **Access** – state-maintained road, private road, deeded ROW, gated
9. **Mineral Rights** – convey, severed, or not mentioned
10. **Highlights** – timber, views, cleared acreage, structures, barns, etc.
11. **Concerns** – flood zone, landlocked risk, steep-only access, very remote,
    HOA or deed restrictions, no perc data, severed minerals
12. **Verdict** – one sentence: is this worth a closer look? Why or why not?

After all individual listings, add a **Top Pick** section naming the best
opportunity in the batch with a one-paragraph justification that factors in
WV Potomac Highlands land market norms.

Keep the tone practical and buyer-focused. Do not invent data not present in the email.
```

---

## Zap Architecture Diagram

```
Zillow Alert Email (Hampshire / Hardy / Mineral Co., WV)
        │
        ▼
  Gmail Trigger
  (from: alerts@zillow.com)
        │
        ├──── Label: zillow-houses ────────────────────────────────────┐
        │                                                              │
        │                                                              ▼
        │                                                  Filter: exclude "land"
        │                                                              │
        │                                                              ▼
        │                                          OpenAI: WV Houses Prompt
        │                                          (Hampshire/Hardy/Mineral context)
        │                                                              │
        │                                                              ▼
        │                                          Gmail: [WV House Alert] Summary
        │
        └──── Label: zillow-land ──────────────────────────────────────┐
                                                                       │
                                                                       ▼
                                                           Filter: confirm "land"
                                                                       │
                                                                       ▼
                                                      OpenAI: WV Land Prompt
                                                      (Hampshire/Hardy/Mineral context)
                                                                       │
                                                                       ▼
                                                      Gmail: [WV Land Alert] Summary
```

---

## Tips & Troubleshooting

| Issue | Fix |
|-------|-----|
| Zap triggers on non-Zillow emails | Add `From Contains zillow.com` filter step or tighten Gmail label filter |
| ChatGPT returns "no listings found" | Zillow may send HTML-only emails; switch trigger field to `Email Body HTML` and instruct GPT to parse HTML |
| Token limit exceeded | Add a **Formatter by Zapier** step to truncate `{{Email Body Plain}}` to 8,000 characters before passing to OpenAI |
| Duplicate alerts | Add a **Storage by Zapier** step to track processed email IDs and skip duplicates |
| Listings from outside WV counties slip through | Add a Filter step checking that email body contains "WV" or county names |
| Price range not honored by Zillow | Add a Filter step using **Formatter** to extract prices from the email body and confirm they fall within range |
| No Zillow listings for land in these counties | Also set up alerts on **Lands of America / Land.com** and **LandWatch** — they have more rural WV inventory than Zillow |

---

## Supplemental: Other Listing Sources for Rural WV Land

Zillow's rural land inventory in WV can be sparse. Consider also setting up
Zapier email triggers (same prompts) for alerts from:

| Site | Notes |
|------|-------|
| [LandWatch.com](https://www.landwatch.com) | Strong WV rural/farm/hunting land inventory |
| [Land.com / Lands of America](https://www.land.com) | Large rural land marketplace |
| [Realtor.com](https://www.realtor.com) | MLS-fed; good for houses, some land |
| [United Country Real Estate](https://www.unitedcountry.com) | Specializes in rural/recreational WV properties |
| Local WV MLS via agent auto-email | Most complete source; ask a local agent to set up auto-email alerts |

---

## File Reference

```
zapier_zillow_property_alerts.md   ← this file (setup guide + WV-specific prompts)
```
