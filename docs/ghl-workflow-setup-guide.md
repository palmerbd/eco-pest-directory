# GHL Phase 2 — Email Drip Setup Guide
## Workflow #1: BDD - Claim → Claimed Stage

---

### Overview

Add the following actions **after** the existing "Create Or Update Opportunity" step in Workflow #1.
The sequence sends 4 emails over 14 days, nudging claimed studio owners to upgrade to Featured ($199/mo).

**Current workflow state:**
```
Inbound Webhook → Create Contact → Create Or Update Opportunity → END
```

**Target workflow state:**
```
Inbound Webhook
 → Create Contact
 → Create Or Update Opportunity
 → [Email 1: Welcome]            ← send immediately
 → Wait 2 days
 → [Email 2: Social Proof]       ← Day 3
 → Wait 4 days
 → [Email 3: Pricing + CTA]      ← Day 7
 → Wait 7 days
 → [Email 4: Last Chance]        ← Day 14
 → END
```

---

### Step 1: Set Up Custom Contact Fields

Before adding the emails, ensure these custom fields exist on the Contact record (so merge tags work in email).
GHL Menu: **Settings → Custom Fields → Contacts**

| Field Label   | Field Key         | Type   | Notes                                    |
|---------------|-------------------|--------|------------------------------------------|
| Studio Name   | `studio_name`     | Text   | Populated by the Inbound Webhook         |
| Listing URL   | `listing_url`     | Text   | Full URL to the studio detail page       |

If they don't exist, create them. Then update the **Create Contact** action in Workflow #1 to map:
- `{{inboundWebhookRequest.studio_name}}` → Studio Name field
- `{{inboundWebhookRequest.listing_url}}` → Listing URL field

---

### Step 2: Add Workflow Goal (Exit Condition)

This makes GHL stop the drip the moment a studio owner upgrades to Featured.

1. In Workflow #1, click **Settings** tab
2. Find **Workflow Goal** or **Goal Event**
3. Add goal: **Contact tag contains `BDD-Featured`**
   (This tag gets added by Workflow #2 when Stripe payment confirms)
4. Set: Exit contact from workflow when goal is met ✓

---

### Step 3: Add the 8 New Actions

Click the **+** button after "Create Or Update Opportunity" and add each action in order:

---

#### Action 1 — Send Email (Day 1 Welcome)
- Action type: **Send Email**
- From: `leads@ballroomdancedirectory.com` — Ballroom Dance Directory
- To: `{{contact.email}}`
- Subject: `Your listing claim is confirmed, {{contact.first_name}}`
- Body: Paste HTML from `ghl-email-1-welcome.html`
  - In GHL email builder → click **Code** icon → paste the full HTML

---

#### Action 2 — Wait
- Action type: **Wait**
- Duration: **2 days**
- Wait type: Event-based (wait from when contact enters this step)

---

#### Action 3 — Send Email (Day 3 Social Proof)
- Action type: **Send Email**
- From: `leads@ballroomdancedirectory.com` — Ballroom Dance Directory
- To: `{{contact.email}}`
- Subject: `4,000+ studios. One destination for serious dancers.`
- Body: Paste HTML from `ghl-email-2-social-proof.html`

---

#### Action 4 — Wait
- Action type: **Wait**
- Duration: **4 days**

---

#### Action 5 — Send Email (Day 7 Pricing)
- Action type: **Send Email**
- From: `leads@ballroomdancedirectory.com` — Ballroom Dance Directory
- To: `{{contact.email}}`
- Subject: `What $199/month gets {{contact.first_name}}'s studio`
- Body: Paste HTML from `ghl-email-3-pricing.html`

---

#### Action 6 — Wait
- Action type: **Wait**
- Duration: **7 days**

---

#### Action 7 — Send Email (Day 14 Last Chance)
- Action type: **Send Email**
- From: `leads@ballroomdancedirectory.com` — Ballroom Dance Directory
- To: `{{contact.email}}`
- Subject: `Last call, {{contact.first_name}} — your Featured spot is still open`
- Body: Paste HTML from `ghl-email-4-last-chance.html`

---

### Step 4: Publish

Click **Publish** (top right of workflow builder) to make the workflow active.

---

### Merge Tag Reference

| Merge Tag                     | What it outputs              |
|-------------------------------|------------------------------|
| `{{contact.first_name}}`      | Studio owner's first name    |
| `{{contact.email}}`           | Studio owner's email         |
| `{{contact.studio_name}}`     | Studio name (custom field)   |
| `{{contact.listing_url}}`     | Full URL to their page       |

**Note:** If Studio Name/URL custom fields aren't mapping from the webhook, temporarily use hardcoded test values while building, then fix the Create Contact field mapping before publishing.

---

### Phase 2.2 — Workflow #2: BDD - Stripe → Featured

After Stripe checkout confirms, Workflow #2 should:

1. **Add Tag**: `BDD-Featured` (this triggers the Workflow #1 goal exit)
2. **Send Email**: Featured Onboarding email
   - Subject: `You're Featured! Here's how to make the most of it, {{contact.first_name}}`
   - Content: Confirm payment received, explain what's live now, set expectations for next steps

---

### Phase 2.3 — Workflow #3: BDD - Cancellation Save

Create a new workflow triggered by inbound webhook (URL to be provided after creation):

**Trigger:** Inbound Webhook (POST from `customer.subscription.deleted` Stripe event)

**Actions:**
1. **Remove Tag**: `BDD-Featured`
2. **Send Email** (Day 0 Save):
   - Subject: `We noticed you cancelled, {{contact.first_name}} — before you go`
   - Content: Acknowledge cancellation, offer to help, light winback pitch
3. **Wait**: 7 days
4. **Send Email** (Day 7 Winback):
   - Subject: `Your studio listing is still live. Upgrade again anytime.`
   - Content: Softer touch — they're still in the directory, door is open

---

### Files in this folder

| File                              | What it is                              |
|-----------------------------------|-----------------------------------------|
| `ghl-email-1-welcome.html`        | Day 1 welcome email HTML                |
| `ghl-email-2-social-proof.html`   | Day 3 social proof email HTML           |
| `ghl-email-3-pricing.html`        | Day 7 pricing + features email HTML     |
| `ghl-email-4-last-chance.html`    | Day 14 last-chance urgency email HTML   |
| `ghl-workflow-setup-guide.md`     | This file                               |
