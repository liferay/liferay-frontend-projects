# Theme bleeding: keeping admin UI, product themes and customer themes apart

<!-- Sources: guidelines/dxp/how_to_minimize_bleeding_themes.md -->

**Applies when the PR touches:** CSS/SCSS in any module that renders on site pages (portlet `header-portlet-css` files, `META-INF/resources/**/*.scss`), admin UI that can appear on a site page (`modules/apps/product-navigation/**`, `modules/apps/layout/layout-content-page-editor-web/**`, `modules/apps/style-book/**`, `modules/apps/portlet-configuration/**`, `frontend-js-components-web`, modals, dropdowns and side panels opened from site pages), `modules/apps/frontend-css/frontend-css-cadmin-web/**`, `clay-css/src/scss/cadmin/**`, `clay-css/src/scss/_cadmin-variables.scss`, `clay-css/src/scss/cadmin.scss`, `frontend-theme-*/src/css/**`, `frontend-theme-*/src/templates/portal_normal.ftl`, and theme or fragment code in site initializers / client extensions (`workspaces/**`, `**/site-initializer/**`). Code signals: `cadmin`, `$cadmin-selector`, `@import 'cadmin-variables'`, `--cadmin-`, `containerProps={{className: 'cadmin'}}`, `className: 'cadmin'`, unscoped element selectors (`a {`, `h1 {`, `button {`), unscoped Clay base classes (`.btn {`, `.card {`, `.dropdown-menu {`), `!important`, `#wrapper`, `#content`, `[id^='fragment-']`, `.portlet-boundary`, `lfr-`.

## What the reviewer needs to know

### Which theme styles which page

- Site pages use the layout's theme. The default is Classic (`default.regular.theme.id=classic_WAR_classictheme`), or Prism when `LPD-57922`/`LPD-84497` is on (`portal-impl/.../ThemeFactoryUtil.java:31-37`). It can be a customer theme, Dialect, or a **Theme CSS client extension** that replaces `clay.css` and `main.css` (`ClientExtensionsServicePreAction.java:71-82`).
- The control panel uses the **Admin** theme (`control.panel.layout.regular.theme.id=admin_WAR_admintheme`, `<control-panel-theme>true`). The site theme's CSS is not loaded there, and style book values are skipped (`StyleBookScopedCSSVariablesProvider.java:121-125`).
- So bleeding in master is mainly about **admin UI rendered inside site pages**: the control menu, product menu, add panel, page editor sidebars and toppers, style book editor, omni search, quick access, and modals and dropdowns opened from them. It is also about **portlet CSS** that a module adds to every page where its portlet is placed.

### The cadmin mechanism (still the way admin UI is isolated)

- `frontend-css-cadmin-web` registers `CadminTopHeadDynamicInclude` on `top_head.jsp#pre`. For **signed-in users only**, it writes `<link id="liferayCadminCSS" href=".../frontend-css-cadmin-web/clay_admin.css">`. `clay_admin.scss` imports Clay's `cadmin.scss` plus a few extras.
- `cadmin.scss` (`clay-css/src/scss/cadmin.scss`) wraps a full Clay component set in `html#{$cadmin-selector} { .cadmin { ... } }`, with `$cadmin-selector: ':not(#__):not(#___)'` (`cadmin/variables/_globals.scss:51`). That adds **two ID-level specificity points** to every cadmin rule. `cadmin/components/_reboot.scss` resets every HTML element inside `.cadmin`.
- Load order on a site page: `clay_admin.css` (`#pre`, `top_head.jsp:14`) → theme `clay.css` (`:21`) → portlet CSS (`:108`) → theme `main.css` (`:181`) → layout and portlet custom CSS (`:183-215`) → scoped CSS variables (`#post`, `:229`). cadmin loads **first** and wins on specificity, not order. A theme rule beats cadmin only with `!important` or with a selector of three or more IDs.
- Admin colors come from `--cadmin-*` custom properties (with dark and high-contrast variants), which style books never set (see `css-custom-properties.md`).
- Markup side: the admin chrome root must carry `class="cadmin"`. Examples: `product-navigation-taglib/.../control_menu/page.jsp:17` (`cadmin control-menu-container`), `ProductMenuBodyTopDynamicInclude.java:100` (`cadmin ... lfr-product-menu-panel`), `add_content_body.jsp:18` (`cadmin ... lfr-add-panel`), `portal-web/docroot/html/taglib/ui/quick_access/page.jsp:24`, `GlobalMenu.tsx:126`, `OmniSearch.tsx:200`.
- Module stylesheets for such UI do `@import 'cadmin-variables';` and scope as `html#{$cadmin-selector} .cadmin.<component> { ... }`. Example: `product-navigation-applications-menu-web/.../css/GlobalMenu.scss`. Roughly 140 module `.scss` files use `$cadmin-selector`.
- **React portals escape the `.cadmin` ancestor.** Clay dropdowns, modals, popovers and tooltips render into `document.body` through `ClayPortal`. The page editor passes the class explicitly (`containerProps={{className: 'cadmin'}}` on modals, `menuElementAttrs={{containerProps: {className: 'cadmin'}}}` or `menuElementAttrs={{className: 'cadmin'}}` on dropdowns: `ShortcutModal.js:22`, `CustomCSSField.js:123`, `TopperItemActions.js:311-315`, `common/components/SpacingBox.js:212`). Clay's `Provider` has a `theme` prop that adds a class to all portals (`clay-provider/src/Provider.tsx:51-95`, `clay-shared/src/Portal.tsx:62-66`), but no DXP code uses it today.
- The source formatter's upgrade check `UpgradePortletFTLCheck` adds `cadmin` to `portlet.ftl` toppers and icon menus (`modules/util/source-formatter/.../check/UpgradePortletFTLCheck.java`). Customer themes are expected to mark admin chrome in their own templates too.

### Page structure (for scoping advice)

- `portal_normal.ftl` (Classic, Prism, Admin, CMS, unstyled) renders `<html data-color-scheme data-prefers-contrast>` → `body` → quick access → `div.d-flex.flex-column.min-vh-100` → control menu (`nav.cadmin.control-menu-container`) → `#wrapper` → `header#banner`, `#content`, footer. The product menu is injected by a body-top dynamic include as `.cadmin.lfr-product-menu-panel`.
- Every fragment (including widgets placed on content pages) is wrapped in an element whose ID starts with `fragment-` (`fragment-api/.../DefaultFragmentRendererContext.java:32`, `DefaultFragmentEntryProcessorContext.java:44`). Portlets render `.portlet-boundary` > `.portlet` > `.portlet-content` > `.portlet-body`.

## Review checklist

- **Admin UI that can render on a site page: is its root inside `.cadmin`?** Without it, the site theme (Classic, Dialect, a customer theme or a Theme CSS CET) restyles the control. Ask for `cadmin` on the root element and for the module CSS to be scoped under `html#{$cadmin-selector} .cadmin`, using `cadmin-variables` / `--cadmin-*`. Plain `atlas-variables` or site tokens are the wrong choice here.
- **Overlay opened from admin UI (modal, dropdown, popover, tooltip, side panel)?** It renders in `body`, outside the `.cadmin` ancestor. Check that it gets the class (`containerProps={{className: 'cadmin'}}` on `ClayModal`, `menuElementAttrs={{containerProps: {className: 'cadmin'}}}` on `ClayDropDown`, `className: 'cadmin'` on the portal container). Without it, it will look right in the control panel (Admin theme) and wrong on a Dialect or customer site.
- **`.cadmin` on something that is site content?** cadmin's reboot and 2-ID specificity override the site theme and style book inside it. Fragments or widget output wrapped in `.cadmin` lose site styling. Only admin chrome should carry the class.
- **Portlet/module CSS with unscoped selectors?** `header-portlet-css` is loaded on every page that has the portlet. `a {}`, `h1 {}`, `.btn {}`, `.card {}`, `.dropdown-menu {}`, `.modal {}` at top level restyle the theme and every other portlet. Ask for scoping to the portlet or component root class.
- **Theme CSS (Classic, Prism, Dialect, Admin, CMS, `_styled`) styling Clay base classes or elements globally?** That is expected inside a theme, but it also hits non-cadmin admin UI and customer fragments. Check that admin chrome on site pages is not affected (test signed in, with the control menu, product menu and page editor open). `_styled` changes also reach external customer themes through the npm-published `liferay-frontend-theme-styled`.
- **`!important` or ID-heavy selectors in theme or module CSS?** They are the only way to beat cadmin, so they are a bleeding risk for admin UI. Ask for a lower-specificity alternative.
- **Hardcoded colors or Atlas Sass colors in admin UI?** They ignore `--cadmin-*` dark mode and high contrast. Lint flags literals. `$cadmin-*` color variables are fine because they resolve to `var(--cadmin-*)` (`cadmin/variables/_globals.scss:239-285`). `atlas-variables` colors (`$gray-600`) and Sass color functions applied to cadmin variables are not.
- **New CSS in sample themes, site initializers or client extension themes (`workspaces/**`)?** Apply the customer advice below. These ship as examples customers copy.
- **Change to `clay_admin.scss`, `cadmin.scss`, `_cadmin-variables.scss` or `$cadmin-selector`?** It affects every admin control on every site page for every signed-in user, in every theme. Ask for testing across Classic, Prism, Dialect and a customer-like unstyled theme.

## Use cases and how-tos

- **Style a new admin control shown on site pages:**

  ```scss
  @import 'cadmin-variables';

  html#{$cadmin-selector} .cadmin.my-panel {
  	background-color: $cadmin-white; // resolves to var(--cadmin-white)
  	padding: $cadmin-spacer;
  }
  ```

  ```jsx
  <ClayModal containerProps={{className: 'cadmin'}} observer={observer}>...</ClayModal>
  ```

  Check the exact `--cadmin-*` / `$cadmin-*` names in `clay-css/src/scss/cadmin/variables/`.
- **Customer theme or sample code that must not leak into admin UI** (old guideline advice, still valid):
  - Scope site styles to content, e.g. `[id^='fragment-'] a { ... }`. The attribute selector counts as a class (low specificity) and leaves the control menu, product menu and page editor chrome alone. Admin controls rendered *inside* widgets still need case-by-case handling.
  - Do not restyle Clay base classes (`.btn`, `.card`). Add a modifier (`.btn.my-theme-btn`, `.my-theme-btn-primary`). The Clay mixin `clay-button-variant($map)` (`clay-css/src/scss/mixins/_buttons.scss`) generates all states from a Sass map.
  - Style elements through classes (`.my-theme-h1`, `.my-theme-a`), not bare `h1` / `a`, because DXP emits many unclassed elements.
- **Style one portlet's content:** scope under the portlet's root class (e.g. `.portlet-my-app`, or a component root class rendered by the JSP), never at top level.

## Pitfalls and side effects

- Testing only in the control panel hides bleeding. The control panel uses the Admin theme and no style book. Overlays without `cadmin` look right there and break on site pages. Test admin UI on a site page using Classic and Dialect (or Prism), signed in.
- `clay_admin.css` is only loaded for signed-in users. Guest pages are not affected by cadmin, and cadmin-only CSS will not style anything a guest sees.
- cadmin's specificity boost makes cadmin rules hard to override even for legitimate theme customization of admin chrome. Customers sometimes resort to `!important`, which then bleeds further. Changes to cadmin defaults are hard for customers to adjust.
- The page editor toggles `cadmin` on its viewport wrapper for non-desktop sizes (`LayoutViewport.js:110`). Be careful when moving page content in or out of that wrapper.

> **⚠️ REVIEW-FLAG [outdated]:** Admin controls on site pages are namespaced with `.cadmin` and get their own `clay_admin.css`. The old guideline's premise that they share global Clay CSS no longer holds for cadmin-scoped UI. Evidence: `frontend-css-cadmin-web/.../CadminTopHeadDynamicInclude.java`, `clay-css/src/scss/cadmin.scss:19`, `product-navigation-taglib/.../control_menu/page.jsp:17`. Old guideline said: "Liferay Portal admin controls use Clay CSS components extensively and aren't namespaced" (`guidelines/dxp/how_to_minimize_bleeding_themes.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** The old guideline said `[id^='fragment-']` excludes "fragment editor controls". The `fragment-` IDs still exist, but whether the current page editor's toppers and controls sit outside those wrappers was not verified (they are `cadmin`-marked, so they are protected either way). Evidence: `fragment-api/.../DefaultFragmentRendererContext.java:32`, `layout-content-page-editor-web/.../topper/TopperLabel.js:197`. Old guideline said: "This is preferred over using `#wrapper` ... because fragment editor controls are excluded" (`guidelines/dxp/how_to_minimize_bleeding_themes.md`).

> **⚠️ REVIEW-FLAG [policy]:** Whether new portal-owned helper classes should keep the `lfr-` prefix (as in `lfr-product-menu-panel`, `lfr-add-panel`) is a convention no tool checks. Confirm it still holds. Evidence: `git grep -n 'lfr-product-menu-panel\|lfr-add-panel'`. Old guideline said: nothing; raised by the coordinator brief.

> **⚠️ REVIEW-FLAG [gap]:** There is no team guidance on the Clay `Provider` `theme` prop as a way to scope all portals of a React admin app to `cadmin`. DXP passes `className: 'cadmin'` per overlay today, which is easy to forget. Evidence: `clay-provider/src/Provider.tsx:51-95`, `git grep 'theme="cadmin"'` finds nothing outside Clay. Old guideline said: nothing.

## Not carried over

- "This document will outline some methods to minimize bleeding CSS for 7.3" and the "Liferay 7.3 GA6 markup structure" sample (`senna_surface1-screen_5`, `#tooltipContainer`, `.alert-container`) — version-specific. The current structure is summarized above from `portal_normal.ftl`.
- The full Material-style purple button CSS and the `$my-theme-btn-primary` map — tutorial content. Kept as a one-line pointer to `clay-button-variant`.
- The `.btn` ruleset copied from Classic — it shows Classic's values at that time and goes stale.
- The intro quote about upgrading DXP 7.0 → 7.2 — anecdotal.
