# MaxBid documentation

This folder is the rule book for building MaxBid. Read this page first.

## The documents are the source of truth

These documents are the only source of truth for how MaxBid works. Decision record 0007 settled this.

The folder docs/workbook holds the MaxBid Project Workbook, the spreadsheet this rule book was created from. It is now a historical record of the discovery session. It is kept because it shows where the decisions came from. It is never cited as authority, and nobody works from it. Everything still needed from it has been copied into these documents.

Many pages carry a line such as Source: MaxBid Project Workbook, tab 12 Pipeline. That line records where the content came from. It does not mean the workbook decides anything.

## Order of authority

When two sources disagree, the higher one wins. Report the conflict rather than guessing.

1. AGENTS.md at the repository root.
2. docs/01-decisions/decision-register.md and the decision records in docs/01-decisions/records.
3. The specifications in docs/02-specs.
4. The design rules in docs/03-design and the signed off prototypes listed in docs/03-design/prototypes.md.
5. The build rules in docs/04-build.

## Contents

| Folder | What it holds |
| --- | --- |
| 00-product | Summary, users, competitors, scope and user journey |
| 01-decisions | Every decision made so far, the decision records, and how to change one |
| 02-specs | Features and acceptance criteria, bid maths, valuation, costs, unit costs, data sources, pipeline, database, security, configuration, transparency, disclaimers, governance, commercial and legal |
| 03-design | Design system, brand and writing rules, name candidates, screens, UX standards and signed off prototypes |
| 04-build | Architecture, tech stack, roadmap and success metrics, workflow, component register and first prompts |
| 05-website | SEO, value guides, AI search and marketing |
| 06-risk | Risks and open items |
| workbook | Historical record only. Not authority |

## Changing the rules

The documents change only through a decision record. See docs/01-decisions/README.md. Code must never quietly work around a rule. If a rule blocks sensible work, stop and ask.
