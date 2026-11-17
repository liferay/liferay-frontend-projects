# CSS authoring in portal modules

<!-- Sources: guidelines/css/when_and_how_to_create_a_new_css_component.md, guidelines/css/how_to_name_the_css_files.md, guidelines/css/how_to_name_the_css_classes.md, guidelines/css/how_to_write_responsive_css.md, guidelines/css/when_to_use_css_utility_classes.md, guidelines/css/clay_css_2_recipes/*.md -->

**Applies when the PR touches:** `**/*.scss` and `**/*.css` under `modules/**/src/main/resources/META-INF/resources/`; JS/TS files that `import './Foo.scss'` or `import 'pkg/x.css'`; portlet component properties `com.liferay.portlet.header-portlet-css`, `com.liferay.portlet.header-portal-css` and `com.liferay.portlet.css-class-wrapper`; JSPs with `<aui:link ... hashedFile>`, `<aui:style>`, `<link rel="stylesheet">`, inline `style="..."` attributes or `cssClass` values; Java using `AbsolutePortalURLBuilder.forWebContextStylesheet`; `node-scripts.config.js` `exports` entries ending in `.css`; `modules/frontend-sdk/node-scripts/util/sass/**`, `util/css/**` and `util/format/stylelint/suppressed_errors.txt`; `modules/.stylelintrc.js`; `modules/frontend-sdk/stylelint-plugin/**`. Code signals: `@import 'atlas-variables'`, `@import 'cadmin-variables'`, `@import 'atlas-custom-properties/_variables'`, `media-breakpoint-up/down/between/only`, `respond-to`, `media-query(`, `clay-scale-component`, `$zindex-`, `z-index:`, `!important`, `/*rtl:ignore*/`, `/* @noflip */`, `.rtl &`, `[dir=rtl]`, `[data-color-scheme`, `c-prefers-`, hex or `rgb()` colors, `stylelint-disable`.

## What the reviewer needs to know

### How module CSS is built (node-scripts, not CSS Builder)

- **For portal modules, `node-scripts build` compiles Sass and plain CSS.** This applies to every module whose `package.json` has `"build": "node-scripts build"` (157 of the ~160 modules with `.scss`). The Gradle `buildCSS`/`copyCSS` tasks (`com.liferay.css.builder`) are **disabled** for every project outside `:sdk:`, `:test:`, `:util:` and `site-initializer-*`. Themes built with node-scripts are also excluded (`modules/build.gradle:583-628`).
  - CSS Builder (`modules/util/css-builder`, Dart Sass plus the Java `com.liferay.rtl.css` port) still exists for Liferay Workspace and SDK users. It is not what compiles portal app modules.
  - Themes use `node-scripts build:theme` (`modules/frontend-sdk/node-scripts/util/theme/**`), a separate pipeline (see "Not carried over").
- **Sass pipeline** (`modules/frontend-sdk/node-scripts/util/sass/processSassFiles.mjs`):
  - Every `*.scss` under `src/main/resources/META-INF/resources/` whose name does **not** start with `_` is an **entry file** and gets its own CSS output. `_*.scss` files are partials (`collectSassFiles`, line 104).
  - Excluded paths: `_diffs`, `_styled`, `_unstyled`, `css/aui`, `css/clay`, `build`, `tmp`, `.sass-cache*` (line 24).
  - Compilation uses Dart Sass **1.77.5**, either the binary pinned by `nodejs.sass.version` in `build.properties:647` or the `sass` npm package. Output is `compressed` when `NODE_ENV=production`, which is the default build setting (`build.properties:597`, `nodejs.node.env=production`), and `expanded` otherwise (`util/sass/util/runSass.mjs`).
  - Include paths (`getIncludePaths`, line 141): `bourbon` (node-bourbon 4), `liferay-frontend-common-css` (`_mixins.scss`, `liferay/_variables.scss`) and `@clayui/css` `src/scss`.
  - Each entry produces `build/node/packageRunBuild/resources/.sass-cache/<path>/<name>.(<hash>).css`, a `.map` and `<name>_rtl.(<hash>).css`. The RTL file is produced by running **`rtlcss` 4.3.0** over the compiled CSS (line 227). bnd's `SassAnalyzerPlugin` flattens `.sass-cache/` into the jar (`modules/sdk/ant-bnd/src/main/java/com/liferay/ant/bnd/sass/SassAnalyzerPlugin.java:45-62`).
  - `@import url(...css)` lines get a `?t=<timestamp>` appended, which the source code calls flawed (`appendTimestamps`).
- **Plain `.css` files** under `META-INF/resources` are copied with a content hash plus an `_rtl` twin, with no Sass step (`util/css/processCSSFiles.mjs`).
- **Clay CSS lives in portal now.** `@clayui/css` 3.167.0 is the workspace package `modules/apps/frontend-js/frontend-js-clay-web/clay/clay-css` (`modules/node_modules/@clayui/*` are symlinks). The standalone `liferay/clay` repo is a read-only nightly mirror (`frontend-js-clay-web/clay/AGENTS.md`). A Clay CSS change is therefore a portal PR that affects every DXP page.

### How module CSS is served

- The URL is `/o/<Web-ContextPath>/<path>.css`. `HashedFilesRegistryImpl` (`frontend-js-web/.../hashed/files/HashedFilesRegistryImpl.java`) maps the unhashed URI to the hashed file. `StyleSheetFrontendResourceRequestHandler` serves it, and hashed URLs get `max-age=31536000` immutable caching (lines 90-103).
- **Tokenized CSS.** If a CSS file contains `@base_url@`, `@portal_ctx@` or `@theme_image_path@`, it is not served as immutable. It needs a `themeId` request parameter and uses the "tokenized" cache settings (`_isTokenizable`, line 204).
- **Ways CSS reaches the page:**
  - **Portlet `com.liferay.portlet.header-portlet-css=/css/main.css`** (174 Java files). `PortletRenderUtil._getStaticCSSResourceURL` resolves the hashed URL and switches to `_rtl` for RTL locales (`portal-kernel/.../portlet/render/PortletRenderUtil.java:255-292`). The `<link>` has `data-senna-track="temporary"` (line 151), so it is removed on SPA navigation.
  - **`import './Foo.scss'` from JS/TS** (about 300 imports). The esbuild linker replaces the import with a stub that appends a `<link>` to `<head>` at runtime, picks `_rtl` by reading `getComputedStyle(documentElement).direction`, and adds the CSP nonce (`node-scripts/util/esbuild/plugins/getLinkerPlugin.mjs:255-310`, `util/esbuild/util/getCSSLoadJavaScript.mjs`). The link has **no `data-senna-track`**, so it stays loaded for the rest of the SPA session.
  - **CSS from npm packages** (`import 'leaflet/dist/leaflet.css'`). One module lists the file in `node-scripts.config.js` `exports`, and the others get an external CSS export loader (`getLinkerPlugin.mjs:139-150`; examples in `frontend-js-clay-web/node-scripts.config.js:59-61` and `frontend-js-codemirror-web`).
  - **JSP `<aui:link hashedFile="<%= true %>" href="ctx/path.css">`** (59 JSPs) resolves the hashed URL through `HashedFileUtil.getURL` (`util-taglib/src/com/liferay/taglib/util/HashedFileUtil.java`). That method does **not** add `_rtl` (see flag).
  - **Java `AbsolutePortalURLBuilder.forWebContextStylesheet(ctx, path)`** handles both the `_rtl` swap and the hash (`portal-url-builder-impl/.../AbsolutePortalURLBuilderImpl.java:145-165`).
- **All module CSS shares one global cascade.** `<html>` carries `class="ltr|rtl"`, `dir`, `data-color-scheme` and `data-prefers-contrast` (`frontend-theme-classic/src/templates/portal_normal.ftl:10`). Accessibility-menu settings add classes such as `c-prefers-reduced-motion`, `c-prefers-focus-ring` and `c-prefers-letter-spacing-1` (`accessibility-menu-web/.../AccessibilitySettingsUtil.java:40-110`). Style books inject `:root` custom properties through `ScopedCSSVariablesProvider` (`frontend-css-variables-api`; implemented in `style-book-service` and `frontend-token-definition-impl`).

### Clay variables, custom properties and theming

- `@import 'atlas-variables'` (103 files) and `@import 'cadmin-variables'` (82 files) bring in Clay **functions, variables and mixins only**. They emit no CSS. Importing `atlas`, `base` or `cadmin` (the full frameworks) would copy all of Clay into the module's CSS. Only `frontend-css-cadmin-web/.../clay_admin.scss` and the themes legitimately do that.
- **`@import 'atlas-custom-properties/_variables'` must come before `atlas-variables`.** Clay variables are `!default`, so whichever file defines them first wins. With that order, `$gray-200` compiles to `var(--gray-200)` and `$primary` to `var(--primary)` (`clay-css/src/scss/atlas-custom-properties/variables/_globals.scss:58,187`). Those values follow the style book, dark mode (`$c-dark`, `light-dark()`) and high contrast at runtime. With `atlas-variables` alone, the same variables compile to fixed hex values such as `#f1f2f5` and `#0b5fff` (`atlas/variables/_globals.scss:62,229`). Cadmin variables are custom properties already (`$cadmin-gray-200: var(--cadmin-gray-200)`).
- **Sass color math does not work on custom properties.** `darken()`, `lighten()` and `rgba($var, .5)` fail or silently use the fallback once the value is `var(--x)`. Use Clay's `clay-darken()`/`clay-lighten()`/`clay-mix()` (`clay-css/src/scss/functions/_color-functions.scss`), or CSS relative color syntax `rgb(from var(--x) r g b / 0.6)` (see `application-list-taglib/.../css/side_navigation.scss`).
- **`liferay/no-hardcoded-colors` is enforced** (`modules/.stylelintrc.js:15`, rule in `modules/frontend-sdk/stylelint-plugin/rules/no-hardcoded-colors.js`). Hex, `rgb()` and `hsl()` literals are rejected outside `var()`, `light-dark()` or `url()`. About 1,490 existing violations are grandfathered in `node-scripts/util/format/stylelint/suppressed_errors.txt`. The rule does **not** catch a Sass variable that compiles to a hex value (see above).
- **Cadmin** is the isolated admin UI layer: control menu, product menu, page editor and other chrome that renders on site pages. Its components live under `html:not(#__):not(#___) .cadmin` (`$cadmin-selector`, `cadmin/variables/_globals.scss:51`) so site themes cannot restyle them. `clay_admin.css` is loaded by `CadminTopHeadDynamicInclude`.

### Breakpoints and responsive mixins (verified in `@clayui/css` 3.167.0)

- Mixins (`clay-css/src/scss/mixins/_breakpoints.scss`): `media-breakpoint-up($name)`, `media-breakpoint-down($name)`, `media-breakpoint-between($lower, $upper)` and `media-breakpoint-only($name)`. They follow **Bootstrap 4 semantics**:
  - `up(sm)` is `min-width: 576px`.
  - `down(sm)` is `max-width: 767.98px` (the next breakpoint minus 0.02, `functions/_global-functions.scss:571-593`).
  - `down(xs)` is `max-width: 575.98px`.
- Breakpoints (`$grid-breakpoints`): xs 0, sm 576px, md 768px, lg 992px. **xl is 1280px** in Atlas (`atlas/variables/_globals.scss:441-450`) and cadmin (`$cadmin-grid-breakpoints`), and 1200px in Base. When both `atlas-variables` and `cadmin-variables` are imported, `$grid-breakpoints` (Atlas) wins.
- `clay-scale-component` wraps its content in `media-breakpoint-down($scaling-breakpoint-down)` (sm), which is Clay's "mobile" scaling hook. Atlas has `$enable-scaling-components: true`.
- `respond-to(phone|tablet|desktop)` and `media-query()` from `liferay-frontend-common-css` have been deprecated since 7.2 (`frontend-css-common/.../liferay/_respond_to.scss:1`, `_media_query.scss:1`) and use old breakpoints (768/980, 480/768/992/1200). Eight app files still use them.
- Clay z-index scale: `$zindex-dropdown` 1000, `$zindex-sticky` 989, `$zindex-fixed` 1030, `$zindex-modal-backdrop` 1040, `$zindex-modal` 1050, `$zindex-popover` 1060, `$zindex-tooltip` 1070, `$zindex-alert-notifications` 5000, `$zindex-sidenav`/`$zindex-c-slideout` 975 (`clay-css/src/scss/variables/_globals-z-index.scss`).

### Utilities

- Clay utility classes (`.mt-3`, `.d-md-none`, `.text-primary`, ...) are declared with **`!important`** (`@clayui/css/lib/css/atlas.css`).
- Clay 3 also has **`c-` spacing utilities without `!important`**: `.c-m*`, `.c-p*`, `.c-gap*`, with responsive infixes such as `.c-mt-md-3` (`clay-css/src/scss/components/_utilities.scss:332-420`). They are used in about 144 JSP/TSX files.

### Class names are public API

- `readme/BREAKING_CHANGES.md:10` lists "Changes in CSS classes available to Liferay themes and portlets" as a breaking-change category. An example entry is `.container-fluid-1280` at line 227.
- Themes, `themeCSS`/`globalCSS` client extensions (`ClientExtensionEntryConstants.java:31,41`), fragments and customer CSS select on portal markup classes.
- A breaking change is declared in the commit message with a `# breaking` / `## What <path>` / `## Why` block (`readme/BREAKING_CHANGES_AMENDMENTS.md`).

## Review checklist

- **New or changed `.scss` in a module without a `node-scripts build` script** — the file is never compiled, because `buildCSS` is disabled for apps and only node-scripts compiles module Sass. Ask the author to add the build script or drop the file. Example: `modules/apps/commerce/commerce-shipping-engine` has `css/main.scss` but no `package.json`.
- **Entry file vs partial** — a non-`_` `.scss` file becomes its own public, hashed CSS URL. Importing it from another entry also duplicates its rules into that output (`blogs-web/blogs/css/main.scss` imports `common_main`, which is also served on its own and linked from `full_content.jsp`). Ask whether a separate file is really needed. If not, rename it to `_name.scss`. Renaming an existing entry file removes a URL that JSPs, themes or other modules may link to.
- **JS imports of `.scss`** — only entry files can be imported. A partial has no compiled output, so the linker cannot resolve it. Remember that the injected `<link>` persists across SPA navigation, so its rules must be scoped to the component's root class.
- **Scope every rule** — all module CSS shares the page. Rules must sit under the portlet's `css-class-wrapper` class (for example `.portlet-blogs`, set through `com.liferay.portlet.css-class-wrapper`) or a module-prefixed component class. Flag bare selectors such as `.btn`, `.card`, `.nav-link`, `label`, `body` and `.modal`, which restyle Clay or other apps on every page where the CSS loads.
- **No ID selectors** — IDs raise specificity enough to defeat theme and utility overrides. Portlet markup IDs are namespaced (`_<portletId>_foo`), so a hard-coded `#foo` usually does not match, or matches only one instance. Ask for a class.
- **Changing or removing existing class names or markup structure** — this can break themes, client extensions, fragments and Playwright selectors. Ask whether the class appears in `frontend-theme-*`, `commerce-theme-*`, site initializers or tests. A removal or rename of a theme-facing class needs a breaking-change entry.
- **Variables import order and runtime theming** — CSS for site-facing or admin UI should read colors through custom properties: import `atlas-custom-properties/_variables` before `atlas-variables`, or use `cadmin-variables`, so dark mode, high contrast and style books apply. Flag compile-time Sass hex values and Sass color functions applied to `var()` values.
- **Hardcoded colors and the suppression list** — a PR must not add lines to `suppressed_errors.txt` or `// stylelint-disable liferay/no-hardcoded-colors` (only themes use the latter). Ask for a Clay token (`var(--gray-600)`, `var(--cadmin-...)`).
- **Importing a full Clay framework** — `@import 'atlas'`, `'base'`, `'cadmin'` or `'clay/...'` in a module duplicates tens of kilobytes of Clay and can override the theme's Clay. Only variables and mixins should be imported.
- **Reuse before creating** — before accepting a new component class, ask whether a Clay component, a modifier or a Clay React component/`clay:` taglib already covers it. A new component is justified when no existing component matches the design, when reusing one would confuse its meaning, or when most of the base class would need overriding. A component's essential layout belongs on the base class and visual variants on modifier classes. Avoid one-off modifiers that save nothing.
- **Utilities vs custom CSS** — utilities are fine for spacing and layout in app markup. Prefer `c-` spacing utilities when the value may need overriding, because `!important` utilities can only be beaten by another `!important`. For reusable or themeable pieces, prefer a component class backed by variables or custom properties, so a theme can change one variable instead of rewriting markup.
- **Responsive code uses Clay mixins, not hand-written pixels** — `@media (max-width: 768px)` next to Clay's `min-width: 768px` makes both rules apply at exactly 768px. Clay's `down()` mixins use `.98` values to avoid that overlap. Write mobile-first (`media-breakpoint-up`), and use `down()` only when it produces less code (for example a fixed-position mobile-only element). Do not add new `respond-to`/`media-query` usages.
- **Do not reorder the DOM for layout** — keep the DOM in reading and tab order for small screens and rearrange visually with flex/grid on larger breakpoints. Using CSS `order` to diverge from DOM order breaks keyboard and screen-reader order.
- **z-index** — use Clay `$zindex-*` variables (or `calc()` from them), not magic numbers. About 100 hard-coded `z-index` values of three digits or more already exist. A new one should state what it must sit above or below (dropdown, modal, alert notifications, slideout).
- **RTL** — `rtlcss` flips the compiled CSS automatically: `left`/`right`, `margin-left`, `padding-right`, `float`, `text-align`, `translateX()`, background positions, and so on. Check that:
  - there are no manual `.rtl &` / `[dir=rtl]` overrides of properties that rtlcss already flips. Those get flipped again (a double flip). `commerce-frontend-js/.../add_to_cart/add_to_cart.scss:23-41` overrides `translateX` this way and should be checked.
  - "do not flip" directives use the **loud** form `/*!rtl:ignore*/`. A plain `/*rtl:ignore*/` is removed by compressed (production) Sass output before rtlcss runs, and the theme-only `/* @noflip */` is not translated for modules (see Pitfalls).
  - new code prefers logical properties (`margin-inline-start`, `inset-inline-end`), which rtlcss leaves alone and browsers resolve correctly.
- **Accessibility preferences** — animations and transitions should respect `prefers-reduced-motion` **and** the portal's `c-prefers-reduced-motion` class, and focus styles should work with `c-prefers-focus-ring`. Clay components do this already; custom animation code often does not (only about 18 app `.scss` files mention either).
- **Pseudo-element content** — `::before`/`::after` should hold only decoration. Text in `content:` cannot be translated with language keys, cannot be targeted by JS, and screen-reader support for it is inconsistent.
- **Inline styles** — new `style="..."` attributes in JSP/JS are discouraged. The portal is moving them to CSS classes (many "Remove inline styles" commits, for example LPD-46231 and LPD-53697), and a CSP `style-src` with a nonce blocks them. Use a class, or `<aui:style>`, which emits the CSP nonce (`util-taglib/src/com/liferay/taglib/aui/StyleTag.java`).
- **Changes to the build or lint pipeline** (`processSassFiles.mjs`, `runSass.mjs`, `processCSSFiles.mjs`, `stylelint-plugin`, the `nodejs.sass.version` bump) — these affect every module. A Sass bump past 1.77.x enables `@import` deprecation warnings across hundreds of files (no app `.scss` uses `@use` yet). Ask for evidence that the output was diffed on representative modules, including `_rtl` files and production (compressed) mode.

## Use cases and how-tos

- **Portlet stylesheet**
  - File: `src/main/resources/META-INF/resources/css/main.scss`. Partials sit next to it as `_foo.scss`.
  - Component properties:
    ```java
    "com.liferay.portlet.css-class-wrapper=portlet-my-app",
    "com.liferay.portlet.header-portlet-css=/css/main.css",
    ```
  - `main.scss`:
    ```scss
    @import 'atlas-custom-properties/_variables';
    @import 'atlas-variables';

    .portlet-my-app {
    	.my-app-card {
    		background-color: $gray-100; // compiles to var(--gray-100)
    		@include media-breakpoint-up(md) {
    			display: flex;
    		}
    	}
    }
    ```
- **React component stylesheet**: `js/components/Foo/Foo.scss` (not a partial) plus `import './Foo.scss';` in `Foo.tsx`. Scope it under `.my-module-foo`.
- **Admin chrome on site pages** (sidebars, control-menu add-ons): import `cadmin-variables`, use `$cadmin-*` variables and `var(--cadmin-*)` tokens, and render inside a `.cadmin` container.
- **Linking a stylesheet from Java**: `absolutePortalURLBuilder.forWebContextStylesheet("my-web", "/css/extra.css").build()` handles both the hash and RTL.
- **Component custom properties as override hooks**: set Clay's component-level custom properties on a scoped container (`--c-slideout-sidebar-width`, `--menubar-primary-nav-link-padding`; see `side_navigation.scss`) instead of re-declaring Clay selectors.
- **Keep one declaration from flipping in RTL**: `/*!rtl:ignore*/` immediately before the declaration. It applies only to the next declaration.
- **Theme-level restyling of Clay** (theme PRs): override Clay `!default` variables or maps in the theme's `src/css/_clay_variables.scss` (for example `frontend-theme-classic/src/css/_clay_variables.scss`), and put the rest in `_custom.scss`. Do not write module CSS that targets Clay selectors globally.

## Pitfalls and side effects

- **CSS imported from JS leaks across SPA navigation.** The injected `<link>` is never removed, so after the user leaves the page, unscoped rules keep applying to later pages until a full reload. Portlet `header-portlet-css` links are `temporary` and are removed on navigation.
- **Plain `/*rtl:ignore*/` works in development but not in production.** Verified by running Sass 1.77.5 and rtlcss 4.3.0 from `modules/node_modules`. In `expanded` mode the comment survives and the declaration is not flipped. In `compressed` mode (the default `nodejs.node.env=production`) Sass strips the comment and rtlcss flips the declaration anyway. Use `/*!rtl:ignore*/`, which Sass keeps and rtlcss accepts (`rtlcss/lib/directive-parser.js:4`, `/^\s*!?\s*rtl:/`).
- **`/* @noflip */` is a theme-only convention.** `node-scripts/util/theme/r2.mjs` rewrites it to `/*rtl:ignore*/` for themes. The module pipeline calls `rtlcss.process()` directly (`processSassFiles.mjs:227`), so in modules `@noflip` has no effect.
- **Double flip.** rtlcss also flips `transform: translateX(-1px)` to `translateX(1px)`. A manual `.rtl & { transform: translateX(1px) }` therefore ends up as `translateX(-1px)` in `_rtl.css`, which puts it back to the wrong direction.
- **Renaming or deleting an entry `.scss` file changes a public URL.** `header-portlet-css` paths, `<aui:link href>`, theme `@import url()` statements and other modules may reference it, and a stale reference fails silently (no styles).
- **Tokens in CSS disable immutable caching.** Adding `@portal_ctx@`, `@base_url@` or `@theme_image_path@` to a stylesheet makes it tokenized: it needs a `themeId` and gets shorter cache headers.
- **Breakpoint confusion.** xl is 1280px in Atlas and cadmin but 1200px in Clay Base and in the old `liferay-frontend-common-css` variables. The deprecated `respond-to` uses 768/980. Mixing hand-written pixel values with Clay mixins produces gaps and overlaps.
- **`!important` utilities defeat component variants.** Adding `.text-primary` or `.mt-3` to markup that a theme or a modifier class is supposed to restyle makes that restyling impossible without `!important` as well.
- **Sass values are frozen at build time.** A theme or style book that changes `--primary` will not reach CSS compiled from `atlas-variables` alone, and dark mode (admin theme `$c-dark`, `frontend-theme-admin/src/css/_custom.scss:29`) will show light-mode colors.

## Not carried over

- **"Use utilities only for final projects that won't be extended (sites, fragments, demos)"** (`when_to_use_css_utility_classes.md` §3) and "whenever possible, use utilities over custom styles" (`when_and_how_to_create_a_new_css_component.md`). The two guidelines contradict each other, and master uses utilities throughout app JSPs. Replaced by the balanced checklist item above. See the policy flag.
- **Class and file naming rules**: hyphens and lowercase, English words, abbreviations (`.btn`, `-bg-`, `-sm-`), "do not minify simple modifiers", numeric suffixes, `context-component-modifier`, responsive particles, underscores in Portal file names vs hyphens in Clay file names, and `_fjord_sidebar_card_button.scss`-style names. These are code shape, not function. Master does not follow them consistently either: JS-adjacent Sass uses PascalCase, for example `ColorPicker.scss` and `ConditionBuilder.scss`. Only the functional parts are kept: the `_` partial semantics, prefixing and scoping for collision avoidance, and no IDs.
- **"Avoid the words left/right in class names (RTL ready)"** — naming advice. Replaced by the functional rtlcss guidance above.
- **"Prefer `.nav-link` over `.nav > a`"** — folded into the scoping item. The browser-performance argument is negligible today.
- **The `$text-color` single-variable example and the Clay `_buttons.scss` excerpt** — illustrative only.
- **The responsive examples using `flex-order`** — not a CSS property (the property is `order`). The point about DOM order is kept.
- **"Contact the Lexicon team / Clay team before contributing a component"** — the process changed now that Clay is developed in portal. See the policy flag.
- **The `clay_css_2_recipes/01-08` tutorials** (Getting started, Buttons, Text input, Checkbox/radio, Toggle switch, Clay range, Input group, Alerts), all dropped:
  - They target Portal 7.2.1 GA2 / Clay CSS 2.18.1 and describe re-skinning a **theme** as Material Design by overriding Clay variables in `/src/css/_clay_variables.scss` and `_clay_custom.scss`. They say nothing about reviewing module CSS.
  - The setup they use (`generator-liferay-theme`, `liferay-theme-tasks` from `liferay-js-themes-toolkit`) is not how master builds themes (`node-scripts build:theme`).
  - Many variable and map keys changed in Clay 3. For example, the recipes' `$btn-primary: (bg: ..., hover-bg: ...)` is now a `map-deep-merge` keyed by CSS property names (`background-color`, ...) in `clay-css/src/scss/variables/_buttons.scss:479`.
  - Hard-coded hex palettes such as `$primary-d3: #311b92` now violate `liferay/no-hardcoded-colors`. Only themes disable that rule.
  - The one durable idea, "restyle Clay through `!default` variables and maps in `_clay_variables.scss` rather than selector overrides", still holds (`frontend-theme-classic/src/css/_clay_variables.scss`; `frontend-theme-unstyled/build.gradle:85-160` injects `../clay_variables` at `// INSERT CUSTOM VARS`). It is kept as a single how-to bullet. It belongs in a theme topic.

> **⚠️ REVIEW-FLAG [outdated]:** The guideline's media-query comments do not match Clay's mixins. It says `media-breakpoint-up(sm)` means `min-width: 768px` and `media-breakpoint-down(xs)` means `max-width: 768px`. In Clay 3.167.0, `up(sm)` is `min-width: 576px`, `down(sm)` is `max-width: 767.98px` and `down(xs)` is `max-width: 575.98px`, and xl is 1280px in Atlas, not 1200px. Evidence: `modules/apps/frontend-js/frontend-js-clay-web/clay/clay-css/src/scss/mixins/_breakpoints.scss:9-82`, `functions/_global-functions.scss:571-593`, `atlas/variables/_globals.scss:441-450`. Old guideline said: "@include media-breakpoint-up(sm) { // @media (min-width: 768px)" (`guidelines/css/how_to_write_responsive_css.md`, `guidelines/css/how_to_name_the_css_classes.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The guideline links Clay's mixins to the external `liferay/clay` GitHub repo. Clay is now developed inside liferay-portal, and the GitHub repo is a read-only mirror, so Clay CSS changes and their review happen in portal PRs. Evidence: `modules/apps/frontend-js/frontend-js-clay-web/clay/AGENTS.md` ("ClayUI is now developed in `liferay-portal`"). Old guideline said: "use the [provided mixins and breakpoints](https://github.com/liferay/clay/blob/master/packages/clay-css/src/scss/bootstrap/mixins/_breakpoints.scss)" (`guidelines/css/how_to_write_responsive_css.md`).

> **⚠️ REVIEW-FLAG [policy]:** The utilities-vs-custom-CSS policy is unclear. One guideline says to prefer utilities whenever possible. The other says to use them only in final, non-extendable work. Master uses `!important` utilities widely in app markup, and Clay 3 added non-`!important` `c-` spacing utilities. The team should confirm the current stance, including whether `c-` utilities are preferred for new code. Evidence: `clay-css/src/scss/components/_utilities.scss:332-420`; `git grep -c 'c-mt-\|c-gap-\|c-p-' -- 'modules/apps/**/*.jsp' 'modules/apps/**/*.tsx'` gives 144 files. Old guideline said: "We can use these classes when we are working on a final project that you know for sure isn't going to be extended" (`guidelines/css/when_to_use_css_utility_classes.md`).

> **⚠️ REVIEW-FLAG [policy]:** Who must approve a new shared CSS component (Lexicon/UX, the Clay team, Frontend Infra) is not checkable in code. Since the Clay merge into portal, the old "contact the Clay team" step may have changed. Evidence: `modules/apps/frontend-js/frontend-js-clay-web/clay/AGENTS.md`. Old guideline said: "If your component is going to be contributed to Clay, please contact Clay team before" (`guidelines/css/when_and_how_to_create_a_new_css_component.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** `<aui:link hashedFile="<%= true %>">` resolves the hashed URL but never switches to the `_rtl` file. Unless something downstream (for example `DynamicCSSFilter`'s `_rtl` rewrite) applies to hashed `/o/` URLs, RTL users may get LTR CSS from these links. This was not verified at runtime. Evidence: `util-taglib/src/com/liferay/taglib/util/HashedFileUtil.java` (no RTL handling) vs `portal-kernel/.../portlet/render/PortletRenderUtil.java:270-284` and `AbsolutePortalURLBuilderImpl.java:148-160` (both add `_rtl`). Old guideline said: nothing (new knowledge).

> **⚠️ REVIEW-FLAG [uncertain]:** `modules/apps/commerce/commerce-shipping-engine` (and possibly `commerce-tax-engine`) ships `css/main.scss` without a `package.json`, so with `buildCSS` disabled for apps that Sass appears never to be compiled or served. Confirm it is dead code rather than compiled by some path not found here. Evidence: `modules/build.gradle:619-626`; `git ls-files modules/apps/commerce/commerce-shipping-engine` shows no `package.json` and no `header-portlet-css`. Old guideline said: nothing (new knowledge).

> **⚠️ REVIEW-FLAG [gap]:** No topic yet covers the theme build (`node-scripts build:theme`, `_clay_variables.scss`/`_custom.scss` injection, theme `r2`/`@noflip`, style books and frontend tokens, dark mode in the admin theme). Theme PRs need their own checklist. Evidence: `modules/frontend-sdk/node-scripts/util/theme/**`, `modules/apps/frontend-theme/frontend-theme-unstyled/build.gradle:60-200`, `modules/apps/frontend-token/**`. Old guideline said: the clay_css_2_recipes covered theme variable overrides for Clay 2 only (`guidelines/css/clay_css_2_recipes/01_getting_started.md`).
