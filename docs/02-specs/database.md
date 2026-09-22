# Database Schema (Supabase Postgres)

All tables have created_at and updated_at timestamptz unless noted. Organisation scoped tables carry org_id for RLS.

Source: MaxBid Project Workbook, tab 13 Database.

| Table | Purpose | Column | Type | Nullable | Keys | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| organisations | Tenant. Everything belongs to an organisation. | id | uuid | No | PK | Default gen_random_uuid() |
| organisations |  | name | text | No |  |  |
| organisations |  | plan | text | No |  | free, starter, pro, dealer, internal |
| organisations |  | stripe_customer_id | text | Yes |  | Phase 2 |
| organisations |  | gst_registered | boolean | No |  | Organisation level default |
| organisations |  | base_address | text | Yes |  | Used for transport estimates |
| organisations |  | base_lat | numeric | Yes |  |  |
| organisations |  | base_lng | numeric | Yes |  |  |
| profiles | One row per auth user. | id | uuid | No | PK, FK auth.users |  |
| profiles |  | full_name | text | Yes |  |  |
| profiles |  | default_org_id | uuid | Yes | FK organisations |  |
| profiles |  | alert_lead_minutes | integer | No |  | Default 30 |
| organisation_members | Membership and role. | org_id | uuid | No | PK, FK organisations |  |
| organisation_members |  | user_id | uuid | No | PK, FK profiles |  |
| organisation_members |  | role | text | No |  | owner, admin, buyer, viewer |
| cost_profiles | Saved default cost assumptions. | id | uuid | No | PK |  |
| cost_profiles |  | org_id | uuid | No | FK organisations |  |
| cost_profiles |  | name | text | No |  | For example Machinery |
| cost_profiles |  | is_default | boolean | No |  |  |
| cost_profiles |  | profit_mode | text | No |  | dollars or percent |
| cost_profiles |  | target_profit_amount | numeric(12,2) | Yes |  |  |
| cost_profiles |  | target_return_pct | numeric(6,4) | Yes |  |  |
| cost_profiles |  | min_profit_amount | numeric(12,2) | Yes |  |  |
| cost_profiles |  | min_return_pct | numeric(6,4) | Yes |  |  |
| cost_profiles |  | transport_base_fee | numeric(12,2) | Yes |  |  |
| cost_profiles |  | transport_rate_per_km | numeric(8,2) | Yes |  |  |
| cost_profiles |  | repair_mode | text | No |  | dollars or percent_of_resale |
| cost_profiles |  | repair_value | numeric(12,4) | Yes |  |  |
| cost_profiles |  | defaults | jsonb | No |  | Other line item defaults keyed by cost field |
| categories | Category tree and category specific rules. | id | uuid | No | PK |  |
| categories |  | parent_id | uuid | Yes | FK categories |  |
| categories |  | name | text | No |  |  |
| categories |  | asking_discount_pct | numeric(6,4) | No |  | Default 0.10 |
| categories |  | valuation_rules | jsonb | No |  | Category specific rules added progressively |
| auction_platforms | Supported auction houses. | id | uuid | No | PK |  |
| auction_platforms |  | slug | text | No | Unique | grays, pickles, lloyds, pdf |
| auction_platforms |  | name | text | No |  |  |
| auction_platforms |  | url_patterns | text[] | No |  | For platform detection |
| auction_platforms |  | default_premium_pct | numeric(6,4) | Yes |  | Fallback only |
| auction_platforms |  | default_premium_gst | boolean | No |  |  |
| auction_platforms |  | extractor_version | text | No |  |  |
| auction_platforms |  | is_active | boolean | No |  |  |
| auctions | One auction event. Shared across organisations to avoid duplicate extraction. | id | uuid | No | PK |  |
| auctions |  | platform_id | uuid | No | FK auction_platforms |  |
| auctions |  | source_url | text | Yes | Unique with platform | Null for PDF uploads |
| auctions |  | title | text | Yes |  |  |
| auctions |  | closes_at | timestamptz | Yes |  |  |
| auctions |  | location_text | text | Yes |  |  |
| auctions |  | premium_pct | numeric(6,4) | Yes |  | Extracted from terms |
| auctions |  | premium_gst | boolean | Yes |  |  |
| auctions |  | premium_source | text | No |  | extracted, platform_default, user |
| auctions |  | raw_terms | text | Yes |  |  |
| auctions |  | extracted_at | timestamptz | Yes |  |  |
| analyses | An organisation's analysis of an auction. | id | uuid | No | PK |  |
| analyses |  | org_id | uuid | No | FK organisations |  |
| analyses |  | auction_id | uuid | No | FK auctions |  |
| analyses |  | created_by | uuid | No | FK profiles |  |
| analyses |  | cost_profile_id | uuid | No | FK cost_profiles |  |
| analyses |  | source_type | text | No |  | url or pdf |
| analyses |  | pdf_path | text | Yes |  | Supabase Storage path |
| analyses |  | status | text | No |  | queued, extracting, triaging, triaged, deep_running, complete, failed |
| analyses |  | progress_pct | integer | No |  |  |
| analyses |  | premium_override_pct | numeric(6,4) | Yes |  | User edit |
| lots | Lots within an auction. Shared, not organisation scoped. | id | uuid | No | PK |  |
| lots |  | auction_id | uuid | No | FK auctions |  |
| lots |  | lot_number | text | No | Unique with auction |  |
| lots |  | title | text | No |  |  |
| lots |  | description | text | Yes |  |  |
| lots |  | source_url | text | Yes |  |  |
| lots |  | location_text | text | Yes |  |  |
| lots |  | lat | numeric | Yes |  |  |
| lots |  | lng | numeric | Yes |  |  |
| lots |  | closes_at | timestamptz | Yes |  |  |
| lots |  | current_bid | numeric(12,2) | Yes |  | Updated on refresh |
| lots |  | gst_on_hammer | boolean | Yes |  |  |
| lots |  | raw | jsonb | No |  | Original extracted payload |
| lot_images | Image references for vision. Not displayed to other users as comparables. | id | uuid | No | PK |  |
| lot_images |  | lot_id | uuid | No | FK lots |  |
| lot_images |  | url | text | No |  |  |
| lot_images |  | position | integer | No |  |  |
| products | Canonical product catalogue built over time. | id | uuid | No | PK |  |
| products |  | category_id | uuid | Yes | FK categories |  |
| products |  | brand | text | Yes |  |  |
| products |  | model | text | Yes |  |  |
| products |  | variant | text | Yes |  |  |
| products |  | specs | jsonb | No |  |  |
| products |  | new_price | numeric(12,2) | Yes |  |  |
| products |  | new_price_source_url | text | Yes |  |  |
| products |  | new_price_checked_at | timestamptz | Yes |  |  |
| products |  | embedding | vector(1536) | Yes |  | pgvector for similarity matching |
| product_aliases | Alternative names and model codes. | id | uuid | No | PK |  |
| product_aliases |  | product_id | uuid | No | FK products |  |
| product_aliases |  | alias | text | No |  |  |
| lot_identifications | Versioned identification of a lot for an analysis. | id | uuid | No | PK |  |
| lot_identifications |  | analysis_id | uuid | No | FK analyses |  |
| lot_identifications |  | lot_id | uuid | No | FK lots |  |
| lot_identifications |  | stage | text | No |  | triage, deep, user |
| lot_identifications |  | product_id | uuid | Yes | FK products |  |
| lot_identifications |  | category_id | uuid | Yes | FK categories |  |
| lot_identifications |  | brand | text | Yes |  |  |
| lot_identifications |  | model | text | Yes |  |  |
| lot_identifications |  | year | integer | Yes |  |  |
| lot_identifications |  | specs | jsonb | No |  |  |
| lot_identifications |  | condition_notes | text | Yes |  |  |
| lot_identifications |  | confidence | numeric(5,2) | No |  | 0 to 100 |
| lot_identifications |  | is_current | boolean | No |  |  |
| lot_identifications |  | confirmed_by | uuid | Yes | FK profiles | Set when user confirms |
| lot_identifications |  | ai_run_id | uuid | Yes | FK ai_runs |  |
| analysis_lots | Per organisation state of each lot in an analysis. | id | uuid | No | PK |  |
| analysis_lots |  | analysis_id | uuid | No | FK analyses |  |
| analysis_lots |  | lot_id | uuid | No | FK lots |  |
| analysis_lots |  | status | text | No |  | triaged, shortlisted, deep_running, valued, failed |
| analysis_lots |  | triage_low | numeric(12,2) | Yes |  |  |
| analysis_lots |  | triage_high | numeric(12,2) | Yes |  |  |
| analysis_lots |  | triage_max_bid | numeric(12,2) | Yes |  |  |
| analysis_lots |  | opportunity_score | integer | Yes |  | 0 to 100 |
| analysis_lots |  | is_watchlisted | boolean | No |  |  |
| comparables | Every comparable listing ever seen. Shared evidence library. | id | uuid | No | PK |  |
| comparables |  | source_type | text | No |  | auction_result, marketplace_sold, advertised_used, new_retail, outcome, user_supplied |
| comparables |  | org_id | uuid | Yes | FK organisations | Null for shared evidence. Set for private user supplied comparables |
| comparables |  | provenance | text | No |  | verified, extracted, estimated, user_input |
| comparables |  | source_name | text | No |  | For example eBay |
| comparables |  | url | text | Yes | Unique |  |
| comparables |  | title | text | No |  |  |
| comparables |  | summary | text | Yes |  | Our text summary. No copied images. |
| comparables |  | product_id | uuid | Yes | FK products |  |
| comparables |  | condition | text | Yes |  | new, used, unknown |
| comparables |  | year | integer | Yes |  |  |
| comparables |  | location_text | text | Yes |  |  |
| comparables |  | features | jsonb | No |  |  |
| comparables |  | first_seen_at | timestamptz | No |  |  |
| comparable_snapshots | Price history per comparable. Builds the historical database. | id | uuid | No | PK |  |
| comparable_snapshots |  | comparable_id | uuid | No | FK comparables |  |
| comparable_snapshots |  | price | numeric(12,2) | No |  |  |
| comparable_snapshots |  | price_includes_gst | boolean | Yes |  |  |
| comparable_snapshots |  | status | text | No |  | active, sold, ended |
| comparable_snapshots |  | checked_at | timestamptz | No |  | Seven day cache key |
| lot_comparables | Match between a lot identification and a comparable. | id | uuid | No | PK |  |
| lot_comparables |  | identification_id | uuid | No | FK lot_identifications |  |
| lot_comparables |  | comparable_id | uuid | No | FK comparables |  |
| lot_comparables |  | snapshot_id | uuid | No | FK comparable_snapshots | Price used |
| lot_comparables |  | match_level | text | No |  | exact, near_exact, higher_spec, lower_spec, similar_alternative, insufficient |
| lot_comparables |  | reason | text | No |  | Plain English explanation |
| lot_comparables |  | differences | jsonb | No |  |  |
| lot_comparables |  | adjustment_pct | numeric(6,4) | No |  |  |
| lot_comparables |  | adjusted_price | numeric(12,2) | No |  |  |
| lot_comparables |  | weight | numeric(6,4) | No |  | Combined weight |
| lot_comparables |  | excluded_by_user | boolean | No |  | User can exclude a comparable |
| lot_comparables |  | exclusion_reason | text | Yes |  | Required when excluded |
| lot_comparables |  | excluded_by | uuid | Yes | FK profiles |  |
| valuations | Versioned valuation per lot per analysis. | id | uuid | No | PK |  |
| valuations |  | analysis_lot_id | uuid | No | FK analysis_lots |  |
| valuations |  | identification_id | uuid | No | FK lot_identifications |  |
| valuations |  | conservative | numeric(12,2) | Yes |  |  |
| valuations |  | expected | numeric(12,2) | Yes |  |  |
| valuations |  | optimistic | numeric(12,2) | Yes |  |  |
| valuations |  | new_price | numeric(12,2) | Yes |  |  |
| valuations |  | cheapest_comparable_id | uuid | Yes | FK lot_comparables |  |
| valuations |  | confidence_score | integer | No |  |  |
| valuations |  | confidence_label | text | No |  | high, medium, low, insufficient |
| valuations |  | method_version | text | No | FK method_versions | Method version used. Old versions stay viewable |
| valuations |  | is_current | boolean | No |  |  |
| lot_costs | User cost inputs and chosen settings per lot. | analysis_lot_id | uuid | No | PK, FK analysis_lots |  |
| lot_costs |  | resale_scenario | text | No |  | conservative, expected, optimistic |
| lot_costs |  | resale_override | numeric(12,2) | Yes |  |  |
| lot_costs |  | premium_pct | numeric(6,4) | Yes |  | Overrides auction value |
| lot_costs |  | transport | numeric(12,2) | Yes |  |  |
| lot_costs |  | transport_km | numeric(8,1) | Yes |  |  |
| lot_costs |  | line_items | jsonb | No |  | Removal, repairs, parts, testing, cleaning, storage, selling fees, other |
| lot_costs |  | profit_mode | text | No |  |  |
| lot_costs |  | target_value | numeric(12,4) | No |  |  |
| lot_costs |  | min_value | numeric(12,4) | No |  |  |
| lot_costs |  | proposed_bid | numeric(12,2) | Yes |  | Slider position |
| outcomes | What actually happened. | id | uuid | No | PK |  |
| outcomes |  | analysis_lot_id | uuid | No | FK analysis_lots |  |
| outcomes |  | result | text | No |  | won, lost, not_bid, passed_in |
| outcomes |  | hammer_price | numeric(12,2) | Yes |  |  |
| outcomes |  | actual_costs | numeric(12,2) | Yes |  |  |
| outcomes |  | resale_price | numeric(12,2) | Yes |  |  |
| outcomes |  | resale_channel | text | Yes |  |  |
| outcomes |  | sold_at | date | Yes |  |  |
| outcomes |  | share_anonymised | boolean | No |  | Consent to pooled use. Later phase. |
| notifications | Emails and push alerts. | id | uuid | No | PK |  |
| notifications |  | org_id | uuid | No | FK organisations |  |
| notifications |  | user_id | uuid | No | FK profiles |  |
| notifications |  | type | text | No |  | triage_ready, deep_ready, closing_soon |
| notifications |  | payload | jsonb | No |  |  |
| notifications |  | sent_at | timestamptz | Yes |  |  |
| exports | Generated bid sheets and CSVs. | id | uuid | No | PK |  |
| exports |  | analysis_id | uuid | No | FK analyses |  |
| exports |  | type | text | No |  | pdf_bid_sheet, csv |
| exports |  | storage_path | text | No |  |  |
| credit_ledger | Append only credit movements. | id | uuid | No | PK |  |
| credit_ledger |  | org_id | uuid | No | FK organisations |  |
| credit_ledger |  | delta | integer | No |  | Positive grant, negative use |
| credit_ledger |  | reason | text | No |  | plan_grant, top_up, reserve, settle, refund |
| credit_ledger |  | reference_id | uuid | Yes |  | Analysis or payment |
| ai_runs | Every AI call for audit and cost. | id | uuid | No | PK |  |
| ai_runs |  | model | text | No |  |  |
| ai_runs |  | prompt_version | text | No |  |  |
| ai_runs |  | input_tokens | integer | No |  |  |
| ai_runs |  | output_tokens | integer | No |  |  |
| ai_runs |  | cost_usd | numeric(10,5) | No |  |  |
| ai_runs |  | stage | text | No |  | Pipeline stage ID |
| usage_events | Non AI costs such as search, extraction and routing calls. | id | uuid | No | PK |  |
| usage_events |  | org_id | uuid | Yes | FK organisations |  |
| usage_events |  | analysis_id | uuid | Yes | FK analyses |  |
| usage_events |  | provider | text | No |  |  |
| usage_events |  | units | numeric | No |  |  |
| usage_events |  | cost_usd | numeric(10,5) | No |  |  |
| audit_log | Changes to identifications, costs and settings. | id | bigint | No | PK identity |  |
| audit_log |  | org_id | uuid | Yes |  |  |
| audit_log |  | user_id | uuid | Yes |  |  |
| audit_log |  | entity | text | No |  |  |
| audit_log |  | entity_id | uuid | No |  |  |
| audit_log |  | change | jsonb | No |  |  |
| lot_spec_fields | Enriched specification fields per lot identification. | id | uuid | No | PK |  |
| lot_spec_fields |  | identification_id | uuid | No | FK lot_identifications |  |
| lot_spec_fields |  | field | text | No |  | For example max_panel_thickness, pre_milling |
| lot_spec_fields |  | label | text | No |  | Display label |
| lot_spec_fields |  | value | text | Yes |  |  |
| lot_spec_fields |  | unit | text | Yes |  |  |
| lot_spec_fields |  | source_class | text | No |  | model_spec, observed, auctioneer_stated, user_input, not_verified |
| lot_spec_fields |  | provenance | text | No |  | verified, extracted, estimated, user_input |
| lot_spec_fields |  | is_ai_generated | boolean | No |  |  |
| lot_spec_fields |  | source_url | text | Yes |  |  |
| lot_spec_fields |  | checked_at | timestamptz | Yes |  |  |
| lot_spec_fields |  | is_option | boolean | No |  | True for optional equipment |
| lot_spec_fields |  | option_status | text | Yes |  | observed, stated, absent, not_verified |
| lot_spec_fields |  | conflict_group | uuid | Yes |  | Shared by fields that disagree |
| product_spec_sources | Shared model specifications with their sources. | id | uuid | No | PK |  |
| product_spec_sources |  | product_id | uuid | No | FK products |  |
| product_spec_sources |  | field | text | No |  |  |
| product_spec_sources |  | value | text | No |  |  |
| product_spec_sources |  | source_type | text | No |  | manufacturer, dealer, spec_database, manual |
| product_spec_sources |  | source_url | text | Yes |  |  |
| product_spec_sources |  | checked_at | timestamptz | No |  |  |
| waitlist_signups | Pre launch waitlist. | id | uuid | No | PK |  |
| waitlist_signups |  | email | citext | No | Unique |  |
| waitlist_signups |  | source | text | Yes |  | Page or campaign |
| waitlist_signups |  | utm | jsonb | Yes |  |  |
| waitlist_signups |  | founding_eligible | boolean | No |  |  |
| waitlist_signups |  | converted_org_id | uuid | Yes | FK organisations |  |
| referrals | Referral codes and rewards. | id | uuid | No | PK |  |
| referrals |  | referrer_org_id | uuid | No | FK organisations |  |
| referrals |  | code | text | No | Unique |  |
| referrals |  | referred_org_id | uuid | Yes | FK organisations |  |
| referrals |  | status | text | No |  | pending, qualified, rewarded |
| value_guides | Public programmatic price guide pages. | id | uuid | No | PK |  |
| value_guides |  | product_id | uuid | No | FK products |  |
| value_guides |  | slug | text | No | Unique |  |
| value_guides |  | data_snapshot | jsonb | No |  | Aggregated figures shown on the page |
| value_guides |  | evidence_count | integer | No |  |  |
| value_guides |  | is_indexable | boolean | No |  | True only when threshold on tab 35 is met |
| value_guides |  | last_built_at | timestamptz | No |  |  |
| value_guides |  | method_version | text | No | FK method_versions |  |
| auction_breakdowns | Weekly public Auction Breakdown pages. | id | uuid | No | PK |  |
| auction_breakdowns |  | auction_id | uuid | No | FK auctions |  |
| auction_breakdowns |  | slug | text | No | Unique |  |
| auction_breakdowns |  | headline | text | No |  |  |
| auction_breakdowns |  | summary | text | No |  |  |
| auction_breakdowns |  | featured_lots | jsonb | No |  | Lot refs, estimates, confidence, links. No copied photos |
| auction_breakdowns |  | published_at | timestamptz | Yes |  |  |
| public_demo_sessions | Anonymous try before sign up usage for rate limiting. | id | uuid | No | PK |  |
| public_demo_sessions |  | ip_hash | text | No |  | Hashed, never raw |
| public_demo_sessions |  | auction_id | uuid | Yes | FK auctions |  |
| public_demo_sessions |  | converted | boolean | No |  |  |
| method_versions | Valuation method releases. | version | text | No | PK | For example 1.2.0 |
| method_versions |  | released_at | timestamptz | No |  |  |
| method_versions |  | summary | text | No |  | Plain English summary for the public changelog |
| method_versions |  | changes | jsonb | No |  | Weights, thresholds and rules changed |
| method_versions |  | is_current | boolean | No |  |  |
| platform_settings | Admin editable platform defaults. | key | text | No | PK | For example premium_fallback.grays |
| platform_settings |  | value | jsonb | No |  |  |
| platform_settings |  | description | text | No |  |  |
| platform_settings |  | updated_by | uuid | No | FK profiles |  |
| platform_setting_changes | Change log for platform settings. | id | bigint | No | PK identity |  |
| platform_setting_changes |  | key | text | No | FK platform_settings |  |
| platform_setting_changes |  | old_value | jsonb | Yes |  |  |
| platform_setting_changes |  | new_value | jsonb | No |  |  |
| platform_setting_changes |  | reason | text | No |  | Required |
| platform_setting_changes |  | changed_by | uuid | No | FK profiles |  |
| org_settings | Organisation defaults and locks. | org_id | uuid | No | PK, FK organisations |  |
| org_settings |  | key | text | No | PK | Setting key from tab 27 |
| org_settings |  | value | jsonb | No |  |  |
| org_settings |  | lock_type | text | No |  | none, fixed, floor |
| org_settings |  | updated_by | uuid | No | FK profiles |  |
| user_preferences | Personal overrides and interface preferences. | user_id | uuid | No | PK, FK profiles |  |
| user_preferences |  | org_id | uuid | No | PK, FK organisations |  |
| user_preferences |  | key | text | No | PK |  |
| user_preferences |  | value | jsonb | No |  | Rejected server side if it breaches an org lock |
| lot_overrides | Every lot level change from a system value. Drives markers and the override summary. | id | uuid | No | PK |  |
| lot_overrides |  | analysis_lot_id | uuid | No | FK analysis_lots |  |
| lot_overrides |  | field | text | No |  | For example resale, premium_pct, transport |
| lot_overrides |  | system_value | jsonb | Yes |  | Value at time of override |
| lot_overrides |  | user_value | jsonb | Yes |  | Null when reset |
| lot_overrides |  | reason | text | Yes |  |  |
| lot_overrides |  | changed_by | uuid | No | FK profiles |  |
| lot_overrides |  | is_active | boolean | No |  | False after reset |
| correction_reviews | Proposed changes to shared data awaiting admin review. | id | uuid | No | PK |  |
| correction_reviews |  | org_id | uuid | No | FK organisations | Submitting organisation. Hidden from others |
| correction_reviews |  | entity | text | No |  | product, comparable, auction, lot |
| correction_reviews |  | entity_id | uuid | No |  |  |
| correction_reviews |  | proposed_change | jsonb | No |  |  |
| correction_reviews |  | evidence | text | Yes |  | Link or note supporting the change |
| correction_reviews |  | status | text | No |  | pending, approved, rejected |
| correction_reviews |  | reviewed_by | uuid | Yes | FK profiles |  |
| correction_reviews |  | resolution_note | text | Yes |  |  |
| problem_reports | Report a problem submissions. | id | uuid | No | PK |  |
| problem_reports |  | org_id | uuid | No | FK organisations |  |
| problem_reports |  | user_id | uuid | No | FK profiles |  |
| problem_reports |  | entity | text | No |  | lot, identification, comparable, valuation |
| problem_reports |  | entity_id | uuid | No |  |  |
| problem_reports |  | category | text | No |  | wrong_item, wrong_price, broken_link, wrong_premium, other |
| problem_reports |  | description | text | No |  |  |
| problem_reports |  | status | text | No |  | open, in_review, resolved, closed |
| problem_reports |  | correction_review_id | uuid | Yes | FK correction_reviews | When it leads to a shared data change |
| terms_versions | Versioned terms and core disclaimer. | version | text | No | PK |  |
| terms_versions |  | published_at | timestamptz | No |  |  |
| terms_versions |  | is_material | boolean | No |  | True forces re acceptance |
| terms_versions |  | content_url | text | No |  |  |
| terms_acceptances | Clickwrap acceptance records. | user_id | uuid | No | PK, FK profiles |  |
| terms_acceptances |  | version | text | No | PK, FK terms_versions |  |
| terms_acceptances |  | accepted_at | timestamptz | No |  |  |
| terms_acceptances |  | ip_address | inet | Yes |  |  |
| accuracy_stats | Measured accuracy by category for publishing. | category_id | uuid | No | PK, FK categories |  |
| accuracy_stats |  | period | text | No | PK | For example 2026 Q4 |
| accuracy_stats |  | outcome_count | integer | No |  |  |
| accuracy_stats |  | within_15_pct | numeric(5,4) | Yes |  |  |
| accuracy_stats |  | conservative_hit_rate | numeric(5,4) | Yes |  |  |
| accuracy_stats |  | method_version | text | No | FK method_versions |  |
| accuracy_stats |  | is_published | boolean | No |  | True only when outcome_count meets the minimum |
