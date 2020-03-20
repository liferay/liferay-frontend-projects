# Pull Request Etiquette

As an Engineering Department, Pull Requests are one of our main communication and collaboration channels. Through PRs we:

-   Implement new features and fix existing bugs.
-   Share knowledge with other Engineers.
-   Propose changes in existing features and architectures.
-   Learn and understand existing patterns and best practices.

Being one of the most powerful tools at our disposal, Pull Requests often can be time-consuming, annoying and nerve-racking when causing issues:

-   Long PRs are often delayed as reviewers favor simpler, to-the-point ones over those more big and complex.
-   Comments can devolve into endless discussions about the validity of every minor argument and written word preventing the PR from moving forward.
-   Reviews may focus on nitpicks and miss the big picture.
-   Code is pushed forward with changes that go unnoticed to the initial sender.
-   ...

The following compiles a list of good and healthy practices to observe while sending and reviewing Pull Requests to maximize our chances of success.

## When sending a Pull Request

When sending a PR, try to simplify your fellow engineers' work. Understand that your reviewer lacks your context about what you're sending her and will struggle to see how everything fits into place.

### Keep it short

Favor short, simple PRs over complex ones. Give your work some final thought before sending it asking yourself: "Could I make this simpler, easier to digest?"

-   Simple PRs are easier to reason about than complex ones.
-   It's easier to maintain concentration for a short time than a long one.
-   Feedback can be more thorough and useful when concentrated in a smaller set of changes.

### Write useful descriptions and titles

Help everyone understand what's the purpose of what you're sending in your titles. Regardless of your tool of choice, take the time to craft proper titles and descriptions so they can quickly understand what they're dealing with.

#### Avoid

-   Titles like `LPS-110163 SF` and `Apply Changes`.
-   Descriptions like `No description` or `Hey @reviewer, Please review the code`.

#### Prefer

-   Titles like `LPS-110163 Improve usability of <react:component> taglib`.
-   Fully fledged descriptions detailing what's done in the PR and why like [this](https://github.com/brianchandotcom/liferay-portal/pull/86171) or [this](https://github.com/brianchandotcom/liferay-portal/pull/86312) that:
    -   Provide context, where we came from and where we want to go with this change.
    -   Guide the reviewer to test the changes with clear steps to reproduce and a definition of the test plan you followed to validate your code.

### Write clear specific commit messages

In general, write clear and concise commit messages that explain what each commit does. When needed, explain in detail after the summary to provide details on the change in a permanent way.

Please follow our [Commit Messages](./commit_messages.md) guidelines.

#### Avoid

-   `LPS-58320`.
-   `LPS-49201 SF`.
-   `LPS-58201 Apply Review Feedback`.

### Add Visual Aids

When relevant, please add screenshots pointing the reviewer to the relevant changes they are to expect from your PR.

## When reviewing a PR

The ultimate goal of code review is to increase code and product quality. It does this both:

-   **Immediately:** By catching bugs, performance issues, security problems, and unwarranted technical debt before they get merged.
-   **Over time:** By exchanging knowledge (in both directions), which helps the team to level up.

Like most things in software engineering, "more" is not _always_ "better". _Improvement_ is a goal but _perfection_ is not. Knowing when to stop requires judgment. Effective review optimizes for things that deliver the biggest quality benefit at the lowest cost.

Here are some tips for being effective:

-   **Be respectful:** Remember that code is often a creative work with strong feelings attached to it. Be polite. Talk about code and not people (eg. "this loop looks like it might terminate too early" as opposed to "your loop is going to break"); or if you want to talk about people, use language that conveys shared ownership (eg. "here we're mutating the array in an unsafe way").
-   **Be honest:** If you don't understand a change, either ask a question about how things work, or explain the point where your understanding stops. If you don't feel "qualified" to review a change, it's important that you let the author know quickly so that they can find another reviewer, or at least understand the risk they might be running by moving forward without additional review.
-   **Be clear:** Ambiguity is the enemy because it can result in a PR going through an unnecessary additional "round trip" of feedback and changes.
    -   Explicitly label non-blocking feedback as non-blocking so that authors know that they can take or leave your suggested changes at their own discretion (eg. you could label such feedback with "nit", or "just a suggestion", or even "non-blocking feedback";).
    -   Provide enough detail in your suggestions that the author won't have to ask what you meant (eg. instead of saying, "let's replace these nested loops with a pre-processing phase", actually show what you mean in terms of code or pseudo-code).
    -   Provide a clear "Approve" or "Request changes", response. A "Comment"-only review doesn't move the PR forward, and the author should not be left wondering whether they have a green-light to proceed or not.
-   **Be aware:** Think about the broader context to help you strike the right balance of quality vs speed of delivery; some example factors to bear in mind:
    -   Are we at a higher-risk phase of the release cycle? (eg. during a stabilization phase).
    -   Is this feature gated behind a flag? (ie. can we afford to iterate more quickly and fast-follow with fixes?).
    -   How experienced is the author? (ie. how hands-on do you have to be with your feedback?).
-   **Be strategic:** This is closely related to the preceding point: given your awareness of the context and a finite amount of time, decide where you are going to get the most "juice for the squeeze" with your review. Which level(s) should you emphasize and which can your afford to skim or skip?
    -   Superficial review of formatting, spelling, compliance with conventions etc.
    -   Consideration of performance (data structures, data access patterns, behavior in the DOM etc).
    -   Security aspects (are we using APIs that favor security? will this change need to handle untrusted input? etc).
    -   Architecture (is the code amenable to modification? is the intent clear? etc).
    -   Ergonomics (if this code will be reused, is the API intuitive, flexible, powerful, fool-proof? etc).
    -   High-level patterns (do the structure and patterns match the "standard" approaches we use at Liferay? is it reusing existing abstractions appropriately?).

## Further reading

-   https://medium.com/better-programming/pull-request-etiquettes-for-reviewer-and-author-f4e80360f92c
-   https://www.atlassian.com/blog/git/written-unwritten-guide-pull-requests
-   https://about.gitlab.com/handbook/communication/#everything-starts-with-a-merge-request
