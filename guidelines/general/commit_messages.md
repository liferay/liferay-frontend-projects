# Commit message format

> **NOTE:** Although this guidance is framed in terms of commit messages, it applies equally to Pull Request titles and messages.

This repo follows the "[Conventional Commits](https://www.conventionalcommits.org/)" specification, and we should also apply it in our other GitHub repos (with the exception of [liferay-portal](https://github.com/liferay/liferay-portal)). The specification provides consistent structure and metadata for our commits. If we additionally follow the same patterns for our Pull Requests, we can accurately generate accurate and informative release notes as well, using a tool like [liferay-changelog-generator](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/npm-tools/packages/changelog-generator), which bases changelog on GitHub Pull Request titles extracted from merge commits.

In this repo (and others), we use the [Semantic Pull Request](https://github.com/probot/semantic-pull-requests) bot to check for deviations from the format (see the [bot configuration](https://github.com/liferay/liferay-frontend-projects/blob/master/.github/semantic.yml), and a [sample bad PR](https://github.com/liferay/liferay-frontend-guidelines/pull/71)).

## Message format

Each message consists of a title and optional body and footer. The title has a special format that includes a type, an optional scope and a description of the change:

```
type(optional scope): description

optional body

optional footer
```

### Type

The Conventional Commits spec defines the following types:

-   **feat**: A new feature.
-   **fix**: A bug fix.

Frequently used types that are not in the specification but which are widely used (for example, in [the `@commitlint/config-conventional`](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) and [the Angular conventions](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)) include:

-   **chore**: Changes that deliver value despite not delivering features or fixing bugs (eg. dependency upgrades, preparing releases etc).
-   **docs**: Documentation-only changes.
-   **perf**: Performance-related changes.
-   **refactor**: A code change that does not change behavior.
-   **style**: Formatting changes.
-   **test**: New or updated tests.

### Scope

The scope could be anything specifying place of the commit change. For example `feat(@clayui/dropdown)`, `feat(@clayui/css)`, `fix(next.clayui.com)`, `docs(Badge)`, `fix(useCache)`, etc...

### Description

The description should start with a verb:

-   fix: **stop** button bar from jumping on IE 11
-   refactor: **simplify** options parser
-   chore: **prepare** v2.3 release

and may, if it is in relation to an issue, include the issue number in parentheses as a suffix:

-   fix: make archive generation idempotent **(#12)**
-   test: fill in holes in picker test coverage **(#92)**

Endeavor to make the description as concise as possible while still communicating what the change does. It is desirable to keep the total title length under 72 characters if possible (some places recommend it be as short as 50 characters), but this is a guideline rather than a hard rule. Do your best and use your judgment.

### Footer

The footer may contain links or other metadata such as related issues. On GitHub specifically, a "Closes:" line can be used to automatically close an issue:

```
Closes: https://github.com/liferay/liferay-frontend-guidelines/issues/9
```

### Breaking changes

Breaking changes should include a "BREAKING CHANGE:" line at the beginning of the body or the footer:

```
BREAKING CHANGE: The x() function now returns a promise.
```

Additionally, you may highlight the presence of the breaking change by including an exclamation mark immediately before the colon on the commit title as in the following examples:

-   feat!: expose new version of table API (#12)
-   fix(bundler)**!**: replace invalid output format (#101)
