# JavaScript and TypeScript in portal

<!-- Sources: guidelines/general/javascript.md, guidelines/general/typescript.md, guidelines/general/options.md -->

**Applies when the PR touches:** `**/*.ts`, `**/*.tsx`, `**/*.d.ts` (especially `liferay.d.ts`, `modules/global.d.ts`, `frontend-js-web/.../main/index.d.ts`), any `tsconfig.json` under `modules/`, `node-scripts.config.js` (`main`, `exports`, `submodules`, `typescript`), `modules/package.json` (`typescript`, `@types/*`), `@liferay/js-api` imports or version bumps, `src/main/resources/META-INF/resources/js/api/**`, `frontend-js-web/.../liferay/index.js` (the `Liferay.*` globals), function signatures exported from `frontend-js-web` or other modules' entry points, `@deprecated` JSDoc, `// @ts-ignore` / `// @ts-expect-error` / `any` additions, and custom esbuild config (`customBuild`, `build:custom`).

## What the reviewer needs to know

- **Toolchain.** Portal no longer uses `@liferay/npm-scripts` from this repo. It uses the in-tree **`@liferay/node-scripts`** at `modules/frontend-sdk/node-scripts`. No `modules/**/package.json` references `liferay-npm-scripts`/`@liferay/npm-scripts`. Modules run `node-scripts build|format|test`.
- **Transpilation.** **esbuild** transpiles JS/TS/JSX with `target: ['es2022']` (`node-scripts/util/esbuild/bundleJavaScriptMain.mjs:65`, `bundleJavaScriptExports.mjs:90`). The global `Liferay` bundle in `frontend-js-web` uses `target: ['es2020']` (`frontend-js-web/node-scripts.config.js`). Babel is only used for Jest (`@babel/preset-typescript`, `@babel/preset-react` in `node-scripts/package.json`). Syntax newer than the target is down-levelled. Runtime APIs (e.g. `Array.prototype.findLast`, `structuredClone`) are **not** polyfilled.
- **TypeScript setup:**
  - Root `typescript` is **4.7.4** (`modules/package.json`), with `@types/react` 18.2.19 and `@types/react-dom` 18.3.1. Syntax from TS 4.8+ (`satisfies`, `const` type parameters, decorators metadata, etc.) does not compile.
  - A module becomes a TypeScript project when it has `.ts`/`.tsx` files. Its `src/main/resources/META-INF/resources/tsconfig.json` (and `test/tsconfig.json`) is **generated** by `node-scripts format` and marked `"@readonly": "** AUTO-GENERATED: DO NOT EDIT **"` with an `@generated` hash (`node-scripts/util/tsconfig/visitProjectTsconfig.mjs`, `baseTsconfig.mjs`). There are about 198 such files.
  - Base options: `strict: true`, `composite`, `emitDeclarationOnly`, `module: es2022`, `moduleResolution: node`, `jsx: react`, `checkJs: false`, `skipLibCheck`.
  - `paths` and `references` are derived from the module's `package.json` dependencies on other workspace projects. Declarations go to `modules/.tsc/types` and build info to `modules/.tsc/buildinfo`.
  - `modules/global.d.ts` pulls in the `Liferay` global declarations from several `liferay.d.ts` files, chiefly `frontend-js-web/.../liferay/liferay.d.ts`.
- **When types are checked.** Only the `format` pipeline runs `tsc` (`util/format/formatters/formatTypeScript.mjs` → `util/format/tsc/checkProjects.mjs`). Running it from `modules/` checks the TS projects for the changed files (all buildable projects when no file filter is given) plus Playwright (`util/format/formatPortal.mjs:140-158`). `--ignore-typescript` skips it. **The build (`node-scripts build` / `gradle deploy`) never type-checks**, because esbuild strips types. A type error therefore deploys fine and only fails `checkFormat`/CI. The same pipeline flags stale or obsolete `tsconfig.json` files (`formatTsconfigFiles.mjs`).
- **Adoption level.** About 115 of 355 `package.json` projects under `modules/apps` and `modules/dxp/apps` have a `.ts`/`.tsx` main, and source has roughly 3,900 TS files against 3,150 JS files. Core infrastructure is TypeScript: `frontend-js-react-web`, `frontend-js-state-web`, large parts of `frontend-js-web`, `frontend-data-set-web` and `layout-js-components-web`. `frontend-js-web`'s main API is JS with a hand-written `main/index.d.ts`.
- **Cross-module imports** must go through a module's declared entry points: `main`, `exports` and `submodules` in `node-scripts.config.js`, enforced by `@liferay/portal/no-cross-module-deep-import` (`modules/.eslintrc.js`). An `api` submodule must live at `js/api/api.{js,ts}` (`formatAPISubmodules.mjs`), and files in `js/api/` may not import outside it (`@liferay/portal/no-api-submodule-import`).
- **What counts as public JS contract in portal:**
  - **`Liferay.*` globals** (`Liferay.Util`, `Liferay.Language`, `Liferay.State`, `Liferay.component`…): wired in `frontend-js-web/.../liferay/index.js`, with lazy ESM stubs (e.g. `openToast`) rendered by `LiferayGlobalObjectPreAUIDynamicInclude.java:731`, and typed in `liferay.d.ts`. These are callable from JSPs, FreeMarker, fragments, themes and client extensions, so they cannot be type-checked at the call site. Deprecated globals are kept for years: `liferay/index.js:134-251` still carries `@deprecated As of Athanasius (7.3.x)` entries.
  - **`frontend-js-web` named exports** (`main/index.js` plus `main/index.d.ts`).
  - **Module entry points and submodules** listed in `node-scripts.config.js`, and anything mapped into the browser import map. Client extensions import these by bare specifier (e.g. React from `frontend-js-react-web`, or FDS's `@liferay/frontend-data-set-web/api`, which `@liferay/js-api`'s README documents as served by the portal).
  - **`@liferay/js-api`** — the published, versioned TypeScript contract for client extensions. Source lives in this repo at `client-extensions/js-api` (`data-set`, `editor` entry points). Portal pins it in `frontend-js-web` and `frontend-js-dependencies-web` (`"@liferay/js-api": "0.10.0"`) and re-exports `@liferay/js-api` and `@liferay/js-api/data-set` via `frontend-js-dependencies-web/node-scripts.config.js`. Portal code imports its *types*, e.g. `frontend-data-set-web/.../js/api/FDSConnection.ts:16`. A change to a type in `@liferay/js-api` is a public API change for client extensions.
  - **`<react:component>` props and `propsTransformer` modules** consumed from JSPs (see `react.md`).
- **Deprecation format.** `@deprecated As of <Codename> (<version>), replaced by X | with no direct replacement` is linted by `@liferay/portal/deprecation` (`frontend-sdk/eslint-plugin/rules/portal/docs/rules/deprecation.md`). The lint only knows codenames up to Cavanaugh (7.4.x).

> **⚠️ REVIEW-FLAG [outdated]:** Browser target is no longer "modern browsers plus IE 11" with Babel stage-4 transforms. Master compiles with esbuild to `es2022` (`es2020` for the global Liferay bundle), and there is no IE 11 support. Evidence: `modules/frontend-sdk/node-scripts/util/esbuild/bundleJavaScriptMain.mjs:65`, `frontend-js-web/node-scripts.config.js`. Old guideline said: "in practice means 'modern browsers plus IE 11'" (`guidelines/general/javascript.md`).

> **⚠️ REVIEW-FLAG [policy]:** Which browsers are officially supported is defined by the Liferay DXP Compatibility Matrix, outside the code. The code shows only the syntax target, and no runtime polyfilling policy is visible. Someone should confirm whether reviewers must check newer runtime APIs (ES2023+ methods, newer DOM APIs) against the matrix. Evidence: no `browserslist` in portal modules except `analytics-client-js/package.json`. Old guideline said: "we expect the transpiled code to work on all environments defined in the Liferay DXP Compatibility Matrix" (`guidelines/general/javascript.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The TypeScript build documentation link points to `@liferay/npm-scripts`, which portal no longer uses. The current implementation is `modules/frontend-sdk/node-scripts` (see its `AGENTS.md`). That `AGENTS.md` itself mentions commands such as `check:ci` and `generate:tsconfig` that `bin.js` does not register. Evidence: `modules/frontend-sdk/node-scripts/bin.js`, `git grep -l "@liferay/npm-scripts" -- 'modules/**/package.json'` (no results). Old guideline said: "see the documentation inside the `@liferay/npm-scripts` package" (`guidelines/general/typescript.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** Version skew of `@liferay/js-api`: portal pins `0.10.0`, while the local checkout of this repo's `client-extensions/js-api/package.json` is at `0.9.1`. The local clone may simply be behind. Confirm where 0.10.0 was published from before reviewing a js-api bump. Evidence: `modules/apps/frontend-js/frontend-js-web/package.json:3`, `client-extensions/js-api/package.json`. Old guideline said: nothing; it predates js-api.

> **⚠️ REVIEW-FLAG [gap]:** There is no written rule for when a module export or import-map entry becomes a supported public API for client extensions, as opposed to an implementation detail that happens to be reachable. `@liferay/js-api` is explicit, but plain module exports are not. Evidence: `FrontendJSReactWebDynamicJSImportMapsContributor.java`, `frontend-data-set-web/node-scripts.config.js` (`submodules.api`). Old guideline said: nothing.

## Review checklist

- **Type errors are not hidden** — new `// @ts-ignore`, `// @ts-expect-error`, `as any`, `as unknown as X` or `any` in exported signatures. Because the build never type-checks, these silence the only safety net. Ask for a real type, or a comment explaining why the cast is safe (the `Liferay.State` boundary cast in `frontend-js-state-web/.../main/State.ts:534` is an example of a justified, documented one).
- **No hand edits to generated `tsconfig.json`** — they are regenerated and hash-checked. Wrong `paths` or `references` usually mean a missing `package.json` dependency. Ask the author to add the dependency and run `node-scripts format`.
- **TypeScript version constraints** — no TS ≥4.8-only syntax. Do not bump `typescript`/`@types/*` in a module `package.json`: version alignment with `modules/package.json` is enforced, and divergences are allow-listed in `ALLOWED_PACKAGE_VERSION_DIVERGENCES.mjs`.
- **Runtime API availability** — code using recently added built-ins or DOM APIs will not be polyfilled. Ask whether all supported browsers have it (see the policy flag above).
- **Public signature change** — changes to `Liferay.Util.*`, `frontend-js-web` exports, module `exports`/`api` submodules, `@liferay/js-api` types or `<react:component>` props must stay backwards compatible:
  - Keep old parameters and options working.
  - Add new options as optional, with defaults that preserve current behavior.
  - Do not change the meaning or type of an existing option.
  - Do not remove an export without a `@deprecated` cycle.
  - Ask for a search of JSPs, `.ftl`, fragments, `liferay-sample-workspace` client extensions and Playwright tests for callers. TypeScript does not see them.
- **Options object for multi-argument public functions** — new public functions with several optional settings should take an `options` object destructured with defaults (`{a = x, b = y} = {}`), not positional booleans. An `options = options || {...defaults}` pattern drops all defaults as soon as a caller passes one option. Example in master: `openToast({autoClose = TOAST_AUTO_CLOSE_INTERVAL, type = 'success', …})` in `frontend-js-components-web/.../toast/openToast.tsx:205`, exposed as `Liferay.Util.openToast`.
- **Adding to `@liferay/js-api`** — new public types for client extensions belong there, not in ad hoc `.d.ts` copies inside a client extension. Ask whether the portal implementation imports the type from `@liferay/js-api` (single source of truth, as FDS does) and whether the js-api release and the portal version bump are coordinated.
- **Deprecations are explicit** — removal or replacement of a public JS function needs a `@deprecated As of <Codename> (<version>), replaced by …` notice and a working shim. Removals of long-deprecated globals affect customers' JSP overrides and themes. Ask for an LPD ticket and release note.
- **Cross-module imports via entry points only** — deep imports such as `other-module/src/...` fail lint and break at runtime because they are not linked. Ask the author to export the symbol from the other module's `main` or a submodule.

## Use cases and how-tos

- **Make a module TypeScript:** add `.ts`/`.tsx` files (or rename), point `main` in `package.json` / `node-scripts.config.js` at the `.ts` entry, add workspace dependencies to `package.json`, then run `node-scripts format` from the module to generate `tsconfig.json`. Check with `node-scripts format --check`.
- **Expose a typed API to other modules:** export from the module's main entry or declare a submodule (`submodules: {api: './src/main/resources/META-INF/resources/js/api/api.ts'}`). Consumers import `@liferay/<module>/api`, and the generated `paths` give them types.
- **Type a new `Liferay.*` global:** add it to `frontend-js-web/.../liferay/liferay.d.ts` (or the owning module's `liferay.d.ts` referenced from `modules/global.d.ts`), and keep the implementation's shape behind the public type, as `Liferay.State` does with opaque `Atom`/`Selector`.
- **Backwards-compatible option addition:**
  ```ts
  export function openThing(url: string, {modal = false, onClose}: {modal?: boolean; onClose?: () => void} = {}) { … }
  ```
  New options are always optional, and their default reproduces the previous behavior.

## Pitfalls and side effects

- Because esbuild does not type-check, a PR can pass a local `gradle deploy` and fail CI on `checkFormat`. Conversely, `--ignore-typescript` locally hides type breakage in *dependent* projects caused by a changed exported type.
- Changing an exported type in a core TS project (`frontend-js-web` d.ts, `frontend-js-state-web`, `frontend-js-react-web`) can break type checks in many dependent projects through project references.
- `checkJs: false` means JS callers of a TS API get no type checks. A renamed option silently becomes `undefined` in JS callers.
- `Liferay.*` globals and import-map exports are used by customer code that Liferay cannot grep. Treat any behavior change there as breaking, even when portal callers are all updated.
- Deprecated globals in `liferay/index.js` have shims dating back to 7.3. Removing one is a customer-facing change, not cleanup.

## Not carried over

- List of Liferay projects using TypeScript (Clay, js-toolkit) and the 2020–2021 adoption history — historical. Current adoption is summarized above.
- Note that npm-tools and js-themes-toolkit stay untranspiled JS, and the Node.js v10.15.1 baseline — about this repo's CLI tools, not liferay-portal review. The Node version is obsolete.
- Babel stage-3/stage-4 transform policy and `babel-plugin-proposal-class-properties` — obsolete. Master builds with esbuild, and class fields are part of ES2022.
- TypeScript learning resources (official docs, Tackling TypeScript, Deep Dive, react-typescript-cheatsheet, `lib.dom.d.ts` tip) — general education, not review knowledge.
- "Do's and Don'ts" link and "avoid `any`" — style. `strict: true` is enforced by the generated base config, and the review-relevant part is the `@ts-ignore`/`any` checklist item.
- `options.md` guidance on whether a boolean option is a good idea (`rotate(angle, {clockwise})` example), and "Prettier makes large defaults objects look fine" — API-design taste and code shape. Only the functional default-merging pitfall and the backwards-compatibility angle are kept.
