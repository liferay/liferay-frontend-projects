# Layout rendering and SPA navigation

<!-- Sources: guidelines/dxp/layout_rendering.md, guidelines/dxp/sennajs_integration.md -->

**Applies when the PR touches:** `portal-impl/src/com/liferay/portal/action/{LayoutAction,RenderPortletAction}.java`, `portal-impl/src/com/liferay/portal/struts/**`, `portal-impl/src/com/liferay/portal/internal/servlet/MainServlet.java`, `portal-impl/src/com/liferay/portal/servlet/WidgetServlet.java`, `portal-impl/src/com/liferay/portal/model/impl/ThemeImpl.java`, `portal-impl/src/com/liferay/portal/layoutconfiguration/**`, `portal-web/docroot/html/common/themes/portal*.jsp`, `portal-web/docroot/WEB-INF/{struts-config,tiles-defs}.xml`, `modules/apps/layout/layout-type-controller/**`, theme templates (`portal_normal.ftl`, `portal_pop_up.ftl`, `portlet.ftl`) under `modules/apps/frontend-theme/**`; **`modules/apps/frontend-js/frontend-js-spa-web/**`**; any JS/TS that listens to SPA lifecycle events or holds global state (`window`/`document` listeners, timers, `MutationObserver`, global singletons) in portlet or fragment code. Code signals: `Liferay.SPA`, `Liferay.SPA.app`, `SPAReady`, `beforeNavigate`, `startNavigate`, `endNavigate`, `beforeScreenFlip`, `screenFlip`, `screenLoad`, `screenActivate`, `screenDeactivate`, `screenDispose`, `spaRequestTimeout`, `destroyPortlet`, `destroyOnNavigate`, `Liferay.component(`, `Liferay.destroyComponents`, `data-senna-off`, `data-senna-track`, `senna="permanent|temporary"`, `com.liferay.portlet.single-page-application`, `<single-page-application>`, `isSinglePageApplication`, `javascript.single.page.application.navigation.exception.selector`, `WebKeys.SINGLE_PAGE_APPLICATION_CLEAR_CACHE`, `FrontendSPAUtil.isEnabled`, `SPAConfiguration`, `X-PJAX`, `p_p_state=exclusive`, `p_p_state=pop_up`, `LAYOUT_CONTENT`.

## What the reviewer needs to know

### Request flow for a page

1. `/` is forwarded to the default site URL (for example `/web/guest`). Friendly URL servlets (`modules/apps/friendly-url/friendly-url-service/.../servlet/FriendlyURLServlet.java`, plus `PrivateGroupFriendlyURLServlet`/`PrivateUserFriendlyURLServlet`) resolve the layout and forward internally to `/c/portal/layout?p_l_id=...` (`FriendlyURLServlet.java:339`).
2. `/c/*` is handled by `MainServlet` → `PortalRequestProcessor` (Struts emulation; `portal-web/docroot/WEB-INF/struts-config.xml`) → `LayoutAction` (`portal-impl/src/com/liferay/portal/action/LayoutAction.java`).
3. `LayoutAction`:
   - action (`p_p_lifecycle=1`) and resource (`p_p_lifecycle=2`) phases are dispatched to the portlet container. A resource request returns only the portlet's output.
   - `p_p_state=exclusive`: `renderHeaders` + `render` of the single portlet, **no theme, no `top_head.jsp`/`bottom.jsp`** (`LayoutAction.java:419-427`).
   - otherwise calls `layout.includeLayoutContent(...)`. The layout type's `LayoutTypeController` renders the page body into `WebKeys.LAYOUT_CONTENT` **before** the theme runs (`BaseLayoutTypeControllerImpl.includeLayoutContent`). Then it forwards to the Tiles definition `portal.layout`.
4. `portal-web/docroot/html/common/themes/portal.jsp` writes `LAYOUT_CONTENT` directly for exclusive state. Otherwise it includes `portal_pop_up.jsp` (Tiles `pop_up` attribute, `p_p_state=pop_up` or `themeDisplay.isWidget()`) or `portal_normal.jsp`. `ThemeImpl` maps them to the active theme's `portal_pop_up.ftl`/`portal_normal.ftl`.
5. The theme template includes `top_head`, `body_top`, the content, `body_bottom` and `bottom` (see `resource-loading.md` for what each injects).

Layout type controllers live in `modules/apps/layout/layout-type-controller/*` (portlet, content, control-panel, display-page, embedded, empty, full-page-application, link-to-page, node, panel, url, utility, plus Calendar/DDM Form ones). Content pages and display pages render the fragment layout structure (`<liferay-layout:render-fragment-layout>`, `layout-type-controller-content/.../layout/view/content.jsp`). Widget pages (`portlet` type) also render a layout structure: the master layout's, or a default one with a single drop zone that holds the classic layout template (`layout-type-controller-portlet/.../layout/view/portlet.jsp`, `PortletLayoutDisplayContext`). Pop-up / widget state uses the theme's `pop_up` layout template through `RuntimePageUtil.processTemplate`.

Portlets are re-rendered via AJAX through `/c/portal/render_portlet` (`RenderPortletAction`, `struts-config.xml:47`). Their head resources and deferred scripts are then written inline/per portlet (`PortletRenderUtil`, `ScriptData.writeTo(writer, portletId)`).

Themes in master: `modules/apps/frontend-theme/frontend-theme-{unstyled,styled,classic,admin,dialect,cms,prism}`. Unstyled holds the base `portal_normal.ftl`/`portal_pop_up.ftl`/`portlet.ftl`.

> **⚠️ REVIEW-FLAG [outdated]:** Widget pages no longer go straight to a layout template (`.tpl`/`.ftl`) processed by `RuntimePageUtil`: they render a layout structure (master layout or default drop zone) through `liferay-layout:render-layout-structure`. Only the pop-up path still calls `RuntimePageUtil.processTemplate` directly from the controller JSP. Evidence: `modules/apps/layout/layout-type-controller/layout-type-controller-portlet/src/main/resources/META-INF/resources/layout/view/portlet.jsp`. Old guideline said: layout rendering ends with `portal_normal.ftl` and did not describe layout structures (`guidelines/dxp/layout_rendering.md`).

> **⚠️ REVIEW-FLAG [gap]:** Fragment/content-page rendering (`render-fragment-layout`, layout structure items, how fragment JS/CSS reach the page) is not covered by any old guideline. It is owned by the layout team but has frontend-infra side effects (inline resources, SPA). Evidence: `modules/apps/layout/layout-type-controller/layout-type-controller-content/src/main/resources/META-INF/resources/layout/view/content.jsp`. Old guideline said: nothing.

There is no parallel portlet rendering in master (`git grep -ln "ParallelRender\|PARALLEL_RENDER" -- '*.java'` returns nothing).

### SPA (Senna) in master

- Module: `modules/apps/frontend-js/frontend-js-spa-web`. **Senna.js is vendored and rewritten as plain ES modules inside the module** (`app/App.js`, `app/LiferayApp.js`, `screen/{Screen,RequestScreen,HtmlScreen,EventScreen,RenderURLScreen,ActionURLScreen}.js`, `surface/Surface.js`, `route/Route.js`, `cacheable/Cacheable.js`). There is no external `senna` dependency (`package.json` depends only on `frontend-js-web` and `@liferay/frontend-icons-web`).
- Bootstrap: `SPATopHeadJSPDynamicInclude` (`top_head.jsp#post`) reads the company-scoped `SPAConfiguration` and, if enabled and the current URL is not excluded, writes an ES-import script: `{init} from frontend-js-spa-web` → `init(config)`. `init` waits for `DOMContentLoaded`, creates `LiferayApp`, adds the two routes, overrides `Liferay.Util.submitForm`, sets **`Liferay.SPA = {app}`** and fires **`SPAReady`** (`resources/META-INF/resources/init.js`).
- `SPAConfiguration` (`.../internal/configuration/SPAConfiguration.java`, Instance Settings → Infrastructure): `enabled` (default `true`), `cacheExpirationTime` (default `-1` = cache off; `0` = never expires; `>0` = expiry, compared against ms in `LiferayApp.isScreenCacheExpired`), `customExcludedPaths`, `navigationExceptionSelectors` (default `:not([target="_blank"])`, `:not([data-senna-off])`, `:not([data-resource-href])`), `preloadCSS`, `requestTimeout` (`0` = none), `userNotificationTimeout` (30000 ms toast). Server code checks `FrontendSPAUtil.isEnabled(companyId)` (`FrontendSPAImpl`).
- Config sent to the client also includes:
  - default excluded paths `/c/document_library`, `/documents`, `/image`, `/o/cms/download-folder`, `/o/cms/translations` (prefixed with the path context);
  - `excludedTargetPortlets` (Users Admin, Server Admin: action URLs targeting them, directly or through `redirect`/`backURL`/`p_l_back_url`, are not SPA);
  - `portletsBlacklist`;
  - `clearScreensCache`, from request attribute `WebKeys.SINGLE_PAGE_APPLICATION_CLEAR_CACHE`, set by Asset Publisher, Bookmarks and DL;
  - valid status codes from `ServletResponseConstants`.
- Extra global navigation exception selectors can be contributed by any OSGi service with property `javascript.single.page.application.navigation.exception.selector=<css>` (CKEditor/AlloyEditor contribute `:not([data-cke-saved-href])`).
- **Routes** (`init.js`):
  - `ActionURLScreen`: same-origin URL with `p_p_lifecycle=1` and not an excluded target portlet. Uses POST, never reused from cache, and rewrites the final URL to `p_p_lifecycle=0`.
  - `RenderURLScreen`: URL not under `themeDisplay.getPathMain()` (`/c`), not starting with an excluded path, and `p_p_lifecycle` is `0` or absent. Cacheable.
  - Resource URLs (`p_p_lifecycle=2`) and `/c/...` URLs are never SPA-navigated.
- **What is intercepted** (`App.js`, `LiferayApp.js`):
  - clicks on `a` + exception selectors (and not inside `.ck-content`);
  - submits of `form` + exception selectors, except `method="get"`;
  - `Liferay.Util.submitForm` calls, same rules.
  - Clicks/submits inside a portlet in `portletsBlacklist` are left to the browser. `Liferay.Util.navigate(url)` uses SPA when `Liferay.SPA.app.canNavigate(url)`.
- **Blacklist**: deployed, active, ready portlets with `isSinglePageApplication() == false`, set by `com.liferay.portlet.single-page-application=false` (component property), `<single-page-application>false</single-page-application>` (liferay-portlet.xml) or overriding `isSinglePageApplication()`. Computed **once per company and cached** in `SPATopHeadJSPDynamicInclude._portletsBlacklistJSONArrays`.
- **Request/response**: the full page is fetched with `X-PJAX: true` and `X-Requested-With: XMLHttpRequest` (`RequestScreen.js`). The server renders a normal full page. There is a single surface, `body` (gets an id `senna_surface...` if it has none).
- **Resource tracking** (`HtmlScreen.js`):
  - Elements with `data-senna-track="permanent"` are loaded once per full page load, keyed by `id || href || src`.
  - `temporary` ones from the new page are evaluated, then the old temporaries are removed.
  - Untracked scripts in the body content are executed on every navigation.
  - `<html>` attributes and `<meta>` tags are replaced from the new document.
  - Taglibs expose the attribute as `senna="permanent|temporary"` on `<aui:script>`/`<aui:link>`/`<aui:style>`; `OutputTag` and core includes add defaults (see `resource-loading.md`).
- **The Liferay global object script** (`LiferayGlobalObjectPreAUIDynamicInclude`) is `temporary`, so `Liferay.ThemeDisplay.*`, `Liferay.authToken`, `Liferay.currentURL` are redefined on each navigation.

### Lifecycle events (all fired on the `Liferay` global; see `global-event-bus.md` for listener hygiene)

Order during a navigation:

1. `beforeNavigate` `{app, originalEvent, path}`. `LiferayApp` clears the screen cache first if `clearScreensCache` is set or a form is being submitted.
2. `startNavigate` `{app, path}`. Starts the timeout timer; a `spaRequestTimeout` event and a toast fire after `userNotificationTimeout`.
3. `screenLoad`
4. `beforeScreenFlip`. `LiferayApp` hooks `resetAllPortlets` here: `Liferay.Portlet.destroy` for every registered portlet (fires **`destroyPortlet`** and destroys components registered with that `portletId`), `Liferay.destroyComponents` for components with `destroyOnNavigate: true`, then `Liferay.destroyUnfulfilledPromises`.
5. `screenFlip`
6. `screenActivate` / `screenDeactivate` (previous screen)
7. `endNavigate` `{app, error, path}`. Re-initializes `Liferay.Layout` and resets `Liferay.DOMTaskRunner`.
8. `screenDispose`

`navigationError` is handled internally: a premature termination falls back to `window.location.href = path`, otherwise an error toast is shown.

How portlet code gets cleaned up:

- Components registered with `Liferay.component(id, instance, {portletId})` are destroyed with the portlet. `{destroyOnNavigate: true}` destroys them before the next navigation.
- `<liferay-frontend:component>` defaults to `destroyOnNavigate=true` and passes the portlet id (`ComponentTag.java`).
- React via `frontend-js-react-web` `render()` registers an unmount destroyer automatically (`destroyOnNavigate: !portletId`, `js/render.tsx`).
- Anything else (listeners on `document`/`window`/`Liferay`, intervals, observers, global singletons) must be detached by the author, typically in a `Liferay.once('destroyPortlet', ...)` handler filtered by portlet id, or `beforeNavigate`/`startNavigate` for page-level code.

> **⚠️ REVIEW-FLAG [outdated]:** Senna.js is no longer an external library (`liferay/senna.js`). It is vendored and maintained inside `frontend-js-spa-web` (`app/App.js` etc.), so Senna behavior changes are reviewed as normal portal code. Evidence: `modules/apps/frontend-js/frontend-js-spa-web/package.json`, `src/main/resources/META-INF/resources/app/App.js`. Old guideline said: "a Senna.js `App` instance is created" with links to `github.com/liferay/senna.js` (`guidelines/dxp/sennajs_integration.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The SPA globals `Liferay.SPA.navigationExceptionSelectors`, `Liferay.SPA.excludedPaths`, `Liferay.SPA.cacheExpirationTime` and the `spa.excluded.paths` property (`spa.properties`) no longer exist. Config is passed to `init(config)`, only `Liferay.SPA.app` is exposed, and custom excluded paths come from `SPAConfiguration.customExcludedPaths`. The Internet Explorer options are gone too. Evidence: `frontend-js-spa-web/src/main/resources/META-INF/resources/init.js` (`Liferay.SPA = {app}`), `SPAConfiguration.java`, `ls frontend-js-spa-web/src/main/resources` (no `spa.properties`). Old guideline said: "These paths, are visible in the global `Liferay.SPA.excludedPaths` variable" (`guidelines/dxp/sennajs_integration.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** The portal property `javascript.single.page.application.enabled` is still documented in `portal.properties` and set in some test `portal-ext.properties`, but no production code reads `PropsValues.JAVASCRIPT_SINGLE_PAGE_APPLICATION_ENABLED`. SPA is switched by `SPAConfiguration.enabled` (company scope; `.config` file or `configuration.override...SPAConfiguration_enabled`). Evidence: `git grep -n "SINGLE_PAGE_APPLICATION_ENABLED"` only hits `PropsKeys`/`PropsValues`; `build-test-tck.xml:75` disables SPA via `SPAConfiguration.config`. Old guideline said: "Disabling SPA in DXP can be done by setting adding the `javascript.single.page.application.enabled=false` key/value pair to your `portal-ext.properties` file" (`guidelines/dxp/sennajs_integration.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The portlet blacklist contains only deployed, active and ready non-SPA portlets, and it is cached per company on first use, never recomputed. Undeployed portlets are not added, and a non-SPA portlet deployed after the first page render is not blacklisted until `frontend-js-spa-web` restarts. Evidence: `SPATopHeadJSPDynamicInclude._getPortletsBlacklistJSONArray` (`computeIfAbsent`, filter `!isSinglePageApplication() && !isUndeployedPortlet() && isActive() && isReady()`). Old guideline said: "Any portlet that is set to not use 'Single Application Mode', or any portlet that is not deployed (and not ready) is automatically added to this list" (`guidelines/dxp/sennajs_integration.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** `LiferayApp` clears the screen cache on `Liferay.on('io:complete')`, but nothing in master fires `io:complete` on the `Liferay` object. With the cache enabled, screens may be stale after `fetch`-based mutations unless the server sets `SINGLE_PAGE_APPLICATION_CLEAR_CACHE`. Evidence: `git grep -n "io:complete" -- '*.js' '*.ts' '*.jsp'` only hits `LiferayApp.js`. Old guideline said: nothing.

## Review checklist

- **Global side effects in portlet/fragment JS: are they cleaned up on navigation?** With SPA on (default), the page is never unloaded: `document`/`window` listeners, `setInterval`, observers, global caches and `Liferay.on` handlers stay alive and pile up. Ask for `Liferay.component(..., {portletId})`/`destroyOnNavigate`, a `destroyPortlet` handler that detaches, or a React effect cleanup.
- **Top-level script code that runs again.** Header-portlet JS and untracked/`temporary` scripts re-run on every SPA visit. Check for duplicated listeners, duplicated custom element definitions (`customElements.define` throws on the second call), or double initialization.
- **Opting out of SPA: right granularity?** Prefer `data-senna-off` on the specific link/form, then `com.liferay.portlet.single-page-application=false` for the portlet. Disabling SPA instance-wide is a performance regression for every page; ask why. Remember the blacklist is cached (redeploy order matters in tests).
- **Downloads and non-HTML responses behind links.** A link that returns a file/JSON must be a resource URL, under an excluded path, or carry `data-senna-off`/`target="_blank"`. Otherwise SPA fetches it as a page and shows an error toast.
- **Forms.** Multipart/file upload and `method="get"` forms: GET is skipped automatically; anything else is submitted via XHR. Forms that must do a full post (e.g. a redirect to another host) need `data-senna-off`.
- **New `SPAConfiguration` fields or default changes.** These are company-scoped settings shown in Instance Settings: they need language keys, an upgrade consideration and a default that keeps current behavior.
- **Changes to `frontend-js-spa-web` routing, tracking or event order.** Every portlet depends on the event order (`beforeScreenFlip` destroys portlets before the DOM swap; `endNavigate` re-inits layout). Ask for tests in `frontend-js-spa-web/test` and playwright coverage (`modules/test/playwright/tests/frontend-taglib/spa-off` exists for the SPA-off path).
- **Server code that depends on SPA** (`FrontendSPAUtil.isEnabled`): remember it also changes which JS is loaded for guests (barebone is disabled when SPA is on, `ServicePreAction.java:1469`).
- **Exclusive / pop-up / resource rendering.** Code that assumes `top_head.jsp`/`bottom.jsp` ran (globals, deferred scripts) breaks in `exclusive` state and resource responses. In those cases `html-top` and `<aui:script>` become inline.
- **Analytics and page-view code.** Must hook `endNavigate` (as `top_js.jspf` does for Google Analytics) or it counts only full loads.

## Use cases and how-tos

- **Clean up a portlet's global listener:**
  ```js
  const handle = Liferay.on('someEvent', onSomeEvent);
  const onResize = () => { /* ... */ };
  window.addEventListener('resize', onResize);

  Liferay.once('destroyPortlet', () => {
  	handle.detach();
  	window.removeEventListener('resize', onResize);
  });
  ```
  Or register an object with a `destroy()`/`dispose()` method: `Liferay.component(id, {destroy() { ... }}, {portletId})`.
- **Run code after each SPA page change:** `Liferay.on('endNavigate', ({path}) => { ... })`. To wait for the app: `Liferay.SPA?.app ? fn() : Liferay.once('SPAReady', fn)`.
- **Exclude a link:** `<a data-senna-off="true" href="...">`. Exclude a path for a company: add it to Instance Settings → SPA → Custom Excluded Paths.
- **Make a portlet non-SPA:** `"com.liferay.portlet.single-page-application=false"` in the `@Component` properties.
- **Force fresh screens after a server-side change:** set `httpServletRequest.setAttribute(WebKeys.SINGLE_PAGE_APPLICATION_CLEAR_CACHE, Boolean.TRUE)` while rendering (pattern in `AssetPublisherPortlet.java:261`).

## Pitfalls and side effects

- "Permanent" inline scripts without an `id` are re-run on every navigation (their resource key is empty). Permanent external scripts with a changed URL are loaded again next to the old copy.
- `beforeScreenFlip` destroys every registered portlet, including portlets that exist on both pages. Portlets must re-initialize from their new markup; state that is not in the DOM or server is lost.
- React components rendered without `portletId` are unmounted on the next navigation (`destroyOnNavigate: !portletId`). Components rendered with a `portletId` are unmounted when that portlet is destroyed, which also happens on every navigation through `resetAllPortlets`.
- If the SPA request exceeds `requestTimeout`, or the response is premature/invalid, users see a toast or a full reload. Slow server rendering looks like an SPA bug.
- The SPA config is rendered per request but the blacklist and global selector list are per-company/OSGi state. Tests that toggle portlet SPA support at runtime can be flaky.
- `ActionURLScreen` POSTs and rewrites the final URL to render phase. Server code that redirects to a different origin after an action breaks the SPA navigation; it falls back to a full load only on premature termination.

## Not carried over

- Table of the twelve requests fired for `http://localhost:8080` (`/o/js_loader_config`, `/o/js_bundle_config`, `/o/js_resolve_modules`, classic theme `main.js` with `minifierType`...): it describes the AMD-loader era. Module loading is covered by the module-loading/ESM topics, and resource URLs by `resource-loading.md`.
- Inventories of `portal-impl` `Action`s and `StrutsAction` implementations, and the claim "we should expect no more `StrutsAction`s": inventory lists rot quickly, and the claim is contradicted (71 `implements StrutsAction` today vs ~28 listed; `RobotsAction`, `SitemapAction`, `RESTProxyAction`, `UpdateLayoutAction` are gone from `portal-impl/src/com/liferay/portal/action/`). Not frontend-infra review knowledge.
- `TilesUtil`/`_definitions` internals: still present (`portal-impl/src/com/liferay/portal/struts/TilesUtil.java`) but not review-relevant beyond the `portal.layout`/`pop_up` mapping above.
- `WidgetServlet` / `Liferay.Widget`: the servlet still exists (`portal-impl/src/com/liferay/portal/servlet/WidgetServlet.java`, `themeDisplay.isWidget()`), `Liferay.Widget` is gone from master JS. Only the pop-up rendering effect is kept above.
- Senna internals (screen lifecycle method list `load`/`getTitle`/`beforeUpdateHistoryPath`/..., virtual document extraction): summarized above as "full page fetched, body surface swapped, tracked resources reconciled". The vendored code is the reference.
- Images `sennajs-overview.png`, `sennajs-navigate.png`, `sennajs-content-extract.png`, `sennajs-flip.png`: they showed the same flow (link click → route → screen load into a virtual document → extract title/surface/resources → flip). Described in text above.
- "By default Senna.js in DXP will contain the required parameters ... `p_p_id`, `p_p_lifecycle`, `p_p_state` and `p_p_auth`": could not map this to any code in master (`init.js` only reads `p_p_lifecycle`/`p_p_id`). Dropped.
