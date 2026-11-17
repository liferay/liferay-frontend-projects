# Frontend testing

<!-- Sources: guidelines/general/testing/README.md, guidelines/general/testing/anatomy.md, guidelines/general/testing/supported_libraries.md, guidelines/general/testing/ui_components.md, guidelines/general/file_names.md (test placement) -->

**Applies when the PR touches:** `modules/**/test/**/*.{js,ts,tsx}`, `modules/**/__snapshots__/**`, a module `package.json` (`scripts.test`, a `"jest"` key, `USE_REACT_16`), `jest.config.js`, `jest-setup.config.{js,ts}`, `modules/frontend-sdk/node-scripts/util/jest/**`, `modules/frontend-sdk/node-scripts/test/**`, and `modules/test/playwright/**`. Code signals: `@testing-library/*`, `userEvent`, `fireEvent`, `toMatchSnapshot`, `data-testid`, `jest.mock(`, `Liferay.FeatureFlags[`, `checkAccessibility`.

## What the reviewer needs to know

**Master already documents how to write Jest tests.** `.claude/rules/jest-testing.md` covers placement under `test/` mirroring `src/.../js`, imports, `userEvent` over `fireEvent`, query priority, shared mocks and how to override them (`Liferay.*`, `fetch`), feature flag toggling, lifecycle and clearing mocks, `--force-debug`, and `checkAccessibility`. `.claude/rules/playwright.md` covers Playwright. Apply them and do not restate them. This file adds the toolchain model and the review judgment those rules lack.

### Toolchain in master

- **Runner**: each module's `package.json` has `"test": "node-scripts test"`, from `@liferay/node-scripts` at `modules/frontend-sdk/node-scripts` (in the yarn workspace via `modules/package.json` `workspaces`). The old `@liferay/npm-scripts` is no longer used by any portal module.
- **Config assembly** (`modules/frontend-sdk/node-scripts/util/jest/runJest.mjs`): `deepmerge` of the base config (`util/jest/getJestConfig.js`), a generated `moduleNameMapper` (`util/jest/getJestModuleNameMapper.mjs`), and the module's own Jest config, found by cosmiconfig (`getUserConfig('jest')`; for example a `"jest"` key in `package.json`, as about 50 modules have). The result is written to a temporary `TEMP_jest.config.json` and run with `jest --passWithNoTests --silent`.
- **Base config**: `testEnvironment: 'jsdom'`, `testMatch: <rootDir>/test/**/*.{js,ts,tsx}` (ignores `test/stories/` and `test/__lib__/`), Babel transform with preset-react and preset-typescript (types are **not** checked by Jest), `.scss` through `transformSass.js`, `transformIgnorePatterns` that let `@clayui`, `@ckeditor`, `ckeditor5`, `lodash-es` and `vanilla-colorful` through, and a `jest-junit` reporter writing `TEST-frontend-js.xml`.
- **Cross-module imports resolve to source.** `getJestModuleNameMapper.mjs` maps every workspace package's `name` to its `main` under `src/main/resources/META-INF/resources`, maps `<name>/test/__lib__/*` to that module's test helpers, and maps `node-scripts.config.js` `submodules`. A test in module A that imports `frontend-js-web` runs against `frontend-js-web`'s current source, not a built artifact.
- **Shared setup**: `util/jest/setup.js`, `setupAfterEnv.js`, and `mocks/Liferay.js`. `setupAfterEnv.js` installs a `fetch` spy that **throws on any unmocked call** and restores it after each test. Details are in the master rule.
- **Versions** (`modules/frontend-sdk/node-scripts/package.json`): `jest` and `babel-jest` 27.5.1, `@testing-library/react` 16.3.0, `@testing-library/dom` 10.4.0, `@testing-library/jest-dom` 6.6.3, `@testing-library/user-event` 14.6.1, `jest-fetch-mock` 3.0.3, `jest-axe` 10.0.0, `jest-junit` 17.0.0, `react-test-renderer` 18.2.0. Enzyme is gone (no match in any `modules/**/package.json` or test). `modules/package.json` pins `@types/jest` 26.0.14, a major version behind the runtime.
- **React 16 test mode**: 21 modules run `"test": "USE_REACT_16=true node-scripts test"` (e.g. `journal-web`, `segments-web`, `object-web`, `dynamic-data-mapping-form-*`). In that mode `getJestConfig.js` remaps `react`/`react-dom` to React 16.12 and Testing Library to old majors: `react` 12.1.2, `user-event` 4.2.4, `react-hooks` 3.4.2, `dom` 8.11.1. `frontend-js-react-web/.../js/render.tsx:25` calls it "a temporary workaround for unit tests that still use React 16". Production runs React 18.2.
- **Vendored Clay** (`modules/apps/frontend-js/frontend-js-clay-web/clay/clay-*`, 41 packages) runs plain `jest --config ../../jest.config.js`. It does not use the node-scripts shared setup or the `Liferay` mock. `@liferay-platform-experience` owns it.
- **What CI and `/pr-check` run**: `.claude/skills/pr-check/validations/portal/javascript-unit-test.md` runs the full suite of each changed module, plus up to 8 consumer modules that depend on it by name (for snapshots stored in consumers), plus modules whose `jest-setup.config.*` stubs an npm scope the PR adds. A pass is judged from `Test Suites:`, not `Tests:`.

### What good frontend tests look like (team principles still valid)

- Assert what the user can perceive (text, roles, visible state, network requests sent). Do not assert internal state or which internal function was called.
- Mock only at the edges (network, timers, browser APIs). A mock inside the module hides real bugs. The test should behave like a small integration test.
- Write for the person reading a CI failure: plain, top-to-bottom, some duplication is fine. In tests, simple beats clever.
- Aim for one behavior per `it()`, without going so far that the tests get worse.
- Pick matchers that explain the failure: `expect(list).toContain('apple')`, not `expect(list.includes('apple')).toBe(true)`.
- `it()` descriptions start with a verb. `@liferay/no-it-should` enforces this (`modules/frontend-sdk/eslint-plugin/configs/general.js:119`), so do not comment on it by hand.

## Review checklist

- **New behavior has a test that would fail without the change** — `/pr` accepts any added test. Check that the test exercises the changed path, including the flag-off path when the change is behind `Liferay.FeatureFlags[...]`.
- **Tests do not reach into implementation** — look for assertions on component state, CSS classes used only for styling, `container.querySelector` on presentational markup, or `toHaveBeenCalledWith` on internal module functions. Ask for a user-visible assertion instead.
- **No mocking of the module's own internals** — `jest.mock('../../src/...')` of a sibling file in the same module needs a reason. Mocking `frontend-js-web` wholesale (`jest.mock('frontend-js-web', ...)`) duplicates the shared mock and leaks between tests (`.claude/rules/jest-testing.md`, "Overriding the Shared Mocks").
- **Snapshots are smoke tests, not the assertion** — a new `toMatchSnapshot()` (about 75 test files and 139 `__snapshots__` files today) should come with targeted assertions. A PR that rewrites large snapshot files needs an explanation of each meaningful change. A blanket `jest -u` can hide a regression.
- **Shared component changes update consumer snapshots** — changes in `frontend-js-web`, `frontend-js-components-web`, `frontend-taglib*` or Clay can break snapshots in other modules, because tests import the source directly. Check that the consumers listed by `pr-check` ran ("PASS (8 of N consumers)" means some did not).
- **`data-testid` is a last resort** — nothing strips it from production builds (no `testid` handling in `modules/frontend-sdk`), and about 80 source files under `src/main/resources` already ship it. A new one in production code becomes markup that tests (and maybe customers) depend on. Ask for a role, label or text query first.
- **No new `USE_REACT_16=true`** — a new module, or a module not already on the list, must not opt in. Tests added to an opted-in module have to use the old APIs (`user-event` 4 is synchronous, so no `userEvent.setup()`, and `renderHook` comes from `@testing-library/react-hooks`). Moving a module off the flag is welcome but changes the test API under every test in it, so review it as its own PR.
- **Module Jest config changes are additive** — `deepmerge` concatenates arrays, so a module's `setupFiles`/`testPathIgnorePatterns` add to the shared ones (e.g. `frontend-js-web/package.json` adds `test/liferay/portlet/mock/setup.es.js`). Overriding `testEnvironment`, `transform` or `moduleNameMapper` changes how that module behaves compared with the rest of portal. Ask why.
- **Deleting tests does not fail the build** — `--passWithNoTests` means a module whose last test file was removed or moved out of `testMatch` passes quietly. Check deletions and moves under `test/`.
- **Helpers and fixtures are not picked up as tests** — every file under `test/` matches unless it sits in `test/__lib__` or `test/stories`, or the module adds `jest.testPathIgnorePatterns` (master rule, "File Naming").
- **No reliance on real network** — any unmocked `fetch` throws by design. A test that "works" because it catches that error is not testing the request.
- **Extra test devDependencies are justified** — Testing Library, `jest-fetch-mock` and `jest-axe` come from `@liferay/node-scripts`. A module that adds its own copy or a different version (e.g. `frontend-js-clay-web` declares `@testing-library/user-event-13-2-1`) can get different behavior from the rest of portal.
- **Changes to the shared Jest setup affect every module** — a PR touching `modules/frontend-sdk/node-scripts/util/jest/**` or `mocks/Liferay.js` changes the behavior of hundreds of suites (`modules/frontend-sdk/node-scripts/AGENTS.md`: "Changes here can affect hundreds of modules at once"). Ask for a broad run (`yarn test:all` from `modules/`, or a large sample) and check that `mocks/Liferay.js` stays consistent with the real `Liferay` global.
- **Accessibility assertion for new UI components** — ask for `checkAccessibility` (master rule, "Accessibility"). Remember that color contrast is not checked in JSDOM.
- **The right test level** — Jest/JSDOM cannot verify layout, real focus handling across iframes, CSS, AMD/ESM loading or SPA navigation. Those need Playwright (`modules/test/playwright/tests/<module>/`), which `/test-plan` selects, not `/pr-check`.

## Use cases and how-tos

- **Run one module's tests**: `cd <module> && yarn test [path] [--force-debug] [--testNamePattern …]`. The whole workspace: `cd modules && yarn test:all`.
- **Share a helper between modules**: put it in `<module>/test/__lib__/` and import it as `<package-name>/test/__lib__/<file>` (mapped by `getJestModuleNameMapper.mjs`; e.g. `@liferay/layout-js-components-web/test/__lib__/index` for `checkAccessibility`).
- **Assert on translated text**: the shared mock's `Liferay.Language.get(key)` returns the key, so query `screen.getByText('save')`, not the English label.

## Pitfalls and side effects

- Babel strips TypeScript types during Jest runs, so a green Jest run says nothing about types. Type errors in tests surface in `yarn checkFormat` (the master rule mentions this for `jest-dom` matchers).
- Fake timers combined with `userEvent` hang unless `userEvent.setup({advanceTimers: jest.advanceTimersByTime})` is used (master rule). In `USE_REACT_16` modules this API does not exist.
- `jest.spyOn(...).mockRestore()` on a shared `jest.fn` from `mocks/Liferay.js` strips its implementation for the rest of the worker, which causes failures in unrelated tests that depend on the order they run in (master rule).
- The Jest timezone is fixed to UTC and the language to `en_US`, so date and locale bugs that show up in other zones can pass in CI.
- `--silent` hides `console.error` output from React (act warnings, prop-type warnings). Use `--force-debug` locally when reviewing a flaky test.

> **⚠️ REVIEW-FLAG [outdated]:** The test runner is now `node-scripts test` from `@liferay/node-scripts` (`modules/frontend-sdk/node-scripts`), and test libraries are bundled there. No portal module uses `liferay-npm-scripts`/`@liferay/npm-scripts`. Evidence: `git grep '"@liferay/npm-scripts"' -- 'modules/**/package.json'` returns nothing, and 100+ `package.json` files use `node-scripts test`. Old guideline said: "liferay-npm-scripts … is called from the 'test' script in each package.json file as `liferay-npm-scripts test`" (`guidelines/general/testing/supported_libraries.md`).

> **⚠️ REVIEW-FLAG [outdated]:** JUnit output now comes from the third-party `jest-junit` 17.0.0 configured in `getJestConfig.js`, not from `@liferay/jest-junit-reporter`, which is still published from liferay-frontend-projects but not used by portal. Evidence: `modules/frontend-sdk/node-scripts/util/jest/getJestConfig.js` (`reporters`), and no `jest-junit-reporter` in `modules/**/package.json`. Old guideline said: n/a (implied by the npm-scripts toolchain).

> **⚠️ REVIEW-FLAG [outdated]:** The old rule required that `data-testid` "MUST be stripped" outside tests. Master has no stripping step, and about 80 production source files contain it. The master Jest rule only says to "try to avoid" it. This file follows master (discourage, do not block). Whether to restore the stronger policy is a team decision. Evidence: `git grep -i testid -- modules/frontend-sdk` returns nothing, and `git grep -l data-testid -- 'modules/apps/**/src/main/resources/**/*.{js,ts,tsx}'` matches about 80 files. Old guideline said: "we MUST NOT send 'data-testid' to the client" (`guidelines/general/testing/ui_components.md`).

> **⚠️ REVIEW-FLAG [policy]:** The old ban on generating `describe()`/`it()` blocks in loops conflicts with current practice: 51 test files use `it.each`/`test.each`/`describe.each`. Confirm whether the reviewer should still discourage this (it hurts traceability of CI failures) or accept `.each` with descriptive `%s` titles. Evidence: `git grep -l '\(it\|test\|describe\)\.each' -- 'modules/**/test/**'`. Old guideline said: "Don't dynamically create describe() and it() blocks" (`guidelines/general/testing/README.md`).

> **⚠️ REVIEW-FLAG [gap]:** `.claude/rules/jest-testing.md` only auto-loads for `modules/**/*-web/test/**`. Modules with Jest suites that are not `-web` (taglibs such as `frontend-taglib`, `layout-taglib`, `asset-taglib`; `analytics-client-js`, `commerce-frontend-js`, `fragment-impl`, `map-*`, …) do not trigger it, although the same conventions apply. Evidence: `.claude/rules/jest-testing.md` front matter `paths`, and `git grep -l 'node-scripts test' -- 'modules/**/package.json'` filtered to non `-web` modules. Old guideline said: n/a.

> **⚠️ REVIEW-FLAG [gap]:** Playwright under `modules/test/playwright` is the growing functional test layer. It has specs for many frontend infra modules (`tests/frontend-js-web`, `frontend-taglib`, `frontend-taglib-clay`, `frontend-js-spa-web`, `frontend-data-set-web`, `frontend-editor-*`, `frontend-theme`, `feature-flag-web`, …). `.claude/rules/playwright.md` covers how to write specs, but this skill has no frontend-infra-specific knowledge yet: what to cover in Playwright rather than Jest for taglibs, the `Liferay` global, SPA and the loader; how to judge flakiness in those areas; which existing specs protect which infrastructure. To be written. Evidence: `ls modules/test/playwright/tests | grep frontend`. Old guideline said: n/a (guidelines predate Playwright).

## Not carried over

- "Supported libraries outside Liferay DXP" (Mocha, Sinon, Karma) — not relevant to portal review.
- Link to `guidelines/dxp/dev_dependencies.md` for "don't add test libraries to devDependencies" — the gist is kept as a checklist item. The dev-dependencies policy itself belongs to another topic.
- Test file placement (`test/**` vs `__tests__`) from `file_names.md` — now in `.claude/rules/jest-testing.md` ("File Naming").
- Query priority, `userEvent` over `fireEvent`, and the list of ways to target elements without `data-testid` — superseded by `.claude/rules/jest-testing.md` ("Element Queries", "User Interaction"), which follows the Testing Library priority.
- `no-it-should` enforcement link to the archived `eslint-config-liferay` repo — the rule now lives in `modules/frontend-sdk/eslint-plugin/rules/general/` and is reduced to one bullet.
- The quote attributed to a named team member about snapshots — the principle is kept, the attribution is dropped.
