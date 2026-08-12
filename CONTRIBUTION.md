### Contributing to Paracosm

hey! thanks for wanting to help out with Paracosm. this is a one-person, unemployed-teenager project, so contributions genuinely make a difference — but i do have a few ground rules i'd like folks to follow before opening a PR.

#### the big one: please understand your own code

you're welcome to use AI tools (Claude, ChatGPT, Copilot, whatever) as an assistant while you work — for brainstorming, explaining unfamiliar syntax, catching typos, whatever helps you get unstuck. that's totally fine. while i'm not inherently "pro" ai, i understand that it does speed up workflow, and can be useful in the development process. 

what i'm asking you **not** to do is generate a chunk of code with AI and submit it without actually understanding what it does. i don't want to receive code that only an AI could explain or debug. if i (or a user) find a bug in something you contributed, i need you to be able to help track it down, explain your reasoning, and fix it — not shrug and say "the AI wrote that part." 

so before you open a PR, ask yourself:
- could i explain, line by line, what this code does?
- if this broke in production, would i know where to start looking?
- did i actually test this myself, or am i just trusting that it "looks right"?

if the answer to any of those is no, take some more time with it first. AI is a tool to help you write and understand code faster — not a replacement for understanding it. make sure you know what you're doing!

#### how to contribute

-  **bug reports** — found something broken? open an issue on GitHub with steps to reproduce it, what you expected to happen, and what actually happened. screenshots help a lot.
-  **feature requests** — got an idea? open an issue or bring it up on Discord first so we can talk it through before you put work into it.
-  **pull requests** — fixing a bug or building a feature? fork the repo, make your changes, and open a PR with a clear description of what it does and why.
-  **terminology / accessibility feedback** — since Paracosm is meant to work for all kinds of systems, feedback on wording, defaults, or accessibility gaps is always welcome, even if you're not submitting code.

#### before you open a PR

- test your changes yourself, in the actual app, before submitting. don't just assume it works.
- keep the local-first, no-account, no-server philosophy intact — nothing you add should send user data anywhere.
- try to match the existing code style so the codebase stays consistent.
- keep PRs focused. one bug fix or one feature per PR is much easier to review than a giant bundle of unrelated changes.
- if your change touches something user-facing (UI text, settings, onboarding), a screenshot or short clip in the PR description helps a ton.

#### what i'll do on my end

i'll review PRs as i have time — remember, it's just me. i might ask questions about how something works or request changes before merging, and that's not a knock on your work, i just want to make sure i (and future contributors) can maintain it. if i don't get to something right away, it's not personal, i promise.

#### a note on scope

Paracosm is intentionally staying browser-based, local-first, and free of social/online features (see the FAQ in the README for why). PRs that add accounts, servers, cloud sync, or similar aren't a good fit for this project, no matter how well built — so save yourself the effort and check in with me first if you're planning something big.

#### questions?

come hang out on Discord — it's the easiest way to ask questions, float an idea before building it, or get a second pair of eyes on something you're stuck on.

thanks for caring enough about this project to want to make it better. 💜
