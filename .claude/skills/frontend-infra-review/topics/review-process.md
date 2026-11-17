# Review process and risk judgment

<!-- Sources: guidelines/dxp/code_review.md, guidelines/general/pull_requests.md, guidelines/general/commit_messages.md, guidelines/general/branch_structure.md, guidelines/CONTRIBUTING.md, guidelines/general/comments.md, guidelines/general/naming.md, guidelines/general/file_names.md, guidelines/general/linking.md -->

**Applies when the PR touches:** any liferay-portal PR reviewed from the Frontend Infrastructure angle; especially PRs whose description lacks context or a verification story, PRs that add or remove feature flag checks (`Liferay.FeatureFlags[`, `FeatureFlagManagerUtil.`, `feature.flag.` in `portal.properties`, `"feature.flag.key=`, `featureFlagKey =`, `featureFlagsTest(`), and PRs touching paths owned by `@liferay-frontend` in `.github/CODEOWNERS`.

## What the reviewer needs to know

### What master already enforces (point at it, do not restate it)

- **Commit and PR title format**: `<TICKET> <Summary>` with Jira keys (`LPD-12345`), sentence case, under 72 characters, body only when needed, plain prose, no wrapping. See `.claude/rules/commit.md` and `.claude/skills/pr/SKILL.md`.
- **PR body**: one `https://liferay.atlassian.net/browse/<KEY>` line per ticket, then `## What Is Being Fixed`, `## How It Is Being Fixed`, an optional `## Why Are There No Tests?`, and `## PR Check` holding the pasted `pr-check` result plus a hidden `<!-- pr-check {...} -->` marker. A webhook reads that marker and sets the `pr-check` commit status and label (`.claude/skills/pr/SKILL.md`).
- **Tests are required**: `/pr` refuses to open a PR unless at least one commit adds tests or the author gives a reason, which lands in `## Why Are There No Tests?` (`.claude/skills/pr/SKILL.md`, "Preconditions"). `.claude/CLAUDE.md` says "Every change must include test coverage".
- **Premerge checks**: `/pr-check` rebases, runs source format, the PR reviewer rules (`pr-reviewer/rules/*.md`), JS unit tests of the touched modules and of up to 8 consumer modules, compile, baseline, and more (`.claude/skills/pr-check/validations/{branch,portal,workspaces}/*.md`). `/test-plan` picks integration, Playwright and Poshi tests within a 20-minute local budget and records results in `build/test-plan/result.json`. `/pr` then adds a `Test plan: N run, M passed.` line.
- **Superseding a PR**: `/pr` asks whether a new PR supersedes or adds to the one recorded on the Jira ticket, comments the link on the old PR, and closes it (or posts `ci:close`).
- **Code shape** (naming, comment formatting, sorting, idioms): `pr-reviewer/rules/*.md`, `pr-reviewer/STYLE.md`, ESLint (`modules/frontend-sdk/eslint-plugin`), Prettier, and the source formatter. Do not raise these by hand.

### What the reviewer adds on top

- **Read the PR's own story.** The master template asks for what and how, not for alternatives you rejected or for manual steps. For frontend changes, ask for both when they are missing:
  - alternatives considered and why they were dropped, when the change touches shared infrastructure (`frontend-js-web`, taglibs, `@liferay/node-scripts`, the `Liferay` global);
  - manual verification steps: which page, which role, which theme or browser, and what to look for. A good test plan lets you decide whether to test yourself; a vague one means you must;
  - screenshots or a short recording for visible changes.
- **Choose where to spend review time** based on risk. From most to least valuable for frontend infrastructure: public API and backwards compatibility (the `Liferay` global, `frontend-js-web` exports, taglib attributes, `@liferay/js-api`), security (escaping, untrusted input, CSP), performance (bundle size, DOM work, data access), architecture and reuse of existing abstractions, ergonomics of new APIs. Skip shape issues because tooling catches them.
- **Judge risk from the feature flag and the release moment.** Code behind a disabled `dev` flag can iterate faster and fix things later. Code that changes default behavior, or a `release` or `deprecation` flag that is on by default, needs full scrutiny.
- **Know the owners.** In `.github/CODEOWNERS`, `@liferay-frontend` owns most of `frontend-js`, `frontend-taglib`, `frontend-editor`, `frontend-icons`, `frontend-data-set`, `client-extension`, `portal-template-react-renderer-*`, `portal-url-builder`, CSP and `site-staticexport-*`. `@liferay-platform-experience` owns `frontend-theme`, `frontend-token`, `frontend-css` (except `frontend-css-rtl-servlet`), `frontend-js-clay-web`, `frontend-js-charts-web` and `frontend-js-item-selector-web`. Changes to code another team owns need that team's review. The team test routine is `[master] ci:test:<team>` (`.claude/skills/test-fix/references/testray.md`).

### Feature flags in master (essential for judging risk)

- **Declaration**: `portal-impl/src/portal.properties`, sections `## Feature Flag` (`feature.flag.<KEY>=true|false`) and `## Feature Flag UI` (`feature.flag.<KEY>.type=…`, `.system=true`, `.dependencies=…`, and `feature.flag.ui.visible[<type>]`). The source formatter **generates** these entries from code references (`modules/util/source-formatter/src/main/java/com/liferay/source/formatter/check/PropertiesFeatureFlagsCheck.java`). When the last reference goes away, the entry is removed.
- **Types** (`portal-kernel/src/com/liferay/portal/kernel/feature/flag/FeatureFlagType.java`): `dev` (the default; hidden in the UI because `feature.flag.ui.visible[dev]=false`; "Do not activate unless you are on a development instance"), `beta` ("experimental and not supported"), `release` ("fully supported", turned on progressively), `deprecation` ("will be removed soon"). Writing `.type=dev` explicitly is reported as unnecessary.
- **Scope and resolution** (`modules/apps/feature-flag/feature-flag-web/.../internal/`): a flag is per company. A company preference (set through the feature flag admin UI) overrides the `portal.properties` default (`PreferenceAwareFeatureFlag`). Keys marked `.system=true` always resolve against `CompanyConstants.SYSTEM` (`FeatureFlagManagerImpl.isEnabled`). A flag with `.dependencies` counts as enabled only if every dependency is enabled (`DependencyAwareFeatureFlag`).
- **Java/JSP**: `FeatureFlagManagerUtil.isEnabled(companyId, key)` or `checkEnabled(companyId, key)`, which throws `UnsupportedOperationException`. The single-argument `isEnabled(String)` is `@Deprecated` since 7.4 (it reads `CompanyThreadLocal`), yet it is still called in about 150 places (`portal-kernel/src/com/liferay/portal/kernel/feature/flag/FeatureFlagManagerUtil.java:85`). Components that react to toggles use `FeatureFlagListener` with `property = "feature.flag.key=<KEY>"`, or `FeatureFlagManagerUtil.registerService(...)`. WARs can declare `liferay-feature-flag-keys` (`portal-osgi-web-wab-extender/.../WebBundleDeployer.java:69`), and site initializers `Liferay-Site-Initializer-Feature-Flag` in `bnd.bnd`.
- **JS**: `Liferay.FeatureFlags` is rendered server-side on every page by `modules/apps/frontend-js/frontend-js-web/src/main/java/com/liferay/frontend/js/web/internal/servlet/taglib/LiferayGlobalObjectPreAUIDynamicInclude.java:433`. It holds **only enabled flags** (`'<KEY>': true`), merging the system company with the current company. A disabled flag is `undefined`, never `false`. Typed in `modules/global.d.ts:31`.
- **Other places flags are referenced**: `"featureFlag": "<KEY>"` in `*.batch-engine-data.json`, `x-feature-flag:` in `rest-openapi*.yaml`, and `featureFlagKey = "<KEY>"` in configuration annotations.
- **Tests**: Jest toggles `Liferay.FeatureFlags['<KEY>']` in `beforeEach`/`afterEach` (`.claude/rules/jest-testing.md`, "Feature Flags"). Playwright uses `featureFlagsTest({...})` (`.claude/rules/playwright.md`, "Feature Flags").

## Review checklist

- **Description explains why and how the change was verified** — if it is only "what", ask for the motivation, the rejected alternatives (for shared infrastructure) and the manual steps or screenshots. Without them you have to rebuild the author's context.
- **`## Why Are There No Tests?` is credible** — "UI only" is not a reason when a Jest test with Testing Library or a Playwright spec could cover it. Push back unless the change has no runtime effect.
- **PR is small and focused** — mechanical changes across many modules, behavior changes and refactors belong in separate commits, or separate PRs when they can ship apart. Ask for a split if the diff mixes them.
- **Feature flag is literal and visible to the source formatter** — in JS/TS write `Liferay.FeatureFlags['LPD-12345']`: single quotes, bracket access, a literal key. `PropertiesFeatureFlagsCheck` only matches `Liferay\.FeatureFlags\['(.+?)'\]`. Dot access, double quotes or a computed key are invisible to it, so the `portal.properties` entry is never generated (or gets removed), and the flag cannot be toggled through properties or environment variables.
- **New flag has the right type and default** — a new unfinished feature should be `dev` (no `.type` line) and default `false`. Ask why if a PR adds `release`/`beta`, flips a default to `true`, or adds `.system=true`. A system flag ignores per-company settings.
- **Both flag states work** — check the code path when the flag is off: no errors, no half-rendered UI, no leftover listeners. In JS, `if (Liferay.FeatureFlags['KEY'])` is right, while `=== false` checks never match because disabled keys are absent.
- **Flag removal is complete** — when a feature graduates, every reference must go (Java, JSP, JS, JSON, YAML, `bnd.bnd`, tests, Playwright `featureFlagsTest` usages). Otherwise the source formatter keeps regenerating the property. Ask whether customers who set the flag explicitly need an upgrade note.
- **Deprecation flags** — a PR that adds `.type=deprecation` is announcing a removal. Ask for the replacement, and whether the deprecated path is still tested.
- **Release-phase risk** — near a quarterly release cut, prefer minimal, flag-guarded or easy-to-revert changes in shared frontend infrastructure. Ask whether the change must land now.
- **CI and `pr-check` results** — the `## PR Check` section must match the head SHA (the marker carries `sha`). Treat `NOT VERIFIED` rows and `--skip-pr-check`/`--skip-pr-reviewer` reasons as things to read, not boilerplate. For JS, a suite that fails without loading shows up only in `Test Suites:`, not `Tests:` (`.claude/skills/pr-check/validations/portal/javascript-unit-test.md`). A failure shared with upstream may still hide a new failure in the same test, so compare the failure messages.
- **Public names are API** — renaming or removing an export of `frontend-js-web`, a `Liferay.*` member, a taglib attribute, a `node-scripts.config.js` `submodules`/exports entry, or a `@liferay/js-api` symbol breaks other modules, themes and client extensions. Ask for a deprecation path rather than a rename.
- **Links in code comments are stable** — a comment that points at code should use a commit-pinned GitHub link (`/blob/<sha>/…`), not `/blob/master/…`, which drifts or breaks when files move. Jira links (`https://liferay.atlassian.net/browse/LPD-…`) are fine for the "why".
- **Feedback is explicit** — mark non-blocking remarks as such ("nit", "non-blocking"), show the suggested code instead of describing it, and end with Approve or Request changes. A comment-only review leaves the author without a decision.

## Use cases and how-tos

- **Gate new frontend behavior**:

  ```js
  if (Liferay.FeatureFlags['LPD-12345']) {
  	renderNewThing();
  }
  ```

  In JSP or Java: `FeatureFlagManagerUtil.isEnabled(themeDisplay.getCompanyId(), "LPD-12345")`. Run the source formatter so `portal.properties` gains `feature.flag.LPD-12345=false` and its `Env:` comment.
- **Turn a flag on locally**: `feature.flag.LPD-12345=true` in `portal-ext.properties`, or the environment variable from the generated `Env:` comment. Flags whose type has `ui.visible` true can also be toggled per instance in the feature flag admin UI.
- **Ask for a missing test plan**: "Could you add the manual steps you followed (page, user role, flag state) and a screenshot of the result? I'd like to know whether to run it locally."

## Pitfalls and side effects

- `Liferay.FeatureFlags` is fixed when the page renders. Toggling a flag in the admin UI only shows up on the next full page load, and SPA navigation may keep the old value (inferred from it being rendered by a dynamic include; not verified for SPA).
- Reading a flag at module top level stores the value once per page. That is fine for full page loads, but surprising in tests that toggle the flag after importing the module.
- `Liferay.FeatureFlags` exists only where the portal's `Liferay` global is rendered. Code that runs elsewhere (static export, external client extension hosts) cannot rely on it.
- A `system` flag cannot be enabled for one instance only. In multi-tenant setups this is a product decision, not an implementation detail.
- When a flag graduates, `false` stops meaning "off". Customers with `feature.flag.X=false` in their properties silently get the new behavior once the checks are removed.

> **⚠️ REVIEW-FLAG [policy]:** The old process sent every Frontend Infra PR to the `liferay-frontend/liferay-portal` fork, with assignees, status labels ("awaiting response", "needs update", "forwarding", "approved"), a named list of collaborators, and a Confluence repo-sync page. Master's `/pr` still lists `liferay-frontend` as a fork owner, so the fork exists, but the labels, the people and the sync process need human confirmation. Evidence: `.claude/skills/pr/SKILL.md` ("Target Repository" list includes `liferay-frontend`). Old guideline said: "Send PRs for code review to liferay-frontend/liferay-portal" (`guidelines/dxp/code_review.md`).

> **⚠️ REVIEW-FLAG [policy]:** Old guidance on CI analysis ("no unique failures", "failures in common with upstream" before `ci:forward`, ask in `#d-quality-assurance`) cannot be checked in code. `ci:forward` and `ci:close` still exist, and the forward target for `liferay-portal` is `brianchandotcom/liferay-portal`. `/test-plan` says the team "merges aggressively and relies on a daily full-suite run". Whether reviewers must still inspect shared failures before forwarding needs confirmation. Evidence: `.claude/skills/pr-check/SKILL.md:32`, `.claude/skills/test-plan/SKILL.md`. Old guideline said: "even a pull with a green CI result and 'no unique failures' should be carefully inspected before running `ci:forward`" (`guidelines/dxp/code_review.md`).

> **⚠️ REVIEW-FLAG [gap]:** The master PR template has no "test plan / manual verification" or "screenshots" section, which the old guidelines treated as mandatory. Either the frontend review should keep asking for it (as written above), or we accept `/test-plan` output as a replacement. Needs a team decision. Evidence: `.claude/skills/pr/SKILL.md` body template. Old guideline said: "Always provide a test plan" (`guidelines/dxp/code_review.md`).

> **⚠️ REVIEW-FLAG [policy]:** No release-phase rules ("stabilization", code freeze dates for quarterly releases) are encoded in master that this review could check. The "higher-risk phase" check above depends on reviewer judgment. Evidence: no matches for `stabilization` or `code freeze` in `.claude/`. Old guideline said: "Are we at a higher-risk phase of the release cycle? (eg. during a stabilization phase)" (`guidelines/general/pull_requests.md`).

## Not carried over

- Commit message format (Conventional Commits, `feat:`/`fix:`, scopes, `BREAKING CHANGE:`, Semantic PR bot) — the guideline itself excludes liferay-portal. Portal uses `<TICKET> <Summary>` per `.claude/rules/commit.md`. Still in force for liferay-frontend-projects (`.github/workflows/conventional-commits.yml` uses `amannn/action-semantic-pull-request`; the old `.github/semantic.yml` is gone).
- Commit message anti-examples (`LPS-49201 SF`, "Apply Review Feedback") — superseded by `.claude/rules/commit.md`. `<TICKET> SF` commits are produced by the formatter on purpose.
- Branch structure (one-branch, master+stable, maintenance branches, `package/v1.2.3` tags, `liferay-js-publish`) — about npm repos such as liferay-frontend-projects, alloy-editor and Clay, not liferay-portal. Not relevant to reviewing portal PRs.
- `CONTRIBUTING.md` — an index of commit_messages and linking, both handled above.
- "Allow edits from maintainers" checkbox, `gh` caveats, named GitHub collaborators, the @-mention notification gotcha when editing descriptions, custom GitHub searches, watching the repo, email filter recipes (`X-GitHub-Reason`) — personal workflow and GitHub UI behavior, not review knowledge. People lists are stale.
- "Prefer updating existing PRs over new ones" — mostly handled by the `/pr` supersede flow (link back, close or `ci:close`, update the Jira "Git Pull Request" field).
- Comments guideline (JSDoc vs `//`, capitalization, trailing comments, ESLint directive syntax, Sass `//` vs `/* */`) — code shape. Covered by `pr-reviewer/rules/905-format-inline-comments.md`, ESLint and stylelint.
- Naming guideline (no abbreviations, `i`/`j`, acronyms) — code shape, covered by `pr-reviewer/rules/1xx-*` (e.g. `101-uppercase-acronyms-in-identifiers.md`, `103-name-a-variable-after-what-it-holds.md`). Only the "public names are API" part is kept above.
- File names guideline (file named after its export, `.js` vs `.jsx`, `.es.js` history, `EVENT_TYPES.js` vs `itemTypes.js`, `test/**`) — code shape. Test placement is in `.claude/rules/jest-testing.md` ("File Naming"). The `.es.js` suffix still appears in older modules (e.g. `frontend-js-web/test/liferay/portlet/mock/setup.es.js`) and needs no review action.
- Linking guideline's "See also" discussion threads — history. The rule itself is kept as one checklist item.
- "Further reading" external links — not review knowledge.
