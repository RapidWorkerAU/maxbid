Create the component $ARGUMENTS in packages/ui.

1. Find it in docs/04-build/component-register.md and docs/04-build/architecture.md. If it is not listed, stop and ask.
2. Check packages/ui for anything similar and reuse or extend it instead if possible.
3. Follow the component folder pattern in docs/04-build/architecture.md: component file, stories, tests where there is logic, types and index.
4. Use tokens only. Write mobile styles first.
5. Stories must cover every state, long content and empty content, at 375px and 1440px, with the status tag in-review.
6. Run pnpm check. Fix everything.
7. Update the register to In review with today's date, and tell me how to view it in Storybook.
