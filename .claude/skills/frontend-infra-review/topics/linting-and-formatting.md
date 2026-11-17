# Linting and formatting

<!-- Sources: guidelines/dxp/linting.md, guidelines/dxp/formatting.md, guidelines/general/formatting.md -->

**Applies when the PR touches:** `modules/.eslintrc.js`, any `**/.eslintrc.js`, `modules/.eslintignore`, `modules/.prettierrc.js`, `modules/.prettierignore`, `modules/.stylelintrc.js`, `modules/.stylelintignore`; `modules/frontend-sdk/eslint-plugin/**`, `prettier-plugin/**`, `prettier-config/**`, `stylelint-plugin/**`; `modules/frontend-sdk/node-scripts/util/format/**` (including `eslint/suppressed_errors.txt` and `stylelint/suppressed_errors.txt`); `modules/frontend-sdk/node-scripts/package.json` (eslint/prettier/stylelint/typescript versions); `checkFormat`/`format` scripts in any `package.json`; `source-formatter-suppressions.xml`; any new config file named `.babelrc*`, `.eslintrc*`, `.prettierrc*`, `.stylelintrc*`, `prettier.config.js`, `stylelint.config.js`. Code signals: `eslint-disable`, `eslint-disable-next-line`, `eslint-disable-line`, `/* eslint <rule>: … */`, `/* global …`, `stylelint-disable`, `// @ts-ignore`, `// @ts-expect-error`, `// prettier-ignore`, `ignorePatterns`, `ignoreFiles`.

## What the reviewer needs to know

### Which tools run, and where

- **`@liferay/node-scripts` (`modules/frontend-sdk/node-scripts`) is the only frontend lint/format runner in portal.** Module scripts are `"checkFormat": "node-scripts format --check"` and `"format": "node-scripts format"` (enforced by source-formatter `JSONPackageJSONCheck`). At the root, `modules/package.json` has `checkFormat` = `node-scripts format --check --current-branch`, `format`, `formatCurrentBranch` and `formatLocalChanges`. Gradle: `checkSourceFormatting` is finalized by `packageRunCheckFormat` and `formatSource` by `packageRunFormat` (`modules/sdk/gradle-plugins/.../SourceFormatterDefaultsPlugin.java:113,135`).
- **Per file type** (`util/format/util/formatSourceFile.mjs`). Globbed extensions are `graphql, js, jsp, jspf, mjs, scss, ts, tsx` (`formatSourceFiles.mjs:20`):
  - `.js/.mjs/.ts/.tsx`: **Prettier first, then ESLint with `fix: true`** (`util/format/eslint/formatWithEslint.mjs`).
  - `.scss`: Prettier, then **Stylelint**. Plain `.css` is not in the extension list, so `format` neither formats nor stylelints it. The `.css` branch in `formatSourceFile.mjs` is never reached from `format`.
  - `.jsp/.jspf`: Prettier only on the JS inside `<script>`/`<aui:script>` blocks (`util/format/jsp/formatScriptTagsWithPrettier.mjs`). **No ESLint on JSP code.**
  - `.graphql`: Prettier.
  - `.ts/.tsx` (and changed `package.json`/`node-scripts.config.js`): **`tsc` type check** (`formatTypeScript.mjs`). From `modules/` it checks every buildable project, because "a change in one project may break others" (`formatPortal.mjs`).
- **From `modules/` only**, `format` also runs the repo policies: config file names, global `node-scripts.config.js` freshness, generated `tsconfig` files, `package.json` policies, the `yarn.lock` guard, and the node-scripts hash (`util/format/formatPortal.mjs`, see `npm-packages-and-dependencies.md`). Run inside a module, it only formats, lints and type-checks that module (`formatProject.mjs`).
- **Liferay source-formatter (Java, `modules/util/source-formatter`) also inspects frontend files.** It checks `package.json` (`JSONPackageJSONCheck`, `JSONPackageJSONDependencyVersionCheck`, `JSONPackageJSONBNDVersionCheck`, `JSONDeprecatedPackagesCheck`), `.js` (`JSStylingCheck`, `JSWhitespaceCheck`, `JSLodashDependencyCheck`, `LanguageKeysCheck`), import-map contributors (`JavaJSImportMapsContributorCheck`) and JSP (many `JSP*Check`). Its suppressions go in `source-formatter-suppressions.xml` files.
- **Versions in master**: ESLint 8.57.1 (legacy `.eslintrc` cascade, not flat config), Prettier 3.2.5, Stylelint 17.16.0, TypeScript 4.7.4, `@typescript-eslint/*` 5.27.0 (`modules/frontend-sdk/node-scripts/package.json`, `eslint-plugin/package.json`).

### Where the configs live

- **ESLint**: `modules/.eslintrc.js` is `root: true` and extends `plugin:@liferay/portal`. That preset → `react` → `general` (`eslint:recommended` + `eslint-config-prettier` + Liferay rules), all in `modules/frontend-sdk/eslint-plugin/configs/`. The root config adds globals (`AUI`, `Liferay`, `themeDisplay`, …), the copyright `notice/notice` rule, `@liferay/no-extraneous-dependencies` (imports must be declared in `package.json`), `@liferay/portal/no-cross-module-deep-import` (fed with the global `node-scripts.config.js`) and `react-compiler/react-compiler: error`.
  - ESLint resolves config by file path (`formatWithEslint.mjs`: "Eslint reads configuration files based on the filePath"), so **a module's `.eslintrc.js` is honoured** and merges over the root one. There are 39 such files, e.g. `layout-content-page-editor-web/.eslintrc.js` turning off `react/no-string-refs`, and `frontend-js-web/.eslintrc.js` adding globals.
  - `.eslintrc.js` is the only accepted ESLint config name. Per-directory `.eslintignore` files are rejected: use the global `modules/.eslintignore` (`formatConfigFileNames.mjs`).
- **Prettier**: `modules/.prettierrc.js` (with `@liferay/prettier-plugin`). **Stylelint**: `modules/.stylelintrc.js` (`@liferay/stylelint-plugin` defaults, plus `liferay/no-hardcoded-colors: true`). Per-module `.prettierrc*`/`.stylelintrc*` files are rejected ("embedded in 'node-scripts' and cannot be overriden"). Only the paths in `ALLOWED_FILE_PATTERNS` may have them (`formatConfigFileNames.mjs:12`).
- **Baselines of known violations**: `util/format/eslint/suppressed_errors.txt` (≈300 entries, about 200 of them React Compiler "skipped optimizing" messages) and `util/format/stylelint/suppressed_errors.txt` (≈1500). A message is dropped if `<portal-relative-path>:<message>` is listed (`formatWithEslint.mjs:43`). The files are regenerated with `node-scripts format --emit-suppressed[-css]` from `modules/`, and the header says "DO NOT UPDATE THIS FILE IF YOU DON'T KNOW WHAT YOU ARE DOING".
- **Warnings fail too.** Any ESLint message, `warn` or `error`, makes `format --check` fail (`formatWithEslint.mjs:66` `errorsPresent: !filteredErrors?.length`, consumed in `formatSourceFile.mjs`). That is why rules configured as `warn`, such as `react-hooks/exhaustive-deps` (`configs/react.js:50`), still need inline disables: 306 `eslint-disable-next-line react-hooks/exhaustive-deps` in master.

## Review checklist

- **Every new `eslint-disable*` comment** — ask whether the code can be fixed instead. If not, it must be the narrowest form (`eslint-disable-next-line <rule>`, never a blanket `eslint-disable` without a rule name, never file-wide for a one-line issue), and should carry a reason (`-- why`, which ESLint 8 supports). Master has 58 blanket disables. Do not add more.
- **`react-hooks/exhaustive-deps` and `react-compiler/react-compiler` disables** — these are behavioral, not style. A wrong dependency list causes stale closures or effect loops, and any disabled React rule makes the React Compiler skip the whole component (≈200 baseline entries say exactly that). Ask for a justification or a refactor (`useCallback`, a ref, moving logic into the effect).
- **Disables of portal-specific rules** (`@liferay/portal/no-global-fetch`, `no-document-cookie`, `no-global-storage`, `no-react-dom-render`, `no-react-dom-create-portal`, `no-cross-module-deep-import`, `no-api-submodule-import`, `@liferay/no-extraneous-dependencies`, `@liferay/aui/*`) — each guards a platform concern: CSRF/auth-aware `fetch` from `frontend-js-web`, cookie consent, storage consent, React 18 root API, module boundaries, declared dependencies, AUI removal. Treat a disable as a design exception that needs explicit Frontend Infra agreement, not a lint nit.
- **New or changed module `.eslintrc.js`** — turning a rule off for a whole module is a broad suppression. Ask why the rule does not apply to the module, and prefer inline next-line disables. Reject `ignorePatterns`/`ignores` in `.eslintrc.js`. The `formatIgnoreFilePatterns` check prints an error but never fails (see flag), so the reviewer has to catch it.
- **Additions to `modules/.eslintignore`, `.prettierignore`, `.stylelintignore`** — they exclude files from all checks. Acceptable for generated, vendored or archived code. Challenge them for hand-written source.
- **Changes to `suppressed_errors.txt`** — the diff should only remove lines (debt paid) or move lines with renamed files. New lines mean new violations accepted silently. Ask for the fix, or for an explicit, ticketed reason.
- **`// @ts-ignore`, `// @ts-expect-error`, `any` casts** added to get past the `tsc` check — same scrutiny as lint disables. The type check is repo-wide, so ignoring an error may hide breakage in another module's public types.
- **New config file names** (`.babelrc`, `.eslintrc.json`, `.prettierrc`, `stylelint.config.js`, …) — rejected by `formatConfigFileNames`. If a PR edits `ALLOWED_FILE_PATTERNS` to let one in, ask why.
- **Changes to `@liferay/eslint-plugin`/`stylelint-plugin`/`prettier-plugin` under `modules/frontend-sdk/`, or to `modules/.eslintrc.js` / `.stylelintrc.js` / `.prettierrc.js`** — they affect every file in portal. Ask: was `node-scripts format` run from `modules/` on the whole repo (not `--current-branch`) to see the fallout? Does a new rule come with docs and tests in `rules/<family>/{docs,tests}`? Is it enabled in a preset or opt-in? Does it autofix safely? A new `error` rule with existing violations must either fix them in the same PR or add them to the baseline, and the second option needs agreement. Note `@liferay/eslint-plugin` also has a copy in liferay-frontend-projects (see `npm-packages-and-dependencies.md`).
- **Formatting-only churn** in an unrelated PR (reformatting files the change does not touch) — ask the author to drop it or split it out, because it hides the functional diff. Use `formatCurrentBranch`/`formatLocalChanges`.
- **`/* eslint <rule>: "warn" */` used to "keep CI green"** — this no longer works, because warnings fail `checkFormat`.

## Use cases and how-tos

- **Check or fix only what you changed**: from `modules/`, run `yarn checkFormat` (current branch) or `yarn formatLocalChanges`. In a module: `yarn checkFormat` / `yarn format`. Via Gradle: `gradlew packageRunCheckFormat` / `packageRunFormat`, or `formatSource`, which chains it.
- **Legitimate inline suppression**:

  ```js
  // eslint-disable-next-line @liferay/portal/no-global-fetch -- third-party endpoint, must not send portal auth headers
  const response = await window.fetch(externalURL);
  ```

  ESLint configuration comments (`/* eslint rule: "off" */`, `/* global Foo */`) must be block comments. A `// eslint no-undef: "warn"` line comment is ignored. `eslint-disable*` directives work in both forms.
- **Module-specific globals or one rule off for legacy code**: add or extend that module's `.eslintrc.js` (`globals`, `rules`). Never add `ignorePatterns`.
- **Exclude generated files**: add a path to `modules/.eslintignore` / `.prettierignore` / `.stylelintignore` under the right commented section.
- **See what the baseline hides**: `node-scripts format --emit-suppressed` (ESLint) or `--emit-suppressed-css` (Stylelint) from `modules/`.

## Pitfalls and side effects

- Prettier runs before ESLint, so an ESLint autofix can leave output that Prettier would reformat. Re-running `format` normally converges, but CI only runs `--check`.
- `--current-branch` / `--local-changes` only format changed files. Repo-wide effects of a lint-rule or config change only show up in a full run, or in the next unrelated PR that touches an affected file.
- The ESLint baseline matches on path plus message text. Renaming a file, or a rule message changing after an upgrade, "un-suppresses" old violations in someone else's PR.
- JSP inline JS is formatted but not linted. Rules like `no-global-fetch` or React hooks rules do not protect code in JSP `<script>` blocks. Push logic into ES modules.
- Eslint upgrades (e.g. LPD-108222, ESLint 8.57.1) and plugin upgrades change rule behavior repo-wide. Treat them like dependency upgrades.

> **⚠️ REVIEW-FLAG [outdated]:** Local `.eslintrc.js` files are honoured. node-scripts no longer forces a temporary config with `--config`, so module-level overrides work, and 39 exist. Evidence: `modules/frontend-sdk/node-scripts/util/format/eslint/formatWithEslint.mjs` (`new ESLint({fix: true, resolvePluginsRelativeTo: MODULES_DIR})`, no `overrideConfigFile`), `git ls-files '*.eslintrc.js' | wc -l`. Old guideline said: "these settings will actually override any settings that might be present in a local `.eslintrc.js` file. As such, overrides need be applied using in-file comments" (`guidelines/dxp/linting.md`).

> **⚠️ REVIEW-FLAG [outdated]:** Downgrading a rule to `warn` no longer keeps CI green, because any ESLint message fails `format --check`. Evidence: `formatWithEslint.mjs:66`, `util/format/util/formatSourceFile.mjs` (`if (!errorsPresent) checksPassed = false`). Old guideline said: "If a suppression is temporary, prefer downgrading it from an error to a warning… it won't cause CI runs to fail" (`guidelines/dxp/linting.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The toolchain is `@liferay/node-scripts` plus `@liferay/eslint-plugin` (`plugin:@liferay/portal`), both in-tree under `modules/frontend-sdk/`. `liferay-npm-scripts` and `eslint-config-liferay` (`extends: ['liferay']`, `liferay/react`) are gone, and React rules apply to all portal code through the `portal` preset. Evidence: `modules/.eslintrc.js:25`, `modules/frontend-sdk/eslint-plugin/configs/portal.js` (`extends: [require.resolve('./react')]`). Old guideline said: "create an `.eslintrc.js` in the project root that instead extends the 'liferay/react' preset" (`guidelines/dxp/linting.md`).

> **⚠️ REVIEW-FLAG [gap]:** `formatIgnoreFilePatterns.mjs` reports `ignores`/`ignorePatterns` in `.eslintrc.js` and `ignoreFiles` in `.stylelintrc.js`, but declares `const checksPassed = true` and never sets it to false. The check never fails CI. Evidence: `modules/frontend-sdk/node-scripts/util/format/formatters/formatIgnoreFilePatterns.mjs:13,60`. Old guideline said: nothing.

> **⚠️ REVIEW-FLAG [policy]:** Who may regenerate `suppressed_errors.txt`, and under what conditions (e.g. only Frontend Infra, only to remove entries, only for React Compiler messages), is not written down beyond the file header. Evidence: header of `modules/frontend-sdk/node-scripts/util/format/eslint/suppressed_errors.txt`. Old guideline said: "we'd like to avoid using lint suppressions as much as possible and have the same rules apply uniformly everywhere" (`guidelines/dxp/linting.md`).

## Not carried over

- All Prettier option values and their rationale (`bracketSpacing`, `singleQuote`, `useTabs`, `tabWidth`, `endOfLine`, `jsxSingleQuote`, `trailingComma`) and the sample `.prettierrc` for standalone projects (`guidelines/general/formatting.md`): formatting rules are out of scope for review, because the tool enforces them. Note that master's values differ from the old table (`jsxSingleQuote: false`, `trailingComma: 'es5'`, `quoteProps: 'consistent'` in `modules/.prettierrc.js`).
- IDE integration instructions (VS Code extension, IntelliJ FileWatchers, global npm install of prettier/eslint-config-liferay) (`guidelines/general/formatting.md`): developer setup, not review knowledge, and they reference the removed `eslint-config-liferay`.
- "Only JSP, JavaScript and SCSS files are formatted using Prettier" (`guidelines/dxp/formatting.md`): superseded by the per-extension list above (TS/TSX, MJS and GraphQL added).
- `gradlew npmRunFormat` and `liferay-npm-scripts check/fix` scripts (`guidelines/dxp/formatting.md`, `linting.md`): obsolete names. Replaced by `packageRunFormat`/`packageRunCheckFormat` and `node-scripts format [--check]`.
- "Comparison with usage in open source projects" (`guidelines/dxp/linting.md`): about external projects consuming `eslint-config-liferay`, not relevant to portal review.
