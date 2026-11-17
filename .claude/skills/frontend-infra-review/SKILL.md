---

allowed-tools: [Bash, Glob, Grep, Read]
argument-hint: "[<PR number or URL> | <branch> | <base>..<head>]"
description: Review a liferay-portal pull request with Frontend Infrastructure domain knowledge (resource loading, SPA, JS/React runtime, Clay/CSS/themes, taglibs, npm build and dependencies, editors, testing). Complements pr-check and pr-reviewer; it does not review code shape.
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

- A PR number or URL (`gh pr view <n|url> --json files,title,body` + `gh pr diff <n|url>`). A bare number resolves against the checkout's `gh` default repository (`gh repo set-default --view`), so for a PR on another fork use the full URL. A branch (diff against its merge base with `master`), or an explicit range. With no argument, review the current branch against `master`.
- The liferay-portal checkout under review. All paths in the topic files are relative to its root.

## Workflow

1. **Collect the diff and the intent.** Read the PR title/description and test plan when available, then list the changed files and read the diff.

1. **Route to topics.** Match changed paths and code signals against the table below. Each topic file also starts with an **Applies when the PR touches** line with finer signals. Read every matching topic in full, plus `topics/review-process.md` for every PR. Do not load topics that do not match.

1. **Review against the topics.** For each matching topic, walk its *Review checklist* and *Pitfalls and side effects* against the diff. Open the master files the topic cites when you need to confirm current behavior. Topic files can be out of date, so check the code before you assert anything.

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
| `glossary.md` | Read on demand when a term is unclear |

## Coverage

This first version is distilled from the old `guidelines/` folder of liferay-frontend-projects and checked against liferay-portal master as of November 2026. The list below is every topic known to be missing. When a PR falls mostly into an unchecked area, say in the report that domain coverage was limited, and still read the existing topics named under "Partly in", since they hold what is known so far.

To cover a topic: write `topics/<name>.md`, add its routing row, tick the box below and add the file name after it, then resolve the `gap` flags listed under "Partly in" (remove them or point them at the new file).

### Planned

- [ ] **CKEditor 5 in depth**: Liferay plugin authoring (`js/ckeditor5/plugins/*`, item selector), `getDefaultEditorConfig` presets and toolbars, GHS/`htmlSupport` and server-side sanitization, content migration from CKEditor 4/BBCode/Creole, premium features and license key, upgrade procedure. Partly in: `rich-text-editors.md` (gap flag).
- [ ] **Client extensions framework**: the framework itself, not just individual extensions. Covers `modules/apps/client-extension/*` (`client-extension-api`, `-service`, `-type-api`, `-type-impl`, `-web`), the CET type model (`CET.java` and one class per type: `GlobalJSCET`, `GlobalCSSCET`, `CustomElementCET`, `IFrameCET`, `ThemeCSSCET`, `ThemeSpritemapCET`, `ThemeFaviconCET`, `JSImportMapsEntryCET`, `EditorConfigContributorCET`, `FDSCellRendererCET`, `FDSFilterCET`, `FDSVisualizationModeCET`, `StaticContentCET`, …), how each type reaches the page, and the compatibility contract every type property creates for deployed customer extensions. Partly in: `resource-loading.md`, `clay-in-dxp.md` (gap flag on Theme CSS / Spritemap), `rich-text-editors.md`, `theme-bleeding.md`, `css-custom-properties.md`.
- [ ] **portal-url-builder framework**: `modules/apps/portal-url-builder` (`AbsolutePortalURLBuilder`, `AbsolutePortalURLBuilderFactory` and the per-resource builders for ES modules, bundle and web-context scripts and stylesheets, combo requests, portlet dependencies, images, servlets), its CDN, cache (`t=`) and path-proxy awareness, `FrontendESMImpl`, and why server-side code should build resource URLs through it rather than concatenating paths. Partly in: `urls.md`, `resource-loading.md`, `build-process.md`, `css-authoring.md`, `review-process.md` (CODEOWNERS).
- [ ] **Frontend Data Set (FDS)**: `modules/apps/frontend-data-set`, views, cell renderers, filters, actions, the FDS state atoms, and extension through client extensions. Partly in: `react.md` (state atoms), `glossary.md` (gap flag).
- [ ] **FDS internal props-transformer contracts**: the props-transformer surface that FDS consumers inside portal rely on, and that new FDS PRs must not break. The reference is the advanced sample in `frontend-data-set-sample-web`: `js/AdvancedPropsTransformer.ts`, `partials/advanced.jsp` and the `Advanced*` Java classes (views, filters, actions, sorts, fragment renderers). The contract includes the transformer's input (`additionalProps`, `bulkActions`, `itemsActions`, `selectedItemsKey`, `views`) and output (`atom`, `customRenderers.{listSection,tableCell}` with `type: 'internal'` renderers, `fileDropSettings`, `infoPanelComponent`, per-view `setItemComponentProps`, `onActionDropdownItemClick`, `onBulkActionItemClick` and the `selectedData` they receive), plus the types exported from `@liferay/frontend-data-set-web` (`IView`, `ICardSchema`, `IListSchema`, `IInternalRenderer`, `IItemsActions`, `IBulkActionItem`, `IFileDropSettings`, `DEFAULT_FETCH_HEADERS`). Its Playwright guard is `modules/test/playwright/tests/frontend-data-set-web/main/tests/advanced/*.spec.ts`. Until the topic exists, flag any PR that changes these names, signatures or payloads in `frontend-data-set-web`, and ask for the advanced Playwright specs to pass. Partly in: none.
- [ ] **Data Set Manager**: admin-defined data sets and how they relate to FDS.
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
- [ ] **Public JS API contract**: when a module export, `/api` submodule or import map entry becomes a supported API for client extensions, `@liferay/js-api`, and how to deprecate. Partly in: `javascript-and-typescript.md` (gap flag), `module-imports-and-exports.md`.
- [ ] **ES modules from JSP and Java**: import maps (`JSImportMapsContributor`), `FrontendESMUtil`, the `{X} from <web-context>` syntax as a contract. Partly in: `module-imports-and-exports.md`, `jsp-javascript-integration.md`, `react-rendering.md`.
- [ ] **Global events catalogue**: the `Liferay.on`/`fire` events that count as public API (name, payload, firing module). Partly in: `global-event-bus.md` (gap flag).
- [ ] **Calling headless APIs from portal UI**: problem JSON errors, `Accept-Language`, pagination, abort, and whether a shared helper should exist. Partly in: `requests.md` (gap flag).
- [ ] **URL and redirect security**: `PortalUtil.escapeRedirect`, the redirect allow-list, `doAsUserId`/`doAsGroupId` propagation. Partly in: `urls.md` (gap flag).
- [ ] **Frontend accessibility**: keyboard alternatives (for example to drag and drop), live announcers, reduced motion through `render()`, a11y of taglib output, `jest-axe`. Partly in: `drag-and-drop.md`, `react.md`, `taglibs.md`, `testing.md`.
- [ ] **Browser storage and cookie consent**: registering new cookies and storage keys in the cookie inventory, consent-aware wrappers. Partly in: `session.md`.
- [ ] **Fast frontend dev loop**: the recommended iteration workflow now that `deployFast` is gone (`direct.servlet.context.reload`, `build:custom --serve`, and so on). Partly in: `dev-environment-and-debugging.md` (gap flag).
- [ ] **RTL CSS serving**: `frontend-css-rtl-servlet` and how `_rtl` files are picked at runtime. Partly in: `css-authoring.md`.
- [ ] **Glossary terms**: import map, FDS, Clay, frontend token, Senna/SPA, top head. Fill in as the topics above land. Partly in: `glossary.md` (gap flag).

Gap flags that point to code or tooling issues rather than missing knowledge stay in the topics and `REVIEW-FLAGS.md`, not here. Examples: lint holes, typings drift, the Jest rule's scope, duplicated `@liferay/*` lint packages, the PR template.

## Maintaining this skill

- One topic per file under `topics/`, using the structure of the existing files: *What the reviewer needs to know*, *Review checklist*, *Use cases and how-tos*, *Pitfalls and side effects*, *Not carried over*.
- Mark unconfirmed statements as `> **⚠️ REVIEW-FLAG [outdated|uncertain|policy|gap]:** …` and resolve them by verifying against master. `grep -rn REVIEW-FLAG .claude/skills/frontend-infra-review/topics` lists the open ones. `REVIEW-FLAGS.md` is an index of them for human review.
- When you add a topic, add a row to the routing table and tick it in the Coverage list. When you find a new missing area, add it to the Coverage list.
