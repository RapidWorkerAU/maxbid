# Security and Row Level Security

Source: MaxBid Project Workbook, tab 14 Security.

| Area | Applies to | Rule |
| --- | --- | --- |
| Organisation scoped tables | analyses, analysis_lots, lot_identifications, valuations, lot_costs, outcomes, cost_profiles, notifications, exports, credit_ledger | Select, insert and update allowed where org_id is in the user's memberships. Helper function is_org_member(org_id). |
| Shared tables | auctions, lots, lot_images, products, product_aliases, comparables, comparable_snapshots, categories, auction_platforms | Read for any signed in user. Write only by the service role through background jobs. |
| Match table | lot_comparables | Readable when the linked identification belongs to the user's organisation. Written by service role. Users may update excluded_by_user only. |
| Roles | owner, admin, buyer, viewer | Viewer read only. Buyer can edit costs, confirm identifications and spend credits. Admin manages members and profiles. Owner manages billing. |
| Credits | credit_ledger | Insert only through a security definer function that checks balance atomically. No direct client writes. |
| Service role | Inngest or Trigger.dev functions | Service key held only in server environment variables. Never sent to the browser. |
| Storage | PDF uploads and exports buckets | Private buckets. Paths prefixed by org_id. Signed URLs with short expiry. |
| Secrets | API keys for Claude, search, extraction, routing, Stripe | Stored in Vercel and job runner environments. Rotated on staff change. |
| Privacy | Outcomes and user data | Pooled use of outcomes only with explicit consent flag. Privacy policy aligned to the Australian Privacy Principles. |
| Abuse controls | Submission endpoints | Rate limit per organisation. Maximum lots per catalogue per tier. Bot protection on sign up. |
| Platform settings | platform_settings, platform_setting_changes, method_versions | Read for signed in users. Write only by platform admins, with the change log written in the same transaction. |
| Organisation settings and locks | org_settings, user_preferences, lot_overrides | Owners and admins write org_settings. Lock rules enforced by a database function on every write to user_preferences, lot_costs and lot_overrides, not only in the interface. |
| Private comparables | comparables where org_id is set | Readable and writable only by members of that organisation. Never used in other organisations' valuations. |
| Correction reviews | correction_reviews | Members insert for their organisation and read their own submissions. Only platform admins approve. Submitting organisation never revealed to others. |
| Terms | terms_acceptances | Insert own acceptance only. Middleware blocks app access when a material version is unaccepted. |
