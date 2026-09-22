# MaxBid documentation

This folder is the rule book for building MaxBid. It was created from the MaxBid Project Workbook, which is kept in docs/workbook for reference. Read this page first.

## Order of authority

When two sources disagree, the higher one wins. Report the conflict rather than guessing.

1. AGENTS.md at the repository root.
2. docs/01-decisions/decision-register.md and any decision records in docs/01-decisions/records.
3. The specifications in docs/02-specs.
4. The design rules in docs/03-design and the signed off prototypes listed in docs/03-design/prototypes.md.
5. The build rules in docs/04-build.
6. The workbook in docs/workbook.

## Contents

| Folder | What it holds |
| --- | --- |
| 00-product | Summary, users, competitors, scope and user journey |
| 01-decisions | Every decision made so far, and how to change one |
| 02-specs | Features and acceptance criteria, bid maths, valuation, costs, data sources, pipeline, database, security, configuration, transparency, disclaimers, governance, commercial and legal |
| 03-design | Design system, brand and writing rules, screens, UX standards and signed off prototypes |
| 04-build | Architecture, tech stack, roadmap, workflow, component register and first prompts |
| 05-website | SEO, value guides, AI search and marketing |
| 06-risk | Risks, open items and success metrics |

## Changing the rules

The documents change only through a decision record. See docs/01-decisions/README.md. Code must never quietly work around a rule. If a rule blocks sensible work, stop and ask.
