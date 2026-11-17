# Resource loading: how JS and CSS reach the page

<!-- Sources: guidelines/dxp/resource_injection.md, guidelines/dxp/resource_serving.md -->

**Applies when the PR touches:** `portal-web/docroot/html/common/themes/*.jsp*` (`top_head.jsp`, `top_js.jspf`, `bottom.jsp`, `body_top.jsp`, `body_bottom.jsp`, `*_portlet_resources_*.jspf`); `portal-web/docroot/WEB-INF/liferay-web.xml`; `portal-impl/src/com/liferay/portal/servlet/ComboServlet.java`, `portal-impl/src/com/liferay/portal/servlet/filters/{header,etag,gzip,language,aggregate,dynamiccss}/**`; `modules/apps/frontend-js/frontend-js-top-head-extender*/**`; `modules/apps/frontend-js/frontend-js-web/src/main/java/**/{hashed,resource,servlet/filter,configuration}/**`; `portal-kernel/src/com/liferay/portal/kernel/portlet/render/PortletRenderUtil.java`; `portal-kernel/src/com/liferay/portal/kernel/frontend/hashed/files/**`; `portal-kernel/src/com/liferay/portal/kernel/servlet/PortalWebResources*.java`; `util-taglib/src/com/liferay/taglib/util/{OutputTag,HtmlTopTag,HtmlBottomTag,BodyTopTag,BodyBottomTag,DynamicIncludeTag,PositionTagSupport}.java`; any new `*DynamicInclude.java`. Code signals: `implements DynamicInclude`, `extends BaseDynamicInclude`/`BaseJSPDynamicInclude`, `dynamic.include.key=`, `<liferay-util:dynamic-include`, `<liferay-util:html-top`, `<liferay-util:html-bottom`, `<liferay-util:body-top`, `<liferay-util:body-bottom`, `outputKey=`, `OutputTag.getDataSB`, `WebKeys.PAGE_TOP`/`PAGE_BOTTOM`, `TopHeadResources`, `Liferay-JS-Resources-Top-Head`, `Liferay-Top-Head-Weight`, `com.liferay.portlet.header-portlet-css`, `com.liferay.portlet.header-portlet-javascript`, `com.liferay.portlet.footer-portlet-javascript`, `header-portal-*`/`footer-portal-*`, `module:`/`nocombo:` prefixes, `PortalWebResources`, `getStaticResourceURL`, `HashedFilesRegistry`, `HashedFileUtil`, `AbsolutePortalURLBuilder`, `/combo?`, `minifierType`, `&t=`, `data-senna-track`, `cdn.host`, `javascript.fast.load`, `javascript.barebone.enabled`.

## What the reviewer needs to know

### Page skeleton and injection points, in output order

Layout content (portlets, fragments) is rendered **before** the theme template runs (`portal-impl/src/com/liferay/portal/action/LayoutAction.java:447`, `BaseLayoutTypeControllerImpl.includeLayoutContent` stores it in `WebKeys.LAYOUT_CONTENT`). That is why a portlet can register head resources, `html-top` markup or deferred scripts and still have them land in `<head>`. The theme's `portal_normal.ftl` then includes, in order (`modules/apps/frontend-theme/frontend-theme-unstyled/src/main/resources/META-INF/resources/_unstyled/templates/portal_normal.ftl`):

1. `top_head.jsp` (inside `<head>`, `portal-web/docroot/html/common/themes/top_head.jsp`):
   - `top_meta.jspf`, then dynamic includes `top_head.jsp#consent_management_platform` and `top_head.jsp#pre`
   - favicon, `clay.css` of the theme (`senna="temporary"`)
   - computes the page's portlet set (`WebKeys.LAYOUT_PORTLETS`) and writes **portlet header CSS** (`top_portlet_resources_css.jspf`)
   - `top_js.jspf`: dynamic include **`top_js.jspf#resources`** (core JS: Liferay global object, AUI, loader, import maps config, etc.), a small inline script, analytics snippets, `top_js-ext.jspf`
   - **portlet header JS** (`top_portlet_resources_js.jspf`)
   - Portlet 3 header markup (`MimeResponse.MARKUP_HEAD_ELEMENT`), then **`<liferay-util:html-top>`** content (`WebKeys.PAGE_TOP`)
   - PortletHub render state, theme **`main.css`**, layout custom CSS, per-portlet "Look and Feel" CSS
   - dynamic include `top_head.jsp#post`
2. `body_top.jsp`: `<liferay-util:body-top>` content, top messages, `body_top-ext.jsp`, dynamic include `body_top.jsp#post`
3. Layout content
4. `body_bottom.jsp`: `<liferay-util:body-bottom>` content, `body_bottom-ext.jsp`
5. `bottom.jsp`: dynamic include `bottom.jsp#pre`, **portlet footer CSS/JS**, JS logging, `bottom_js.jspf`, session timeout, **`ScriptTag.flushScriptData`** (deferred `<aui:script>`/component code, see `jsp-javascript-integration.md`), `<liferay-util:html-bottom>` content (`WebKeys.PAGE_BOTTOM`), theme **`main.js`**, `bottom-ext.jsp`, dynamic include `bottom.jsp#post`

> **⚠️ REVIEW-FLAG [outdated]:** `top_js.jspf#resources` is rendered inside `<head>` (via `top_head.jsp` including `top_js.jspf`), not at the top of `<body>`; a new key `top_head.jsp#consent_management_platform` precedes `#pre`. Evidence: `portal-web/docroot/html/common/themes/top_head.jsp:12-14,113`, `top_js.jspf:8`. Old guideline said: "`/html/common/themes/top_js.jspf#resources`: injects content right at the top of the `body`" (`guidelines/dxp/resource_injection.md`).

### `DynamicInclude`

- `portal-kernel/src/com/liferay/portal/kernel/servlet/taglib/DynamicInclude.java`; registration via the `dynamic.include.key` service property (preferred, used everywhere) or the legacy `register(DynamicIncludeRegistry)` default method. JSPs expose a key with `<liferay-util:dynamic-include key="..."/>`.
- Order inside a key = OSGi service ranking, **highest first** (`DynamicIncludeUtil.include`, `portal-kernel/.../DynamicIncludeUtil.java`); the tag's `ascendingPriority="false"` reverses it.
- Exceptions thrown by an include are **logged and swallowed** (`DynamicIncludeUtil.java`), so a broken include silently drops its output.
- Core rankings on `top_js.jspf#resources` (load order matters, later scripts depend on earlier ones): `Integer.MAX_VALUE` `LiferayGlobalObjectPreAUIDynamicInclude` (frontend-js-web) → `MAX_VALUE - 1` `AUITopHeadJSDynamicInclude` and `PortalURLBuilderImplDynamicInclude` → `MAX_VALUE - 2` `LiferayGlobalObjectPostAUIDynamicInclude` → `MAX_VALUE - 3` `JSLoaderTopHeadDynamicInclude` → default ranking (top-head extender, icons spritemap, CSP, OAuth2, client extensions) → `Integer.MIN_VALUE` `JSBundleConfigTopHeadDynamicInclude`. Import maps go to `top_head.jsp#pre` (`JSImportMapsExtenderTopHeadDynamicInclude`).
- Find current implementations with `git grep -n "dynamic.include.key=/html/common/themes/" -- '*.java'`.

### `TopHeadResources` / `frontend-js-top-head-extender`

- API `modules/apps/frontend-js/frontend-js-top-head-extender-api/.../TopHeadResources.java` (`getJsResourcePaths`, `getAuthenticatedJsResourcePaths`, `getServletContextPath`). `TopHeadExtender` (`.../internal/osgi/util/tracker/TopHeadExtender.java`) creates one per web bundle declaring `Liferay-JS-Resources-Top-Head` / `Liferay-JS-Resources-Top-Head-Authenticated` in its manifest; `Liferay-Top-Head-Weight` becomes `service.ranking`.
- `TopHeadDynamicInclude` (on `top_js.jspf#resources`) renders `javascript.everything.files`/`javascript.barebone.files` (both empty by default, deprecated in `portal.properties`) plus all `TopHeadResources` URLs, as one or more `/combo` URLs (split at ~2000 chars, timestamp = `PortalWebResourcesUtil.getLastModified("js")`) when `javascript.fast.load=true` (override per request with `js_fast_load=0`), or one `<script>` per file otherwise. Scripts are `data-senna-track="permanent"`. The URL list is cached and only rebuilt when a `TopHeadResources` service comes or goes.
- "Barebone" (only non-authenticated list) is used only when `javascript.barebone.enabled=true` **and** the user is a guest **and** SPA is disabled for the company (`portal-impl/src/com/liferay/portal/events/ServicePreAction.java:1469-1475`). With SPA on (the default), guests also get the authenticated list.

> **⚠️ REVIEW-FLAG [outdated]:** No bundle in master uses the `Liferay-JS-Resources-Top-Head*` headers any more; the core JS that used to come through them is now injected by dedicated `DynamicInclude`s with explicit rankings. The extender still works for external modules. Evidence: `git grep -n "Liferay-JS-Resources-Top-Head" -- '*.bnd'` returns nothing; `git grep -ln TopHeadResources -- '*.java'` only hits the extender modules. Old guideline said: "you can also use an easier declarative syntax" and pointed to `frontend-js-web/bnd.bnd` (`guidelines/dxp/resource_injection.md`).

> **⚠️ REVIEW-FLAG [outdated]:** Barebone vs. full list is not simply guest vs. authenticated: it also depends on SPA being disabled and on `javascript.barebone.enabled`. Evidence: `portal-impl/src/com/liferay/portal/events/ServicePreAction.java:1469-1475`. Old guideline said: "It distinguishes between guest and authenticated resources" (`guidelines/dxp/resource_injection.md`).

### Portlet header and footer resources

- Declared as portlet component properties `com.liferay.portlet.header-portlet-css`, `header-portlet-javascript`, `footer-portlet-css`, `footer-portlet-javascript` (paths relative to the portlet's web context), and `header-portal-css`/`-javascript`, `footer-portal-*` (relative to the portal context). Most portlets only use `header-portlet-css=/css/main.css` (~170 portlets); JS through these properties is rare and legacy (`/js/legacy/main.js`).
- Rendered by `PortletRenderUtil` (`portal-kernel/src/com/liferay/portal/kernel/portlet/render/PortletRenderUtil.java`):
  - URL = `[CDN base] + proxy path + context path + resource`, replaced by the **content-hashed** file when `HashedFilesRegistry` knows one; CSS gets the `_rtl` variant for RTL locales and `themeId` when the file contains `@base_url@`/`@portal_ctx@`/`@theme_image_path@` tokens.
  - Prefix `module:` renders `<script type="module">`; prefix `nocombo:` is stripped (legacy no-op: portlet resources are no longer combined).
  - Deduplicated per request (`WebKeys.PORTLET_RESOURCE_STATIC_URLS`); only emitted for `ajaxable` portlets, for the first instance of an instanceable portlet, and only if the user has VIEW permission.
  - Header CSS/JS carry `data-senna-track="temporary"`; footer resources carry no tracking attribute.
- Portlets on the layout get these in `top_head.jsp`/`bottom.jsp`. Portlets that are not known upfront (embedded with `<liferay-portlet:runtime>`/`RuntimeTag`, rendered by fragments via `PortletRegistryImpl`, or added through `UpdateLayoutStrutsAction`/`PortletRenderer`) get them written **inline next to the portlet markup**.

### `<liferay-util:html-top|html-bottom|body-top|body-bottom>` and `OutputData`

- Tags extend `OutputTag` (`util-taglib/src/com/liferay/taglib/util/OutputTag.java`) and buffer content into the request's `OutputData` under `WebKeys.PAGE_TOP`, `PAGE_BOTTOM`, `PAGE_BODY_TOP`, `PAGE_BODY_BOTTOM`. Java code can do the same through `OutputData`.
- `outputKey` deduplicates: the first tag with a given key wins, later ones are skipped. Use it for anything a portlet may render more than once.
- `OutputTag` **auto-adds `data-senna-track`** when missing: `link` → `temporary`, `script` → `permanent`, `style` → `temporary`.
- Position (`PositionTagSupport.getPositionValue`): `auto` buffers to the page position; it becomes `inline` (written in place) for resource requests, exclusive window state, isolated requests, fragment rendering (`p_f_id`) and portlets embedded in the theme/layout. Explicit `position="inline"` always writes in place.

### Serving: hashed files and `FrontendResourceFilter` (current mechanism)

- `HashedFilesRegistryImpl` (`modules/apps/frontend-js/frontend-js-web/.../hashed/files/HashedFilesRegistryImpl.java`) scans every web context for build-produced files named `name.(hash).ext` (`HashedFilesUtil`, `portal-kernel/.../frontend/hashed/files/HashedFilesUtil.java`): theme `/css/` and `/js/`, module `/META-INF/resources/`. It maps unhashed URI → hashed URI and computes one hash per web context. The hashes are produced by `modules/frontend-sdk/node-scripts` (see `build-process.md`).
- `FrontendResourceFilter` (`.../servlet/filter/FrontendResourceFilter.java`, registered `before-filter=Header Filter`, `url-pattern=/*`) serves:
  - registered `.js`, `.css`, `.map` files (hashed or unhashed URI), plus per-web-context URLs `/o/js/-/<context>(<contextHash>)/...`;
  - language modules `/o/js/language/.../all.js`.
- Caching (`FrontendResourceFilter.send`): a request URL that contains the hash → `Cache-Control: immutable, max-age=31536000, public`; otherwise `max-age=<configured>, must-revalidate` (or `no-cache`) plus an `ETag` derived from the hash, answering `304` on `If-None-Match`. JS that contains `Liferay.Language.get(` is translated at serve time (portal bundle, plus the portlet's bundle when a `<portletId>:` parameter is present) and is not immutable.
- Configuration: company-scoped `FrontendCachingConfiguration` (`.../configuration/FrontendCachingConfiguration.java`): `cachingStrategy` (`do-not-use-hashes` default, `use-one-hash-per-file`, `use-one-hash-per-web-context`, which mainly changes what URLs go into import maps), compression strategy, and max-age / send-no-cache for JS, CSS, tokenized CSS, translated JS and label modules.
- `ThemeDisplay.getMainCSSURL()`/`getClayCSSURL()`/`getMainJSURL()` and `HashedFileUtil.getURL` (util-taglib) prefer the hashed URL; they fall back to `PortalUtil.getStaticResourceURL`.

> **⚠️ REVIEW-FLAG [gap]:** Hashed files, `FrontendResourceFilter`, the per-web-context `/o/js/-/` URLs and `FrontendCachingConfiguration` were added after the old guidelines (2025 copyright) and are summarized here from code only. They deserve their own topic written by the owners (interaction with import maps, CDN and SPA). Evidence: `modules/apps/frontend-js/frontend-js-web/src/main/java/com/liferay/frontend/js/web/internal/servlet/filter/FrontendResourceFilter.java`. Old guideline said: nothing (`guidelines/dxp/resource_serving.md`).

### Serving: legacy filter chain, combo servlet and `t=` versioning

- Requests not handled above go through `liferay-web.xml` filters. `*.js`: Header Filter → ETag Filter → GZip Filter → Language Filter → Aggregate Filter. `*.css`: Header → ETag → GZip → Aggregate → Dynamic CSS.
  - **Header Filter** adds `Cache-Control: max-age=315360000, public` (10 years) and `Expires`; it skips URLs matching `(.+/-/.+|/adaptive-media/.*)`. It answers `304` when `t` is not newer than `If-Modified-Since` and omits cache headers for new sessions (`portal-impl/src/com/liferay/portal/servlet/filters/header/HeaderFilter.java`).
  - **Language Filter** replaces `Liferay.Language.get('key')` with the translated literal (`LanguageUtil.process`), so keys must be string literals.
  - **Aggregate Filter** inlines `@import url(...)` in CSS and replaces `@base_url@`, `@portal_ctx@`, `@theme_image_path@`; **Dynamic CSS Filter** only replaces tokens.
- **ComboServlet** (`portal-impl/src/com/liferay/portal/servlet/ComboServlet.java`): `/combo?<ignored params>&/path/a.js&/path/b.js`. Params `browserId`, `minifierType`, `languageId`, `t`, `themeId`, `zx` are ignored as paths; max `combo.max.files=100`; all files must share one extension (else 400); `minifierType` defaults from extension; strips source-map comments; `combo.check.timestamp=false` by default.
- **`PortalUtil.getStaticResourceURL`** (`portal-impl/src/com/liferay/portal/util/PortalImpl.java:4778`) appends `browserId`, `themeId` (CSS/JSP), `minifierType` (when fast load is on), `languageId` and **`t=`**. `t` comes from `PortalWebResourcesUtil.getPathLastModified` (falls back to the theme timestamp) or the servlet context's last-modified time. The combo `t` is `PortalWebResourcesUtil.getLastModified("js")`.
- **`PortalWebResources`** (`portal-kernel/src/com/liferay/portal/kernel/servlet/PortalWebResources.java`): `getContextPath`, `getLastModified`, `getResourceType`, `getServletContext`. Implementations: AlloyEditor, CKEditor, JS bundle config, NPM (frontend-js-web), theme contributor extender. Their `getLastModified` drives cache busting for everything combined under that resource type.
- **CDN**: `cdn.host.http`/`cdn.host.https` (disable per request with `cdn_enabled=0`), `cdn.dynamic.resources.enabled=true`. Use `ThemeDisplay.getCDNBaseURL()`/`PortalUtil.getCDNHost()`/`AbsolutePortalURLBuilder`; core includes add `crossorigin=""` to scripts when a CDN host is set.

> **⚠️ REVIEW-FLAG [outdated]:** The "Cache Filter - Resource" no longer exists; there is no server-side response cache for static resources in `liferay-web.xml`. Evidence: `grep -c "Cache Filter" portal-web/docroot/WEB-INF/liferay-web.xml` → 0. Old guideline said: "URLs ending in `.js` are routed through ... Cache Filter - Resource" (`guidelines/dxp/resource_serving.md`).

> **⚠️ REVIEW-FLAG [outdated]:** Runtime JS minification is gone: no `JavaScriptMinifier` implementation exists and `MinifierUtil` only has `minifyCss`, is `@Deprecated`, and is off by default (`minifier.enabled=false`). Minification happens at build time. Evidence: `portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java`, `portal-impl/src/portal.properties:8621`, `git grep -ln "implements JavaScriptMinifier"` → nothing. Old guideline said: "two implementations of `JavaScriptMinifier` ... `YahooJavaScriptMinifier` and `GoogleJavaScriptMinifier` (the default)" (`guidelines/dxp/resource_serving.md`).

> **⚠️ REVIEW-FLAG [outdated]:** Collecting non-inline `<aui:script>` blocks into one block at the end of the page is done by `ScriptTag` + `ScriptData` (flushed in `bottom.jsp`), not by the Aggregate Filter. Evidence: `util-taglib/src/com/liferay/taglib/aui/ScriptTag.java` (`flushScriptData`), `portal-web/docroot/html/common/themes/bottom.jsp:33`. Old guideline said: "[Aggregate Filter] also gathers all JavaScript code contained in `<aui:script>` tags (and not marked inline) into a single block" (`guidelines/dxp/resource_serving.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** `browserCacheSignature` (named in this topic's brief) does not exist in master; resource versioning is done with `t=`, content hashes and ETags. Evidence: `git grep -n browserCacheSignature` → nothing. Old guideline said: nothing.

### Client extensions

`client-extension-service` injects Global CSS CX as `<link data-senna-track="temporary">` at `top_head.jsp#post` and Global JS CX at `top_js.jspf#resources` (head) or `bottom.jsp#post` depending on the CX script location. They default to `data-senna-track="temporary"` unless the CX's script element attributes set it (`modules/apps/client-extension/client-extension-service/.../taglib/BaseDynamicInclude.java:154`). This is the supported way for customers to add page-wide JS/CSS without a module.

## Review checklist

- **New page-wide JS/CSS: is a `DynamicInclude` really needed, and on the right key?** Each include runs on every page render. Ask why it can't be portlet-scoped (`header-portlet-css`, component JS) or loaded lazily. Head keys (`#pre`, `top_js.jspf#resources`, `#post`) are render-blocking for synchronous scripts; prefer `bottom.jsp#post`, `defer`/`async` or `type="module"` unless the code must run before the body.
- **Ranking on `top_js.jspf#resources`.** A new include that needs `Liferay`/`AUI` must rank below `MAX_VALUE - 2`. Anything above `MAX_VALUE - 3` runs before the loader. Ask for an explicit `service.ranking` when order matters instead of relying on registration order.
- **Raw `<script>` emitted from Java/JSP.** It must include the CSP nonce (`ContentSecurityPolicyNonceProviderUtil.getNonceAttribute(request)`) and an explicit `data-senna-track` (see SPA below). Escape interpolated values (`HtmlUtil.escapeAttribute`, `escapeJS`).
- **Errors inside `include()` are swallowed.** Ask for a test or at least a log line; a failure leaves the page without the resource and no visible error.
- **`<liferay-util:html-top>`/`html-bottom` in a portlet JSP: is there an `outputKey`?** Without it, multiple portlet instances or re-renders duplicate the markup. Remember it becomes inline for resource/exclusive/fragment/embedded renders.
- **`data-senna-track` choice.** `permanent` = run once per full page load, kept across SPA navigations (keyed by `id`, else `href`/`src`); `temporary` = removed and re-run on every SPA navigation that brings it. Script code under `temporary` (and anything inside portlet markup) must be idempotent and must not leak global listeners.
- **Portlet resource properties.** New `header-portlet-javascript` is legacy; prefer ES modules / component JS through the build (`build-process.md`). For `header-portal-*` vs `header-portlet-*`, check the path base (portal vs portlet context). `ajaxable=false` portlets get no header/footer resources on AJAX render.
- **Cache invalidation.** Any URL served by the Header Filter is cached for 10 years by browsers and proxies. A new resource URL must change on content change: a content hash, `getStaticResourceURL` (adds `t=`), or a `PortalWebResources.getLastModified` bump for combo/bundled resources. Hard-coded `/o/my-module/file.js` in markup without `t=` or hash will serve stale content after upgrades.
- **Changes to `FrontendResourceFilter`, `HashedFilesRegistry` or caching defaults.** These affect every JS/CSS request and import maps. Check `immutable` is only sent for hash-addressed URLs, that `Vary: Accept-Encoding` is kept, and that translated JS stays non-immutable.
- **Changes to `top_head.jsp`/`bottom.jsp` order.** Theme `main.css` intentionally comes after portlet CSS (theme wins at equal specificity) and theme `main.js` after deferred scripts. Reordering breaks customer themes; treat as a breaking change.
- **CDN / proxy correctness.** Resource URLs must be built with `AbsolutePortalURLBuilder`, `PortalUtil.getPathContext()`/`getPathProxy()`, `ThemeDisplay.getCDNBaseURL()`; never concatenate `"/o/"` or `"/combo"` by hand (see `urls.md`).
- **Deprecated knobs.** Do not add entries to `javascript.barebone.files`/`javascript.everything.files`, `javascript.bundle.*` or rely on `minifier.enabled`; all are marked deprecated in `portal-impl/src/portal.properties`.

## Use cases and how-tos

- **Add a script to every page (module code):**
  ```java
  @Component(
  	property = {
  		"dynamic.include.key=/html/common/themes/bottom.jsp#post",
  		"service.ranking:Integer=100"
  	},
  	service = DynamicInclude.class
  )
  public class MyBottomDynamicInclude implements DynamicInclude {
  	public void include(HttpServletRequest request, HttpServletResponse response, String key) throws IOException {
  		PrintWriter printWriter = response.getWriter();
  		printWriter.print("<script");
  		printWriter.print(ContentSecurityPolicyNonceProviderUtil.getNonceAttribute(request));
  		printWriter.print(" data-senna-track=\"permanent\" src=\"");
  		printWriter.print(_absolutePortalURLBuilderFactory.getAbsolutePortalURLBuilder(request).forWebContextScript("my-web", "/index.js").build());
  		printWriter.print("\" type=\"text/javascript\"></script>");
  	}

  	@Reference
  	private AbsolutePortalURLBuilderFactory _absolutePortalURLBuilderFactory;
  }
  ```
  For customers / no-module scenarios the standard answer is a Global JS / Global CSS client extension.
- **Portlet stylesheet:** `"com.liferay.portlet.header-portlet-css=/css/main.css"` (SCSS compiled by the build; RTL and hashing handled automatically).
- **Head markup from a JSP, once per page:** `<liferay-util:html-top outputKey="my_module_meta"><meta ... /></liferay-util:html-top>`.
- **Module script via portlet property:** `"com.liferay.portlet.header-portlet-javascript=module:/js/main.js"` renders `type="module"`.
- **Versioned link to a static file in Java:** prefer `HashedFileUtil.getURL(request, "my-web/css/x.css")` (util-taglib; CDN- and proxy-aware, hashed when the build produced a hash) or `AbsolutePortalURLBuilder`. `PortalUtil.getStaticResourceURL(request, PortalUtil.getPathContext() + "/o/my-web/css/x.css")` adds `t=`, but see the pitfall below about what `t` tracks.

## Pitfalls and side effects

- Inline `data-senna-track="permanent"` scripts **without an `id`** have no resource key, so they are re-evaluated on every SPA navigation even though they are "permanent" (`frontend-js-spa-web/.../screen/HtmlScreen.js` `getResourceKey_` returns `''`). `html-top` scripts are auto-marked permanent, so this applies to them too.
- `permanent` external scripts are keyed by URL: if the URL changes (new `t=`, different hash, different `languageId`), the new script is loaded **in addition** to the old one on SPA navigation.
- Header-portlet JS is `temporary`: it is removed and re-executed on each SPA navigation to a page with that portlet. Top-level side effects run again.
- TopHead combo URLs are split at ~2000 characters; adding many `TopHeadResources` files adds extra blocking requests in `<head>`.
- Language Filter / translated-JS replacement only works with literal keys; `Liferay.Language.get(variable)` returns the key at runtime.
- The `TopHeadDynamicInclude` URL cache is rebuilt only when a `TopHeadResources` service changes, not when files inside a bundle change. Redeploying the same bundle re-registers it, but changes to `portal.properties` lists need a restart.
- `PortalWebResourcesUtil.getLastModified("js")` is shared by all combo URLs: bumping it (redeploying an NPM-resource module) invalidates browser caches for all combined core JS.
- The Header Filter skips cache headers on a brand-new session, so first-hit measurements differ from steady state.
- For a module path that is not a registered `PortalWebResources` context, the `t=` added by `getStaticResourceURL` is in practice the **theme's** timestamp, not the module's. Redeploying the module alone does not change the URL, while the Header Filter told browsers to cache it for 10 years. Content hashes avoid this.

> **⚠️ REVIEW-FLAG [uncertain]:** `PortalWebResourcesUtil.getPathLastModified` matches with `contextPath.startsWith(requestURI)`, which looks inverted for a full resource URI. So it almost always falls back to the default (theme timestamp). Confirm whether this is intended before relying on `t=` for module resources. Evidence: `portal-kernel/src/com/liferay/portal/kernel/servlet/PortalWebResourcesUtil.java` (`getPathLastModified`), `portal-impl/src/com/liferay/portal/util/PortalImpl.java` (`getStaticResourceURL`, timestamp branch). Old guideline said: "this filter is affected by the `t` parameter which can be used to override the `last modified` value" (`guidelines/dxp/resource_serving.md`).

## Not carried over

- Startup walkthrough of `web.xml` / `liferay-web.xml` / `InvokerFilter` and "use the debugger" advice: general background, not review knowledge.
- PNG/GIF filter chains and ETag Filter internals (`ETagUtil` checksum, `etag.response.size.max`): low review value. `ETagUtil` still exists.
- JavaScript bundle mechanism in the Aggregate Filter (`javascript.bundle.ids`, `minifierBundleId`): still in code but deprecated and unused by default (`portal-impl/src/portal.properties`, `AggregateFilter.getBundleContent`). Mentioned only as a deprecated knob.
- `TagDynamicInclude` details: still exists (`portal-kernel/.../TagDynamicInclude.java`) but is a niche extension point for taglibs, not a resource-loading concern.
- Inventory table of frontend `DynamicInclude` projects: obsolete. `frontend-compatibility-ie`, `frontend-js-jquery-web`, `frontend-js-{alert,collapse,dropdown,tabs}-support-web`, `remote-app-support-web` and `frontend-theme-font-awesome-web` no longer exist in `modules/apps`. Use the `git grep` above instead.
- Theme contributors (`Liferay-Theme-Contributor-Type`): the extender still exists, but no portal module uses the header any more (only `modules/sdk/project-templates/project-templates-theme-contributor`). Not worth a section.
