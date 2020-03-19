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

TBD

## Further reading

-   https://medium.com/better-programming/pull-request-etiquettes-for-reviewer-and-author-f4e80360f92c
-   https://www.atlassian.com/blog/git/written-unwritten-guide-pull-requests
-   https://about.gitlab.com/handbook/communication/#everything-starts-with-a-merge-request
