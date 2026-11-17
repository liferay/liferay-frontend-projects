# Clay in DXP

<!-- Sources: guidelines/dxp/how_clay_arrives_to_dxp.md, guidelines/dxp/clay-css-3-intro.md -->

**Applies when the PR touches:** `modules/apps/frontend-js/frontend-js-clay-web/**` (especially `clay/clay-*/**`, `clay/clay-css/**`, `node-scripts.config.js`, `package.json`, `FrontendJSClayWebDynamicJSImportMapsContributor.java`), `modules/apps/frontend-taglib/frontend-taglib-clay/**`, `modules/apps/frontend-theme/frontend-theme-{unstyled,styled}/**` (`build.gradle`, `_unstyled/css/**`, `_styled/css/**`), any theme `src/css/clay.scss`, `src/css/_clay_variables.scss` or `src/css/_imports.scss`, `modules/apps/frontend-icons/**`, `portal-web/docroot/html/common/themes/top_head.jsp`, and any `package.json` that changes an `@clayui/*` version. Code signals: `@clayui/` imports, `@import 'atlas-variables'`, `@import 'base-variables'`, `@import 'cadmin-variables'`, `clay/atlas`, `clay/base`, `clay/_atlas-custom-properties`, `getClayCSSURL`, `getPathThemeSpritemap`, `Liferay.Icons.spritemap`, `<clay:` JSP tags, `ClayTagContextContributor`, new SVG files under `clay-css/src/images/icons/`.

## What the reviewer needs to know

### Clay source lives in liferay-portal now

- Since LPD-66847 (Nov 2025), the whole Clay monorepo lives at `modules/apps/frontend-js/frontend-js-clay-web/clay/`: 41 `clay-*` React packages, `clay-css`, `storybook`, and `www` (the clayui.com docs site). `clay/AGENTS.md` says portal is now the source of truth. The public `liferay/clay` GitHub repo is a read-only nightly mirror.
- `modules/package.json` lists `apps/frontend-js/frontend-js-clay-web/clay/clay-*` in its yarn `workspaces`. `modules/node_modules/@clayui/css` is a symlink to `../../apps/frontend-js/frontend-js-clay-web/clay/clay-css`. DXP builds against the Clay source in the same commit, not against npm tarballs.
- `modules/package.json` does **not** pin Clay. The version source of truth is `modules/apps/frontend-js/frontend-js-clay-web/package.json` (currently `^3.167.0` for every `@clayui/*`). The source formatter check `JSONPackageJSONDependencyVersionCheck` (`modules/util/source-formatter/.../check/JSONPackageJSONDependencyVersionCheck.java:143-146`) copies those versions into every other `modules/{apps,dxp/apps,private/apps}/**/package.json` that declares an `@clayui/*` dependency.
- All `@clayui/*` packages are released together with the same version (lockstep). Publishing is centralized in `clay/publish-clay-packages.mjs`. The npm packages are for external consumers. DXP does not need a publish to see a change.
- CODEOWNERS: `frontend-js-clay-web/`, `frontend-theme/`, `frontend-css/`, `frontend-token/` and `style-book/` belong to `@liferay-platform-experience`. `frontend-taglib/` and `frontend-icons/` belong to `@liferay-frontend` (`.github/CODEOWNERS:92-109`).

### How Clay React reaches other modules at runtime

- `frontend-js-clay-web` is the only bundle that ships `@clayui/*` JS. Its `node-scripts.config.js` lists every package under `exports` (plus `@clayui/css/lib/css/{atlas,base,cadmin}.css`). `FrontendJSClayWebDynamicJSImportMapsContributor.java` writes a global import map entry for each name in its `_MODULE_NAMES` array, pointing to `frontend-js-clay-web/exports/@clayui$<pkg>.js`.
- Other modules declare `@clayui/*` in their `package.json` (for types and build), but node-scripts externalizes the import, so at runtime every module shares the single copy served by `frontend-js-clay-web`.
- The DXP export bridge works out named exports by AST-parsing each package entry point (`modules/frontend-sdk/node-scripts/util/esbuild/util/getExportedSymbols.mjs`). It only sees `export {Foo};` specifiers. For `@clayui/core`, `@clayui/date-picker` and `@clayui/provider`, the export list is **hard-coded** in the `symbols` key of `frontend-js-clay-web/node-scripts.config.js`. A symbol missing from that list fails the consumer's build with `No matching export ... for import "Foo"`.
- `frontend-js-react-web`'s `render.tsx:128` wraps every React app rendered by DXP in a provider that sets `ClayIconSpriteContext` to `Liferay.Icons.spritemap`. That is why DXP code rarely passes `spritemap` by hand.

### Clay JSP taglib

- `frontend-taglib-clay` (`uri="http://liferay.com/tld/clay"`, `liferay-clay.tld`) has about 45 `*Tag` classes. They write Clay markup from Java and, for interactive tags, hydrate a React component through `ReactRenderer` (`internal/servlet/taglib/BaseContainerTag.java`). Its JS side (`META-INF/resources/*.js`, e.g. `management_toolbar/`) imports `@clayui/*` like any other module.
- Extension points: the `propsTransformer` attribute (a JS module that rewrites props before render) and `contributorKey`, which selects `ClayTagContextContributor` OSGi services (`servlet/taglib/contributor/ClayTagContextContributor.java`).
- The taglib produces Clay **markup** independently of Clay React. A Clay CSS change that relies on new or changed markup must be mirrored in the Java tag output, or `<clay:*>` pages will drift from React pages.

### How Clay CSS reaches pages (themes)

- `top_head.jsp:21` emits `<link id="liferayAUICSS" href="themeDisplay.getClayCSSURL()">` (the theme's `css/clay.css`). `top_head.jsp:181` emits `main.css` later, so theme rules come after Clay. A **Theme CSS client extension** can replace both URLs (`ClientExtensionsServicePreAction.java:71-82`). A **Theme Spritemap client extension** can replace the spritemap URL (`:84-89`). CKEditor also loads `getClayCSSURL()` into its editing iframe (`BaseCKEditorConfigContributor.java:63`).
- The Clay Sass reaches themes this way. `frontend-theme-unstyled/build.gradle` (`buildClay`) copies `frontend-js-clay-web/clay/clay-css/src/scss/` into `_unstyled/css/clay/`. While copying, it rewrites the placeholder comments in `atlas.scss`, `base.scss`, `*-variables.scss`, `cadmin.scss` and `_atlas-custom-properties*.scss` (`// INSERT @use rules`, `// INSERT CUSTOM VARS`, `// INSERT CUSTOM BASE VARS`, `// INSERT CUSTOM EXTENSIONS`) into imports of the theme's `_clay_variables.scss`, `_liferay_variables*.scss`, `_clay_custom.scss` and `_liferay_custom.scss`. Theme variables are injected **before** Clay's `!default` variables, so they win.
- `buildClayIcons` / `buildLexiconIcons` copy `clay-css/src/images/icons/` (including the committed `icons.svg` spritemap) into `images/clay` and `images/lexicon`. `ThemeDisplay` sets the spritemap to `<theme images>/clay/icons.svg` (`portal-kernel/.../ThemeDisplay.java:1585-1588`). The control panel spritemap comes from the theme in `control.panel.layout.regular.theme.id` (`:1536-1549`).
- Theme build: themes run `node-scripts build:theme` (`modules/frontend-sdk/node-scripts/bundle/theme.mjs`). It layers `_unstyled`, then `_styled`, then the theme's `src/`, compiled with Dart Sass (`"sassOptions": {"dartSass": true}`). `frontend-theme-{styled,unstyled}` also have `publishNodeModule` tasks: they are published to npm as `liferay-frontend-theme-styled` / `liferay-frontend-theme-unstyled` for external themes built with `liferay-theme-tasks` (this repo, `projects/js-themes-toolkit`).

| Theme (module) | `liferayTheme.baseTheme` | `clay.scss` | Notes |
| --- | --- | --- | --- |
| `_unstyled` (`frontend-theme-unstyled`) | n/a | **empty** | Base layer only: Bourbon and deprecated mixins. Clay is available, not output. |
| `_styled` (`frontend-theme-styled`) | n/a (layers on unstyled) | `@import 'clay/base'` | Portal and portlet base CSS. `_imports.scss` brings `clay/base-variables` and `clay/_cadmin-variables`. |
| Classic (`frontend-theme-classic`) | `styled` | `@import 'clay/atlas'` | `default.regular.theme.id=classic_WAR_classictheme`. Has `frontend-token-definition.json`. |
| Prism (`frontend-theme-prism`) | `styled` | `@import 'clay/_atlas-custom-properties'` | Copy of Classic on Clay's CSS-variable/`light-dark()` build. Replaces Classic as the default when `LPD-57922` (dark/light mode) or `LPD-84497` is enabled (`portal-impl/.../ThemeFactoryUtil.java:31-37`). Renamed from "classic-2" in LPD-92565. |
| Dialect (`frontend-theme-dialect`) | `styled` | copied from Classic | `build.gradle` `copyClassicTheme` copies Classic's `src/` (except `WEB-INF`, images, `_custom_properties_set.scss`) and renames `_clay_variables.scss`/`_custom.scss` to `_classic_*`. Dialect's own code is in `src/css/dialect/`. |
| Admin (`frontend-theme-admin`) | `styled` | `@import 'clay/atlas'` | `<control-panel-theme>true`. `control.panel.layout.regular.theme.id=admin_WAR_admintheme`. |
| CMS (`frontend-theme-cms`) | `styled` | `@import 'clay/_atlas-custom-properties'` | Added in LPD-43525. |

### How Clay Sass reaches portal modules

- Module `.scss` files are compiled by node-scripts (`modules/frontend-sdk/node-scripts/util/sass/processSassFiles.mjs:141-158`). The include paths are Bourbon, `liferay-frontend-common-css` and `@clayui/css`'s `includePaths` (`clay-css/src/scss`). No `build.gradle` change is needed.
- `@import 'atlas-variables';` (129 files) or `@import 'cadmin-variables';` (85 files) pull in Clay **variables, functions and mixins only**. They output no CSS.
- Module CSS is compiled against **stock Atlas/cadmin defaults** at module build time, with the placeholders left as they are. It never sees a theme's `_clay_variables.scss`. Atlas color variables are literal values. `$cadmin-*` color variables already resolve to `var(--cadmin-*)` (`clay-css/src/scss/cadmin/variables/_globals.scss:239-285`). Anything in site-facing module CSS that must follow the site's theme or style book has to use CSS custom properties (see `css-custom-properties.md`), not Atlas Sass variables.

### Clay CSS facts that changed since the 3.x intro

- Bootstrap source is gone. `bootstrap.scss`, `src/scss/bootstrap/` and the BS4 overwrite files were removed in `@clayui/css` 3.150.0 (LPD-65524, `clay-css/CHANGELOG.md:46-58`, "Please use base or atlas if you depended on these files"). Clay CSS is self-contained Sass. `BASE-THEME.md` and `README.md` in `clay-css/` still describe Bootstrap and are stale.
- The entry points are `base.scss`, `atlas.scss`, `base-variables.scss`, `atlas-variables.scss`, `cadmin.scss`, `_cadmin-variables.scss`, `_atlas-custom-properties.scss` and `_atlas-custom-properties-variables.scss` (`clay-css/src/scss/`). The base/atlas split still holds: Atlas = Base rulesets plus the `atlas/_variables` overrides, with no extra rulesets.
- `_atlas-custom-properties*` is the newer flavor. Sass variables resolve to `var(--x)` (e.g. `$primary: var(--primary)`, `atlas-custom-properties/variables/_globals.scss:187`), and `:root` values come from the `$c-root` map using `light-dark()` (`atlas-custom-properties/variables/_c-root.scss`). Prism and CMS use it.
- Clay CSS is compiled with Dart Sass (`clay-css/package.json` devDependency `sass` 1.77.5), not node-sass/libsass.

## Review checklist

- **Clay source change: does it respect the platform blast radius?** Any change under `clay/clay-*` or `clay/clay-css` ships to every DXP app on merge, with no npm release in between. Ask for backward-compatible props and CSS, a `BREAKING.md` entry for breaking changes, updated stories/tests, and approval from `@liferay-platform-experience` (`clay/AGENTS.md`, "PR Readiness Checklist").
- **New or renamed `@clayui/*` package?** It must appear in all three places: `frontend-js-clay-web/package.json` `dependencies`, `node-scripts.config.js` `exports`, and `FrontendJSClayWebDynamicJSImportMapsContributor._MODULE_NAMES`. Without the import map entry, consumers fail at runtime.
- **New named export in `@clayui/core`, `@clayui/date-picker` or `@clayui/provider`?** Check that it was added to `symbols` in `frontend-js-clay-web/node-scripts.config.js`. For other packages, check that the entry point uses `export {Foo};` specifiers, not inline `export const`. Otherwise consumers fail with "No matching export".
- **`@clayui/*` version edited by hand in a consumer `package.json`?** Versions are driven from `frontend-js-clay-web/package.json` and aligned by the source formatter. A consumer with a different version will be rewritten, and suggests a misunderstanding. A Clay version bump PR should touch `frontend-js-clay-web/package.json` and the aligned consumers, and use one of the release commit phrasings that the changelog tool recognizes (`Bump Clay versions to X.Y.Z`, `Publish vX.Y.Z`, `Release Clay vX.Y.Z`, `Update Clay to X.Y.Z`).
- **Clay CSS markup or class change?** Look for the same markup in `frontend-taglib-clay` Java tags and in `frontend-theme-styled` / Classic / Prism / Dialect overrides. Look for customer-facing class names (customers' themes and fragments target Clay classes). Ask how removed selectors are handled.
- **Clay CSS change verified locally?** `clay/AGENTS.md` asks to deploy both `frontend-js-clay-web` and the affected theme module. A theme only picks up Clay Sass when it is rebuilt, because `frontend-theme-unstyled` copies it at build time.
- **New icon?** It needs the SVG under `clay-css/src/images/icons/` with the license header and `lexicon-icon-outline` class, plus regenerated, committed `icons.svg` and `src/scss/functions/_lx-icons-generated.scss` (`clay-css/README.md`, "Adding New SVG Icons"). Customers with a Theme Spritemap client extension or a custom theme spritemap will not get the icon automatically. Check that the UI degrades gracefully.
- **Module CSS using Atlas Sass variables to "theme" something?** `atlas-variables` resolve to stock Atlas literals at module build time. If the value must follow the site theme, style book or dark mode, ask for a CSS custom property (`var(--primary)`, `var(--cadmin-*)`) instead.
- **Change to `frontend-theme-unstyled/build.gradle` placeholder rewriting or to `_styled` / `_unstyled` Sass?** Every bundled theme inherits it. External themes built with `liferay-theme-tasks` inherit it through the npm-published `liferay-frontend-theme-{styled,unstyled}`. Ask about effects on customer themes.
- **Change in Classic?** Dialect copies Classic's `src/` at build time, and Prism is a near-copy of Classic (`diff -rq` shows only `clay.scss`, `_clay_variables.scss`, `_imports.scss`, token definition and look-and-feel differ). Ask whether Prism needs the same change and whether Dialect still builds and looks right.
- **Code path that uses `getClayCSSURL()` / `getMainCSSURL()` directly?** Remember that a Theme CSS client extension can swap them per layout. Do not assume the URL points to a theme bundle.

## Use cases and how-tos

- **Use Clay Sass helpers in a module stylesheet:** `@import 'atlas-variables';` for site-facing UI, or `@import 'cadmin-variables';` for admin UI on site pages (then scope under `html#{$cadmin-selector} .cadmin`, see `theme-bleeding.md`). No Gradle change is needed.
- **Use a Clay React component in a module:** add the `@clayui/<pkg>` dependency with the version from `frontend-js-clay-web/package.json` (the source formatter will fix it anyway) and import it normally. Do not bundle it. It resolves through the import map.
- **Use a Clay icon in React:** `<ClayIcon symbol="plus" />` inside a DXP-rendered React tree (spritemap comes from context). Outside it, use `getSpritemap()` from `@liferay/frontend-icons-web` or `Liferay.Icons.spritemap`. For admin UI rendered inside a site page, use `Liferay.Icons.controlPanelSpritemap` / `getControlPanelSpritemap()` so the icon set does not depend on the site theme.
- **Customize Clay variables in a bundled theme:** edit that theme's `src/css/_clay_variables.scss`. It is injected before Clay's defaults through the `// INSERT CUSTOM VARS` rewrite.
- **Release Clay to npm (external consumers):** from `frontend-js-clay-web`, run `node clay/publish-clay-packages.mjs --target-version=X.Y.Z --preview-changes`, then `--dry-run`, then the real run. Then run `ant format-source-all -Dsource.check.names=JSONPackageJSONDependencyVersionCheck -Dsource.file.extensions=json` in `portal-impl`, then `yarn && npx yarn-deduplicate yarn.lock && yarn` in `modules` (`clay/AGENTS.md`, "Releasing Clay").

## Pitfalls and side effects

- Clay JS and Clay CSS ship in different bundles (`frontend-js-clay-web` vs each theme WAR). A React change that needs new CSS works only on themes rebuilt from the same commit. Customer themes built earlier, or Theme CSS client extensions that bundle their own `clay.css`, keep the old CSS. Ask for markup and CSS changes that degrade gracefully.
- The `unstyled` `clay.scss` is empty. A customer theme with `baseTheme: unstyled` gets no Clay CSS output, but admin UI on its pages still renders through `clay_admin.css` (cadmin).
- Prism becomes the default regular theme for new sites when `LPD-57922` or `LPD-84497` is on. A PR tested only with Classic may look different once those flags are released.
- `frontend-js-clay-web/build.gradle` makes `packageRunBuild` depend on the whole `clay/` tree. Clay changes rebuild Clay CSS (`clay/clay-css/scripts/build.js`) as part of the module build.
- `headless-discovery-web/build.gradle` depends on `frontend-js-clay-web:packageRunBuild` because Swagger UI cannot use the import map. That is one of the places that consume built Clay CSS files directly.

> **⚠️ REVIEW-FLAG [policy]:** The Clay PR process (changes reviewed first on the `liferay-platform-experience/liferay-portal` fork with Vercel previews, approval by the platform experience team, release commit phrasings) comes from `clay/AGENTS.md` only and cannot be checked in code. Confirm it is the agreed process for PRs reaching liferay-portal. Evidence: `modules/apps/frontend-js/frontend-js-clay-web/clay/AGENTS.md` ("Pull Request Preview Integrations", "PR Readiness Checklist"). Old guideline said: nothing; this is new knowledge (`guidelines/dxp/how_clay_arrives_to_dxp.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** Dialect has no `.lfrbuild-portal` marker, unlike Classic/Admin/Prism/CMS, and is released as a separate `dialect-theme` WAR (`modules/.releng/apps/frontend-theme/frontend-theme-dialect/artifact.properties`). It may not be in the default bundle, so its review weight is unclear. Evidence: `git ls-files modules/apps/frontend-theme/frontend-theme-dialect | grep lfr` returns nothing. Old guideline said: nothing about Dialect (`guidelines/dxp/how_clay_arrives_to_dxp.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** The CMS theme's scope (which sites or apps use it) is not clear from code. Only an integration test references `cms_WAR_cmstheme`. Evidence: `git grep cms_WAR_cmstheme` → `layout-admin-web-test/.../EditLayoutDesignMVCActionCommandTest.java:147`. Old guideline said: nothing (new theme).

> **⚠️ REVIEW-FLAG [outdated]:** Clay CSS is no longer based on vendored Bootstrap 4.4.1, and there is no `bootstrap.scss` or `src/scss/bootstrap/`. Bootstrap files were removed in 3.150.0. Evidence: `ls modules/apps/frontend-js/frontend-js-clay-web/clay/clay-css/src/scss`, `clay-css/CHANGELOG.md:48`. Old guideline said: "Clay CSS is based on Bootstrap 4.4.1 ... The source code for Bootstrap 4.4.1 is stored inside the `src/scss/bootstrap/` directory" (`guidelines/dxp/clay-css-3-intro.md`).

> **⚠️ REVIEW-FLAG [outdated]:** Modules do not need a `buildCSS { imports = [...] }` block in `build.gradle` to use Clay Sass. node-scripts adds `@clayui/css` include paths automatically. Evidence: `modules/frontend-sdk/node-scripts/util/sass/processSassFiles.mjs:141-158`. `git grep -l 'clayui/css' -- '*build.gradle'` finds no such block in apps (`adaptive-media-web/build.gradle` no longer has it). Old guideline said: "copying the following code into the `build.gradle` file ... `buildCSS { imports = [ new File(npmInstall.nodeModulesDir, "@clayui/css/src/scss") ] }`" (`guidelines/dxp/how_clay_arrives_to_dxp.md`).

> **⚠️ REVIEW-FLAG [gap]:** Theme CSS and Theme Spritemap client extensions can replace `clay.css`, `main.css` and the spritemap per layout. They are now a main way customers theme DXP, and no topic covers them. Evidence: `modules/apps/client-extension/client-extension-service/.../ClientExtensionsServicePreAction.java:71-89`. Old guideline said: nothing (`guidelines/dxp/how_clay_arrives_to_dxp.md` only covers theme inheritance and node dependency).

## Not carried over

- The table of what each base theme includes ("Compat Layer: compatibility layer for Bootstrap 2 and 3", "Hello World Widget: Front Page Banner") — no compat files exist in `frontend-theme-styled` (`git grep -il compat -- frontend-theme-styled frontend-theme-unstyled` is empty). The rest is replaced by the theme table above.
- The `package.json` example with `"liferay-theme-deps-7.1"`, `gulp ^3.8.10` — that is external theme tooling (`projects/js-themes-toolkit`), not portal review material. Bundled themes use `node-scripts build:theme`.
- The full listings of `base.scss`, `atlas.scss`, `base-variables.scss`, `atlas-variables.scss` with Bootstrap imports — outdated (Bootstrap removed). The current essence (placeholders, load order) is summarized above.
- The "7.3.3 GA4 (Clay CSS 3.13.0) no longer have to import `bootstrap/_functions`" note — obsolete.
- `src/js/bootstrap.js`, `popper.js` in the project tree — not present (`clay-css/src/js` only has `svg4everybody.js`).
- Links to the clayui.com "how to use clay" page and to `github.com/liferay/clay/blob/master/...` sources — the source of truth is now `frontend-js-clay-web/clay/` in portal.
- The list of "variables worth mentioning" (`$primary`, `$spacers`, ...) and useful mixins — tutorial material. A reviewer can browse `clay-css/src/scss/variables` and `mixins`.
