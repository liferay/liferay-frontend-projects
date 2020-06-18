# Frontend Infrastructure Team code review process

## Guidelines

1. **Send PRs for code review to [liferay-frontend/liferay-portal](https://github.com/liferay-frontend/liferay-portal).** This provides us with a global view of team progress and CI status, and gives us a common place to coordinate our efforts.
2. **Follow our best practice guidelines for preparing pull requests.** Our [general advice about preparing pull requests](https://github.com/liferay/liferay-frontend-guidelines/blob/master/general/pull_requests.md) also applies to the liferay-frontend/liferay-portal repo.
3. **Always provide a description.** In order to expedite review, give the reviewer(s) all the context they need to understand what your PR aims to do, and any analysis that you undertook to arrive at your solution (this can include a description of alternatives that you _didn't_ select, and why).
4. **Always provide a test plan.** This is part of the description, and consists of the steps you took to verify that your change is correct. This serves two purposes: one is to enable the reviewer to easily check your PR (if they deem it necessary); the other is to provide the reviewer with information that may save them the effort of testing it themselves (that is, if your test plan is good, the reviewer can feel more confident about the change).
5. **Always assign a reviewer.** All team members are collaborators on the repo and may be assigned as reviewers. Proactively selecting reviewers and `@`-mentioning them will minimize the amount of time your full sits unattended in the queue.
6. **Use the assignee to make current ownership clear.** If multiple people are involved in moving a pull to the next step, designate the person who is responsible for moving the pull to the next step as the assignee. For example, the assignee could be a person doing deep review of a change, or rebasing an outdated pull, or diagnosing CI failures.
7. **Use labels to make current status clear.** We have labels such as "awaiting response", "needs update", "forwarding", and so on to make it clear what the next steps are for each pull. Note that we even have "approved" and "changes requested" labels (which actually duplicate the indications that the GitHub UI provides) to make the status totally obvious.
8. **Ensure quality by analyzing test results.** At the time of writing, even a pull with a green CI result and "no unique failures" should be carefully inspected before running `ci:forward`, and specifically, "failures in common with upstream" should be examined to make sure that the pull does not introduce _additional_ failure that happens to overlap with existing failure in the upstream. If in doubt, ask QA for help, either in the `#d-quality-assurance` Slack channel, or directly mentioning our QA on GitHub or in the team Slack channel.
9. **Use custom searches to focus on relevant pulls.** See [the GitHub docs](https://help.github.com/en/github/searching-for-information-on-github/searching-issues-and-pull-requests) for help on creating bookmarks that show you of pulls that are of most interest to you. Examples may include the following, but there are many other possibilities:
    - `is:pr is:open author:USERNAME`: Open PRs by USERNAME.
    - `is:pr is:open assignee:USERNAME`: Open PRs assigned to USERNAME.
    - `is:pr sort:created-desc mentions:USERNAME`: All PRs mentioning USERNAME, ordered by recency.
    - `is:pr sort:created-desc commenter:USERNAME`: All PRs commented on by USERNAME, ordered by recency.
    - `is:pr is:open involves:USERNAME`: Open PRs involving USERNAME (ie. as author, commenter, mentionee, or assignee).
    - `is:pr is:open review-requested:USERNAME`: Open PRs to be reviewed by USERNAME.
    - `is:pr is:open no:assignee`: Open PRs with no assignee.
10. **Watch the repo so that you can be notified when new PRs arrive.** Even when you are not an explicit reviewer or assignee of a change, you can learn useful knowledge and information by being aware of what is going on in the repo.
