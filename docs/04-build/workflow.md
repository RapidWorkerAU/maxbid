# How every task is built

Every piece of work follows the same path so the build stays planned and diligent.

## The task cycle

1. Pick one task from the roadmap or the component register. Keep it small enough to review in one sitting.
2. Create a branch named after the task, for example feature/button-primitive.
3. Plan first. In Claude Code, switch to plan mode (Shift and Tab) and ask for a plan that names the spec it follows, the files it will create or change, and the tests it will write.
4. Ashleigh approves the plan or asks for changes.
5. Build. Claude Code writes the code, stories and tests.
6. Check. Run pnpm check. Everything must pass.
7. Open a pull request using the template. Vercel creates a preview link for every pull request.
8. Review. Ashleigh reviews the preview and Storybook, on desktop and on a phone.
9. Sign off. Ashleigh approves the pull request and updates the component register.
10. Merge to main.

## Definition of done

A task is done only when all of these are true.

1. It follows the spec it names, and any gap was raised as a question rather than guessed.
2. pnpm check passes: file size, lint, type check and tests.
3. Components have stories for every state, light content and long content, at 375px and 1440px.
4. The Storybook accessibility check shows no violations.
5. User facing text follows docs/03-design/brand-and-writing.md, and disclaimers come from packages/content.
6. No hex values, arbitrary Tailwind values or duplicated maths.
7. The component register and any affected docs are updated.

## Protecting main

In GitHub, turn on branch protection for main so that pull requests are required and the CI check must pass before merging.
