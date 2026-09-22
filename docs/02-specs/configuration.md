# Configuration and Transparency Principles

The rules every setting, screen and message must follow.

Source: MaxBid Project Workbook, tab 26 Config Principles.

| ID | Principle | What it means in practice |
| --- | --- | --- |
| CP01 | The platform is a helper | It advises. It never makes or blocks a bidding decision. The user may know more than the evidence, so the user can always enter their own figure and proceed. |
| CP02 | Block only to protect others | The platform blocks an action only when it would change data other users rely on, breach security or permissions, spend credits the organisation does not have, or alter the fixed method. Everything else is a warning. |
| CP03 | Private by default | Every user change applies to that lot in that organisation only. No user action changes what another organisation sees. |
| CP04 | Shared data is moderated | Corrections that would improve shared data go to an admin review queue. They apply to everyone only after approval. |
| CP05 | The method is fixed and public | Bid maths, GST, evidence weights, match levels and confidence scoring are hard coded, versioned and explained to users. They change only through a released version with a public changelog. |
| CP06 | Defaults are editable, the method is not | Operational defaults such as premium fallbacks and asking discounts are admin settings with a change log. Organisations set their own commercial defaults. Nobody edits the method through settings. |
| CP07 | Every figure declares its source | Each number carries one provenance tag: Verified, Extracted, Estimated or Your input. AI generated content carries an additional AI label. |
| CP08 | Say what we do not know | Every lot lists the sources searched, what was not found and what the platform cannot verify. Absence of evidence is shown, never hidden. |
| CP09 | User figures are never presented as system figures | When a user overrides a value, the override is marked, the system value stays visible and system confidence is not applied to the user's figure. |
| CP10 | Nothing silently changes | Method updates, data refreshes and overrides are always visible. Past results stay reproducible under the method version that produced them. |
| CP11 | Plain factual language | Warnings and disclaimers state the risk and the reason in plain, neutral words. No legal padding in the interface, full terms one tap away. |
| CP12 | Disclaimers where the risk is | Short notes appear beside the figure they relate to, not as page banners. Every export carries the footer disclaimer, source tags and analysis date. |
| CP13 | Model data is not unit data | Specifications from a manufacturer describe the model, not the item at auction. They are never shown as confirmed for the lot unless observed in the photos or stated by the auctioneer. |


# Settings Matrix

Where each setting lives, who can change it and how far the change reaches. Lower layers override higher layers unless locked.

Source: MaxBid Project Workbook, tab 27 Settings Matrix.

| ID | Setting | Layer | Type | Who can change | Org lock | Default | Reach of change | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CS01 | Bid limit formulas | Platform | Hard coded | Code release | No | Tab 10 formulas | Everyone | Visible in How this was calculated |
| CS02 | Calculation order and rounding | Platform | Hard coded | Code release | No | Bid figures round down to whole dollars. Other figures round to the nearest dollar. Cents kept internally | Everyone | Decision record 0003 |
| CS03 | GST rate | Platform | Hard coded | Code release | No | 10 percent | Everyone | Legislative change handled by release |
| CS04 | Match level definitions | Platform | Hard coded | Code release | No | Tab 08 | Everyone | Published on methodology page |
| CS05 | Evidence type weights | Platform | Hard coded | Code release | No | Tab 08 | Everyone | Versioned |
| CS06 | Recency decay | Platform | Hard coded | Code release | No | Tab 08 | Everyone | Versioned |
| CS07 | Confidence formula and bands | Platform | Hard coded | Code release | No | Tab 08 | Everyone | Versioned |
| CS08 | Minimum evidence threshold | Platform | Hard coded | Code release | No | Three comparables and combined weight 1.5 | Everyone | Versioned |
| CS09 | Scenario percentiles | Platform | Hard coded | Code release | No | 25th, median, 75th | Everyone | Versioned |
| CS10 | User supplied comparable weight | Platform | Hard coded | Code release | No | 0.50 | Everyone | Versioned |
| CS11 | Provenance tag definitions | Platform | Hard coded | Code release | No | Tab 29 | Everyone |  |
| CS12 | Core disclaimer wording | Platform | Hard coded | Code release with terms version | No | Tab 30 | Everyone | Material change forces re acceptance |
| CS13 | Stale data threshold | Platform | Hard coded | Code release | No | 7 days | Everyone |  |
| CS14 | Price cache period | Platform | Hard coded | Code release | No | 7 days | Everyone |  |
| CS15 | Accuracy publishing minimum | Platform | Hard coded | Code release | No | 30 outcomes per category | Everyone |  |
| CS16 | Buyer's premium fallback per platform | Platform | Admin setting | Platform admin, logged | No | Per platform | New analyses | Used only when extraction fails |
| CS17 | GST on premium fallback per platform | Platform | Admin setting | Platform admin, logged | No | Yes | New analyses |  |
| CS18 | Asking to selling discount by category | Platform | Admin setting | Platform admin, logged | No | 10 percent | New valuations | Stamped on each valuation |
| CS19 | Category tree | Platform | Admin setting | Platform admin, logged | No |  | Everyone |  |
| CS20 | We cannot verify items by category | Platform | Admin setting | Platform admin, logged | No | Tab 29 | Everyone |  |
| CS21 | Extractor enabled per platform | Platform | Admin setting | Platform admin, logged | No | On | Everyone | Switch off a broken extractor without a deploy |
| CS22 | Tier limits and credit prices | Platform | Admin setting | Platform admin, logged | No | Tab 18 | Everyone | Phase 2 |
| CS23 | Feature flags | Platform | Admin setting | Platform admin, logged | No |  | Targeted |  |
| CS24 | GST registered | Organisation | Org setting | Owner or admin | Fixed | No | Organisation | Recalculates open lots |
| CS25 | Base location | Organisation | Org setting | Owner or admin | Fixed |  | Organisation | Users may set a personal base |
| CS26 | Cost profiles | Organisation | Org setting | Owner, admin or buyer | Fixed | One default profile | Organisation | Lock prevents members editing profiles |
| CS27 | Default cost profile | Organisation | Org setting | Owner or admin | Fixed |  | Organisation |  |
| CS28 | Default profit mode | Organisation | Org setting | Owner or admin | Fixed | Dollars | Organisation |  |
| CS29 | Default target profit | Organisation | Org setting | Owner or admin | Floor |  | Organisation | Floor means members can raise but not lower |
| CS30 | Minimum acceptable profit | Organisation | Org setting | Owner or admin | Floor |  | Organisation | Drives the limit bid |
| CS31 | Default resale scenario | Organisation | Org setting | Owner or admin | Fixed | Conservative | Organisation |  |
| CS32 | Transport rate per km and base fee | Organisation | Org setting | Owner or admin | Floor | In cost profile | Organisation |  |
| CS33 | Default alert lead time | Organisation | Org setting | Owner or admin | No | 30 minutes | Organisation |  |
| CS34 | Members and roles | Organisation | Org setting | Owner or admin | n/a |  | Organisation |  |
| CS35 | Personal target profit | User | User preference | The user | Subject to org lock | Inherits org | That user |  |
| CS36 | Personal default cost profile | User | User preference | The user | Subject to org lock | Inherits org | That user |  |
| CS37 | Personal base location | User | User preference | The user | Subject to org lock | Inherits org | That user |  |
| CS38 | Alert lead time | User | User preference | The user | No | Inherits org | That user |  |
| CS39 | Notification channels | User | User preference | The user | No | Email and push | That user |  |
| CS40 | Theme | User | User preference | The user | No | Light. Dark mode is not available in V1 | That user | Decision record 0001 |
| CS41 | Table density and columns | User | User preference | The user | No | Standard | That user |  |
| CS42 | Default triage filters | User | User preference | The user | No | None | That user |  |
| CS43 | Identification (brand, model, year, specs) | Lot | Lot input | Buyer or above | No | System identification | That lot in that org | Can also be submitted for shared review |
| CS44 | Resale scenario | Lot | Lot input | Buyer or above | Subject to org lock | Inherited | That lot in that org |  |
| CS45 | Resale price override | Lot | Lot input | Buyer or above | No | System scenario value | That lot in that org | Tagged Your input |
| CS46 | Buyer's premium rate | Lot | Lot input | Buyer or above | No | Extracted | That lot in that org | Wrong extraction can be reported for review |
| CS47 | GST on hammer and premium flags | Lot | Lot input | Buyer or above | No | Extracted | That lot in that org |  |
| CS48 | Cost line items | Lot | Lot input | Buyer or above | Floor where profile is locked | Cost profile | That lot in that org |  |
| CS49 | Transport amount | Lot | Lot input | Buyer or above | No | Distance estimate | That lot in that org |  |
| CS50 | Profit mode and target | Lot | Lot input | Buyer or above | Subject to org lock | Inherited | That lot in that org |  |
| CS51 | Proposed bid (slider) | Lot | Lot input | Buyer or above | No | Target bid | That lot in that org | Never locked. Warnings only. |
| CS52 | Exclude comparable | Lot | Lot input | Buyer or above | No | Included | That lot in that org | Reason required |
| CS53 | Add user comparable | Lot | Lot input | Buyer or above | No |  | That organisation | Private to organisation |
| CS54 | Watchlist | Lot | Lot input | Buyer or above | No | Off | That organisation |  |
| CS55 | Outcome | Lot | Lot input | Buyer or above | No |  | That organisation | Pooled use needs consent |


# Override Rules and Responses

Source: MaxBid Project Workbook, tab 28 Override Rules.

## Precedence

**Resolution order.** Lot value, then User preference, then Organisation setting, then Platform default. The first value found is used.

**Fixed lock.** The organisation value is used at every lower layer. Lower layers cannot save a different value.

**Floor lock.** Lower layers can set a value equal to or stricter than the organisation value but never less strict. For profit this means higher, never lower.

**Enforcement.** Locks are enforced by the database on every write, so the API and the interface behave the same.

**Locks and bidding.** Locks shape the calculated bid limits. They never stop a user moving the bid slider. A bid beyond a limit produces a warning, not a block.

**Hard coded items.** No layer can override them. They appear read only with a link to the methodology.

## Override display

**Marker.** Every overridden field shows a Your input tag and a small reset icon.

**System value.** The system value stays visible beside or beneath the override, never replaced.

**Reset.** One click restores the current system value. The reset is recorded in the lot history.

**Override summary.** Each lot has a Changes from system panel listing field, system value, your value, who changed it and when.

**Team visibility.** All organisation members see overrides and who made them.

**Confidence.** System confidence applies only to system values. When the resale price is overridden the confidence badge reads System confidence and the figure in use is tagged Your input.

## Situation responses

| Situation | Reason | Response | Behaviour | Message |
| --- | --- | --- | --- | --- |
| Proposed bid above target | Slider enters amber zone | Inform | Zone label changes to Below target. |  |
| Proposed bid above the limit bid | Profit falls below minimum | Warn | Warning shown beside the bid. User can proceed. | DS05 |
| Proposed bid above the break even bid | Estimated loss | Warn | Red warning with estimated loss amount. User can proceed. | DS06 |
| Profit only met on optimistic scenario | Relies on favourable outcome | Warn | Warning on the lot and in the bid sheet. | DS07 |
| Resale override entered | User knows more than evidence | Inform | Value tagged Your input, system value retained. | DS04 |
| Resale override above optimistic value | Above all evidence | Warn | Warning that the figure is above every comparable found. | DS04 |
| Insufficient evidence | No defensible comparable | Inform | No system bid. Resale field opens for user entry. | DS03 |
| Identification not confirmed | Values may change | Inform | Unconfirmed badge on the lot and bid sheet. | DS14 |
| Selling fees blank | Max bid may be inflated | Warn | Flag on lot row and bid sheet. | DS15 |
| Buyer's premium from fallback | Extraction failed | Warn | Premium tagged Estimated with note to check terms. | DS12 |
| Price older than seven days | Stale evidence | Warn | Stale tag with refresh action. | DS09 |
| All comparables excluded | No evidence left | Warn | Lot moves to insufficient evidence until a comparable is restored or a resale is entered. | DS17 |
| Newer method available | Result uses older method | Inform | Prompt to recalculate. Old result remains viewable. | DS19 |
| Edit below an organisation Floor lock | Breaches organisation rule | Block | Field rejects the value and names the lock and its owner. |  |
| Edit a Fixed locked setting | Breaches organisation rule | Block | Field read only with lock icon. |  |
| Viewer attempts an edit | Role permission | Block | Edit controls hidden. |  |
| Deep analysis beyond available credits | Billing integrity | Block | Shortlist cannot be confirmed. Shows credits needed. |  |
| Edit shared data directly | Protects other users | Block | Offer Submit for review instead. |  |
| Change hard coded method | Method integrity | Block | Read only with methodology link. |  |
| Material terms change unaccepted | Legal | Block | Acceptance screen before continuing. | DS01 |
