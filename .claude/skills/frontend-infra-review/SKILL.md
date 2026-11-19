---

allowed-tools: [Bash, Glob, Grep, Read]
argument-hint: "[none = current local branch | <PR number or URL> | <branch> | <base>..<head>]"
description: Review the current local branch (default) or a liferay-portal pull request with Frontend Infrastructure domain knowledge (resource loading, SPA, JS/React runtime, Clay/CSS/themes, taglibs, npm build and dependencies, editors, testing). Complements pr-check and pr-reviewer; it does not review code shape.
name: frontend-infra-review

---

# Frontend Infra Review

Add a Frontend Infrastructure domain layer to a pull request review. The existing master tooling already covers code shape. `pr-reviewer/rules` handles naming, sorting and idioms, `pr-check` runs the premerge validations, and lint/source-formatter handle formatting. This skill covers what those tools cannot see:

- **Side effects**: load order, SPA navigation, memory leaks, cache invalidation, theme bleeding, duplicated singletons.
- **Compatibility and extension**: public JS APIs, event names, taglib markup, CSS class names and custom properties that customers, other teams or themes depend on.
- **Maintenance**: deprecated mechanisms, the standard way to do something in portal today, utilities that already exist.
- **Risk**: feature flags, release-cycle timing, test coverage of the frontend part.

Never repeat what `pr-reviewer` or lint would flag. If a finding is about how the code looks rather than what it does, drop it.

## Inputs

Run from a liferay-portal (or liferay-portal-ee) checkout. All paths in the topic files are relative to its root. If the working directory has no `modules/apps` folder, stop and say the skill must run inside a portal checkout.

Resolve the argument in this order:

1. **No argument: the current local branch (default).** This is the mode for reviewing your own work while developing.
   - **Base branch:** `master`, or `master-private` when a remote points at `liferay-portal-ee`. Do not fetch, pull or rebase; the review must not change the checkout.
   - **Merge base:** compute `git merge-base HEAD <ref>` for every candidate that exists: the local base branch, `upstream/<base>` and `origin/<base>`. Use the newest one, the one the others are ancestors of (`git merge-base --is-ancestor`). A stale local `master` would otherwise pull upstream commits the branch was rebased onto into the diff. Call the result `MB`.
   - **Diff:** review `git diff $MB`. That covers commits on the branch plus staged and unstaged changes to tracked files. Also list new untracked files with `git ls-files --others --exclude-standard` and read the relevant ones.
   - **On the base branch itself:** when `HEAD` is the base branch, or `MB` equals `HEAD` with nothing committed on top, review only the uncommitted changes (`git diff HEAD` plus untracked files).
   - **Nothing to review:** when there is no diff at all, say so and stop.
   - **Intent:** there is no PR description. Read it from the branch's commit messages (`git log --format='%s%n%b' $MB..HEAD`) and the Jira keys in them. Treat the description and test plan checks in `review-process.md` as reminders for when the PR is opened, not as findings.
   - **Report header:** state the branch, the base and the merge base used, and whether uncommitted changes were included.
2. **A PR number or GitHub PR URL.** Use `gh pr view <n|url> --json title,body,files,headRefName,baseRefName` and `gh pr diff <n|url>`. A bare number resolves against the checkout's `gh` default repository (`gh repo set-default --view`), so for a PR on another fork use the full URL.
3. **`<base>..<head>`.** Review exactly that commit range, with no working tree changes.
4. **Anything else: a local branch name.** Check it with `git rev-parse --verify`, then diff it against its merge base with the base branch, with no working tree changes unless it is the current branch.

## Workflow

1. **Collect the diff and the intent**, as described under *Inputs* for the resolved mode. List the changed files, then read the diff.

1. **Route to topics.** Match changed paths and code signals against the table below. Each topic file also starts with an **Applies when the PR touches** line with finer signals. Read every matching topic in full, plus `topics/review-process.md` for every PR. Do not load topics that do not match.
   - **Folder topics.** A topic can be a folder (`topics/<name>/`) instead of a single file. For a matching folder, always read its `README.md` and any file it marks as *always*. Then use the README's own routing table to read only the aspect files whose signals match the diff. A change to a central file can match most of them; then read them all.

1. **Review against the topics.** For each matching topic or aspect file, walk its *Review checklist* and *Pitfalls and side effects* against the diff. Open the master files the topic cites when you need to confirm current behavior. Topic files can be out of date, so check the code before you assert anything.

1. **Respect review flags.** Text marked `REVIEW-FLAG` in a topic has not been confirmed for current master. Do not base a blocking finding on flagged text alone. Verify it in the code first, or present it as a question.

1. **Report.** Group findings by topic. For each one give the file and line, what happens (the functional consequence), why it matters, and a concrete suggestion or question for the author. Label each finding **blocking**, **non-blocking** or **question**, as `review-process.md` describes. End with what you did not check, such as topics not covered yet.

## Topic routing

| Topic file | Route here when the diff touches |
| --- | --- |
| `review-process.md` | Always: PR description, test plan, feature flags, risk, how to phrase feedback |
| `build-process.md` | Module `package.json` (scripts, deps), `modules/package.json`, `modules/node-scripts.config.js`, `modules/frontend-sdk/node-scripts/**`, `build.gradle` node config, `tsconfig.json`, themes' `build:theme`, any leftover `npmscripts.config.js` / `liferay-npm-bundler.config.js` / `.babelrc` (legacy, should not appear) |
| `dev-environment-and-debugging.md` | JS-related `portal.properties` / `portal-developer.properties`, `NODE_ENV` checks, JavaScript Loader / Frontend Caching settings, source maps, debug URL parameters |
| `module-imports-and-exports.md` | Cross-module JS imports (`@liferay/*-web`, `frontend-js-*`), `exports` config, import maps, AMD loader, `Liferay.Loader` |
| `npm-packages-and-dependencies.md` | New or upgraded third-party deps, `modules/yarn.lock`, new npm packages, publishing |
| `linting-and-formatting.md` | `.eslintrc*`, `eslint-disable`, `.prettierrc`, stylelint config, custom lint rules |
| `resource-loading.md` | Top-head resources, portlet header/footer JS/CSS properties, `liferay-util:html-top/bottom`, combo servlet, cache-busting, `ScriptData` |
| `layout-rendering-and-spa.md` | Theme/layout templates, `frontend-js-spa-web`, SPA lifecycle events, `data-senna-off`, portlet cleanup on navigation |
| `urls.md` | Client-side URL building, `PortletURL`, `ThemeDisplay` path getters, `p_auth`, friendly URLs |
| `jsp-javascript-integration.md` | `<aui:script>`, inline `<script>` in JSPs, `<portlet:namespace />`, CSP nonces, extracting JS from JSPs |
| `component-registry.md` | `Liferay.component*`, `Liferay.destroyComponent*`, `<liferay-frontend:component>` |
| `react-rendering.md` | `<react:component>`, `render()` from `frontend-js-react-web`, props passed from Java to React |
| `react.md` | React components, hooks, context, state management |
| `drag-and-drop.md` | DnD code (`react-dnd`, drag handlers), reorder UIs |
| `javascript-and-typescript.md` | `.ts`/`.tsx` files, `tsconfig`, public JS API options, browser support |
| `global-event-bus.md` | `Liferay.on`, `Liferay.fire`, `Liferay.detach`, `Liferay.once`, event names |
| `session.md` | `Liferay.Session`, session timeout, browser storage helpers |
| `requests.md` | `fetch` from `frontend-js-web`, headless calls, `Liferay.Util.fetch`, form data, CSRF |
| `runtime-utilities.md` | `Liferay.Browser`, debounce/throttle, AOP, other `Liferay.Util.*` helpers, ad-hoc reimplementations of them |
| `rich-text-editors.md` | `frontend-editor/*`, `liferay-editor:editor`, `EditorConfigContributor`, CKEditor/AlloyEditor config |
| `clay-in-dxp.md` | `@clayui/*` versions, `frontend-js-clay-web`, Clay icons/spritemap, Clay upgrades |
| `css-custom-properties.md` | `var(--…)` / custom property definitions, `frontend-token-definition.json`, style book tokens |
| `theme-bleeding.md` | Theme SCSS, admin/control-menu styles, `cadmin`, global selectors |
| `css-authoring.md` | `.scss`/`.css` in modules, new CSS components, utility classes, breakpoints, RTL |
| `taglibs.md` | `<aui:*>`, `<clay:*>`, `<liferay-ui:*>`, `<liferay-frontend:*>` usage or taglib implementation changes |
| `testing.md` | `__tests__`, `*.test.{js,ts,tsx}`, jest config, test utilities |
| `frontend-data-set/` (folder: `README.md` + `review-checklist.md`, then aspect files per its routing table) | `modules/apps/frontend-data-set/**`, `<frontend-data-set:*>` taglibs, `FrontendDataSet` imports, `SystemFDSEntry` / FDS views, filters, actions, sorts, props transformers of data sets, `L_DATA_SET*` objects, the FDS fragment, `FDSConnection`, `@liferay/js-api/data-set` |
| `glossary.md` | Read on demand when a term is unclear |

## Coverage

This first version is distilled from the old `guidelines/` folder of liferay-frontend-projects and checked against liferay-portal master as of November 2026. The list below is every topic known to be missing. When a PR falls mostly into an unchecked area, say in the report that domain coverage was limited, and still read the existing topics named under "Partly in", since they hold what is known so far.

To cover a topic: write `topics/<name>.md` (or a `topics/<name>/` folder, see *Maintaining this skill*), add its routing row, tick the box below and add the file name after it, then resolve the `gap` flags listed under "Partly in" (remove them or point them at the new file).

### Planned

- [ ] **CKEditor 5 in depth**: Liferay plugin authoring (`js/ckeditor5/plugins/*`, item selector), `getDefaultEditorConfig` presets and toolbars, GHS/`htmlSupport` and server-side sanitization, content migration from CKEditor 4/BBCode/Creole, premium features and license key, upgrade procedure. Partly in: `rich-text-editors.md` (gap flag).
- [ ] **Client extensions framework**: the framework itself, not just individual extensions. A good candidate for a folder topic (`topics/client-extensions/`), with one aspect file per family of CET types. Covers `modules/apps/client-extension/*` (`client-extension-api`, `-service`, `-type-api`, `-type-impl`, `-web`), the CET type model (`CET.java` and one class per type: `GlobalJSCET`, `GlobalCSSCET`, `CustomElementCET`, `IFrameCET`, `ThemeCSSCET`, `ThemeSpritemapCET`, `ThemeFaviconCET`, `JSImportMapsEntryCET`, `EditorConfigContributorCET`, `FDSCellRendererCET`, `FDSFilterCET`, `FDSVisualizationModeCET`, `StaticContentCET`, …), how each type reaches the page, and the compatibility contract every type property creates for deployed customer extensions. Partly in: `resource-loading.md`, `clay-in-dxp.md` (gap flag on Theme CSS / Spritemap), `rich-text-editors.md`, `theme-bleeding.md`, `css-custom-properties.md`, `frontend-data-set/client-extensions.md` (the FDS CET types and `@liferay/js-api/data-set`).
- [ ] **portal-url-builder framework**: `modules/apps/portal-url-builder` (`AbsolutePortalURLBuilder`, `AbsolutePortalURLBuilderFactory` and the per-resource builders for ES modules, bundle and web-context scripts and stylesheets, combo requests, portlet dependencies, images, servlets), its CDN, cache (`t=`) and path-proxy awareness, `FrontendESMImpl`, and why server-side code should build resource URLs through it rather than concatenating paths. Partly in: `urls.md`, `resource-loading.md`, `build-process.md`, `css-authoring.md`, `review-process.md` (CODEOWNERS).
- [ ] **Frontend Data Set (FDS)**: folder topic `frontend-data-set/`, first draft. Covered so far: architecture and entry points, headless vs classic display, data set kinds, import policies, the fragment and its tokens, views and renderers, filters/search/sorting/pagination, actions and selection, the CX slice, and the cross-cutting review matrix. Still to write, each in the aspect file named (resolve that file's gap flag when done):
  - [ ] Context contributors, `FDSAPIURLResolver`, side and info panels, inline editing and adding, nested items, `FDS_EVENT` events as a public surface. In `frontend-data-set/architecture.md`.
  - [ ] Schema builders (`FDSTableSchemaBuilder`, `FDSCardSchemaBuilder`), view context contributors, and what each built-in view supports. In `frontend-data-set/views-and-renderers.md`.
  - [ ] Snapshots and their sharing, the user configuration lifecycle, the full `FDSConnection` handshake. In `frontend-data-set/filters-search-sorting.md`.
  - [ ] Decision on the `SystemFDSSerializer.isAvailable()` discrepancy (ticket to link). In `frontend-data-set/data-set-kinds.md`.
- [x] **FDS internal props-transformer contracts**: `frontend-data-set/props-transformers.md` catalogues the 17 use cases from the samples in `frontend-data-set-sample-web` (`AdvancedPropsTransformer.ts` and the others), with their input and output props, callback signatures, consuming code, exported types and Playwright guards, and makes an unannounced break blocking. Open: two use cases without a Playwright guard (gap flag in that file). Add a row there whenever a PR adds a transformer capability.
- [ ] **Data Set Manager**: admin-defined data sets and how they relate to FDS: screens, mapping to `L_DATA_SET*` entries, permissions, export/import between environments, snapshots and user configurations, Playwright coverage. Partly in: `frontend-data-set/data-set-manager.md` (placeholder with gap flag), `frontend-data-set/importing.md`, `frontend-data-set/data-set-kinds.md`.
- [ ] **Frontend caching**: hashed files (`name.(hash).ext`), `HashedFilesRegistry`, `FrontendResourceFilter`, per-web-context `/o/js/-/` URLs, `FrontendCachingConfiguration` strategies, `t=` and ETags, CDN, and how they interact with import maps and SPA. Partly in: `resource-loading.md` (gap flag), `dev-environment-and-debugging.md`.
- [ ] **`@liferay/node-scripts` build internals**: `exports`/`submodules`/`symbols`, the generated `modules/node-scripts.config.js`, the linker plugin, import and AMD bridges, `build:custom`, CSS/SCSS exports, bundle reports, generated tsconfig and the repo-wide `tsc` check. Partly in: `build-process.md` (gap flag), `module-imports-and-exports.md`, `javascript-and-typescript.md`.
- [ ] **Playwright**: `modules/test/playwright`, existing frontend infra specs (`tests/frontend-*`), what to test in Playwright rather than Jest (taglibs, the `Liferay` global, SPA, loader), `featureFlagsTest`. Complements master's `.claude/rules/playwright.md`. Partly in: `testing.md` (gap flag).

### Found while writing the first version

- [ ] **Theme build and theming**: `node-scripts build:theme`, `_clay_variables.scss`/`_custom.scss` injection, theme RTL and `@noflip`, the theme inventory (Classic, Dialect, Prism, Admin, CMS, styled/unstyled), style books and frontend tokens from the theme side, and the Clay `Provider` `theme` prop for scoping React overlays to `cadmin`. Partly in: `css-authoring.md` (gap flag), `clay-in-dxp.md`, `css-custom-properties.md`, `theme-bleeding.md` (gap flag).
- [ ] **Color schemes and accessibility modes**: dark/light mode (`LPD-57922`), `data-color-scheme` handling and persistence, high contrast, the `cadmin` token set, and how to test them. Partly in: `css-custom-properties.md` (gap flag).
- [ ] **External theme and JS tooling**: `projects/js-themes-toolkit` and js-toolkit as customers still use them in Workspace, and what portal changes can break them. Partly in: `build-process.md`.
- [ ] **Content Security Policy**: policy configuration, nonces in taglibs, `script-src-attr`, raw `<script>` from `DynamicInclude`s, `<aui:style>` and inline styles, nonce handling for client extensions and FreeMarker. Partly in: `jsp-javascript-integration.md` (gap flag), `css-authoring.md`.
- [ ] **AMD loader deprecation and AlloyUI removal**: feature flag `LPD-48372`, JavaScript Loader settings, migration from AMD and `aui:script use` to ES modules, `frontend-js-aui-web` and `AUIConfiguration`, AUI-dependent pieces that still need a replacement (`liferay-form` validation, the event bus). Partly in: `dev-environment-and-debugging.md`, `jsp-javascript-integration.md`, `global-event-bus.md`, `taglibs.md`.
- [ ] **JSP forms vs React forms**: when a JSP form should become React (`react:component`, `@clayui/form`, `frontend-js-components-web`) instead of `aui:form`/`aui:input`, and the plan for `liferay-form` validation. Partly in: `taglibs.md` (gap flag).
- [ ] **SPA engine internals**: the vendored Senna in `frontend-js-spa-web`, surfaces, `data-senna-track`, routes, caching, events, `SPAConfiguration`. Partly in: `layout-rendering-and-spa.md` (gap flag).
- [ ] **Fragment and content page rendering**: `render-fragment-layout`, layout structure items, how fragment JS/CSS reach the page, SPA side effects. Owned by the layout team. Partly in: `layout-rendering-and-spa.md` (gap flag).
- [ ] **Public JS API contract**: when a module export, `/api` submodule or import map entry becomes a supported API for client extensions, `@liferay/js-api`, and how to deprecate. Partly in: `javascript-and-typescript.md` (gap flag), `module-imports-and-exports.md`, `frontend-data-set/client-extensions.md`.
- [ ] **ES modules from JSP and Java**: import maps (`JSImportMapsContributor`), `FrontendESMUtil`, the `{X} from <web-context>` syntax as a contract. Partly in: `module-imports-and-exports.md`, `jsp-javascript-integration.md`, `react-rendering.md`.
- [ ] **Global events catalogue**: the `Liferay.on`/`fire` events that count as public API (name, payload, firing module). Partly in: `global-event-bus.md` (gap flag).
- [ ] **Calling headless APIs from portal UI**: problem JSON errors, `Accept-Language`, pagination, abort, and whether a shared helper should exist. Partly in: `requests.md` (gap flag).
- [ ] **URL and redirect security**: `PortalUtil.escapeRedirect`, the redirect allow-list, `doAsUserId`/`doAsGroupId` propagation. Partly in: `urls.md` (gap flag).
- [ ] **Frontend accessibility**: keyboard alternatives (for example to drag and drop), live announcers, reduced motion through `render()`, a11y of taglib output, `jest-axe`. Partly in: `drag-and-drop.md`, `react.md`, `taglibs.md`, `testing.md`.
- [ ] **Browser storage and cookie consent**: registering new cookies and storage keys in the cookie inventory, consent-aware wrappers. Partly in: `session.md`.
- [ ] **Fast frontend dev loop**: the recommended iteration workflow now that `deployFast` is gone (`direct.servlet.context.reload`, `build:custom --serve`, and so on). Partly in: `dev-environment-and-debugging.md` (gap flag).
- [ ] **RTL CSS serving**: `frontend-css-rtl-servlet` and how `_rtl` files are picked at runtime. Partly in: `css-authoring.md`.
- [ ] **Glossary terms**: import map, FDS, Clay, frontend token, Senna/SPA, top head. Fill in as the topics above land. Partly in: `glossary.md` (gap flag); FDS terms are in `frontend-data-set/README.md` (link them from the glossary rather than repeating them).

Gap flags that point to code or tooling issues rather than missing knowledge stay in the topics and `REVIEW-FLAGS.md`, not here. Examples: lint holes, typings drift, the Jest rule's scope, duplicated `@liferay/*` lint packages, the PR template.

## Maintaining this skill

- One topic per file under `topics/`, using the structure of the existing files: *What the reviewer needs to know*, *Review checklist*, *Use cases and how-tos*, *Pitfalls and side effects*, *Not carried over*.
- **When a topic outgrows one file**, turn it into a folder `topics/<name>/`, as `frontend-data-set/` does. The files are meant for humans as well as for the reviewing agent:
  - `README.md` is the entry point. It holds a short overview (a Mermaid diagram if useful), the terms, a *Which file answers what* table with a routing column (signals that send the reviewer to each aspect file), and the list of open flags in the folder.
  - An optional `review-checklist.md` holds only the cross-cutting checks and links to the aspect files; mark it as *always* in the README.
  - Each aspect file uses the same section structure as a single-file topic, with its own **Applies when the PR touches** line and a short checklist for that aspect only.
  - Explain each concept in one file and link to it from the others with relative links; do not repeat it.
  - The routing table in this file keeps one row for the whole folder.
- Mark unconfirmed statements as `> **⚠️ REVIEW-FLAG [outdated|uncertain|policy|gap]:** …` and resolve them by verifying against master. `grep -rn REVIEW-FLAG .claude/skills/frontend-infra-review/topics` lists the open ones. `REVIEW-FLAGS.md` is an index of them for human review.
- When you add a topic or aspect file, add a row to the routing table (or to the folder README's table) and tick it in the Coverage list. When you find a new missing area, add it to the Coverage list.
