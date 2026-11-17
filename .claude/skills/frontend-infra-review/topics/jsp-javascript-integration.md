# JavaScript in JSPs

<!-- Sources: guidelines/dxp/aui_script.md, guidelines/dxp/extracting_js_from_jsps.md, guidelines/dxp/namespacing.md, guidelines/dxp/liferay_frontend_component.md -->

**Applies when the PR touches:** `**/*.jsp`, `**/*.jspf` (mostly `modules/apps/*/src/main/resources/META-INF/resources/**`, `portal-web/docroot/html/**`); code signals: `<aui:script`, `sandbox=`, `use="`, `require="`, `position="inline"`, `type="module"`, `<liferay-frontend:component`, `<react:component`, `<portlet:namespace />`, `liferayPortletResponse.getNamespace()`, `Liferay.Util.ns`, `Liferay.provide(window`, `FrontendESMUtil.buildURL`, `<liferay-ui:csp`, inline `onClick=`/`onChange=` attributes, raw `<script>` in JSP; Java: `ScriptData`, `WebKeys.AUI_SCRIPT_DATA`, `JSFragment`, `ContentSecurityPolicyNonceProviderUtil`.

## What the reviewer needs to know

### How `<aui:script>` is rendered (`util-taglib/src/com/liferay/taglib/aui/ScriptTag.java`)

The tag has two modes:

- **Direct rendering** (`ScriptTag.java:104-117`): when any of `async`, `blocking`, `crossOrigin`, `defer`, `fetchPriority`, `id`, `integrity`, `referrerPolicy`, `senna`, `src` is set, or `type` is anything other than `text/javascript`, the tag writes a real `<script nonce="…">` element where it appears in the JSP. `require`, `use` and `sandbox="true"` throw a `JspException` in this mode (`:229-243`). `<aui:script type="module">` (31 uses in master) works this way: it is written in place as an ES module, so it is deferred, strict, and module-scoped. `hashedFile` rewrites `src` to a hashed URL. `senna="off"` or `senna="<value>"` becomes `data-senna-off` or `data-senna-track`.
- **Collected** (the default): the body becomes a `JSFragment` that is added to the request-scoped `ScriptData` (`WebKeys.AUI_SCRIPT_DATA`). The fragments are flushed together:
  - On a normal page render they are flushed at the bottom of the page by `ScriptTag.flushScriptData()` from `portal-web/docroot/html/common/themes/bottom.jsp:35`.
  - For isolated, exclusive and resource requests, `portal-impl/src/com/liferay/portlet/ScriptDataPortletFilter.java` flushes them per portlet at the end of that portlet's output.
  - `position="inline"` writes the fragment where the tag appears.
  - `PositionTagSupport.getPositionValue()` (`util-taglib/src/com/liferay/taglib/util/PositionTagSupport.java:47-90`) forces `inline` for fragment renders (`p_f_id`), isolated, resource and exclusive requests, and embedded portlets.

`PortletDataRendererImpl.write()` (`modules/apps/frontend-js/frontend-js-web/src/main/java/com/liferay/frontend/js/web/internal/servlet/taglib/aui/PortletDataRendererImpl.java`) writes collected fragments as **two** script elements:

1. **"Raw" fragments**: bodies with no `require`, no `use` and no ES imports, which covers plain `<aui:script>` and `sandbox`. They are concatenated, unwrapped, into one classic `<script type="text/javascript">` (`:42-50`). This script runs first.
2. **Everything else**: AMD `require`, AUI `use`, and the ES imports emitted by `<liferay-frontend:component>` and `<react:component>`. These go into a second script. It becomes `type="module"` as soon as any fragment on the page has an ES import (`:59-69`). That is the normal case, because every ESM-form `<liferay-frontend:component>` / `<react:component>` contributes one. Inside it:
   - AMD fragments are wrapped in one `Liferay.Loader.require(...)` (`:110`).
   - AUI fragments are wrapped in one `AUI().use(...)` (`:137`).
   - Each fragment is wrapped in `{ … }`, or in an IIFE for the legacy AMD and AUI kinds (`:285-300`).

Both elements get the CSP nonce.

Attribute semantics in master:

- `sandbox="<%= true %>"` wraps the body in `(function() {var $ = AUI.$;var _ = AUI._; … })();` (`ScriptTag.java:139-150`). It is still a raw fragment.
- `use="aui-base,liferay-…"`: legacy AlloyUI, about 195 uses in master. It is still supported, but it ties new code to AUI.
- `require="pkg/path as alias"` takes **AMD** modules only (`ScriptData._parseAMDRequires`). Aliases come from `VariableUtil.generateVariable` (`portal-kernel/src/com/liferay/portal/kernel/servlet/taglib/aui/VariableUtil.java`). There are **0 uses** in master JSPs.
- `use` together with `require` throws `JspException` (`ScriptTag.java:131-135`).

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline says inline `<aui:script>` code is "optimized" into "the final compressed JavaScript bundle" through the Aggregate Filter. In master, collected fragments are emitted as two inline `<script>` elements at the bottom of the page, with no aggregation into a static bundle, and inline minification is off by default. Evidence: `PortletDataRendererImpl.java:42-69`, `portal-impl/src/portal.properties:8615-8621` (`minifier.enabled=false`, deprecated). Old guideline said: "place them to be made available in the final compressed JavaScript bundle" (`guidelines/dxp/aui_script.md`).

> **⚠️ REVIEW-FLAG [outdated]:** `require` is presented as the way to "use a modern ES module" from a JSP. In master it only emits AMD `Liferay.Loader.require`, and no JSP uses it. ESM is consumed through `<aui:script type="module">` + `FrontendESMUtil.buildURL`, or through `{X} from <bundle>` in component tags. Evidence: `git grep -c 'require="' -- '*.jsp' '*.jspf'` returns 0; `ScriptData.java` `_parseAMDRequires`. Old guideline said: "Allows users to require a modern ES module" (`guidelines/dxp/aui_script.md`).

> **⚠️ REVIEW-FLAG [policy]:** The old guideline said "avoid using AlloyUI JS components and tags, except for `aui:script`". Master still ships AUI (`frontend-js-aui-web`, about 195 `use=` attributes), so the push to avoid it in new code is a team convention, not something enforced. Evidence: `git grep -h -A2 '<aui:script' -- '*.jsp' '*.jspf' | grep -c 'use="'`. Old guideline said: "Please, avoid using AlloyUI JS components and tags, except for `aui:script` tag" (`guidelines/dxp/aui_script.md`).

### Ways to get JS out of a JSP in master

- `<liferay-frontend:component module="{Foo} from my-module-web" context="<%= map %>" />` is for behaviour without UI. See `component-registry.md` for the lifecycle. All 141 `module=` values in master use the ESM `{Symbol} from <bundle>` form, which resolves to the bundle's ESM entry (`js/index.js` exports, built by `node-scripts`).
- `<react:component module="{Foo} from my-module-web" props="<%= map %>" />` is for interactive UI. See `react-rendering.md`.
- `<aui:script type="module">` with `import {x} from '<%= FrontendESMUtil.buildURL(themeDisplay, "frontend-js-web", "auto_fields") %>';` is for small glue code (`portal-kernel/src/com/liferay/portal/kernel/frontend/esm/FrontendESMUtil.java`; example `modules/apps/asset/asset-categories-admin-web/src/main/resources/META-INF/resources/category/properties.jsp:124`).

Inline JSP JavaScript is not transpiled or bundled. Whatever the JSP emits is what the browser runs.

> **⚠️ REVIEW-FLAG [outdated]:** The old guidelines pass a relative AMD path (`module="foo-bar/js/foo.js"`, `module="path/to/my/js/myComponent.js"`). Master uses only the ESM `{Symbol} from <bundle>` form, with the symbol re-exported from the bundle's `js/index.js`. The AMD path is still accepted by the tag code. Evidence: `ComponentTag.java:50` (`ESImportUtil.isESImport`); 141/141 `<liferay-frontend:component module=…>` and 442/442 `<react:component module=…>` in master use ` from `; example `modules/apps/account/account-admin-web/src/main/resources/META-INF/resources/js/index.js`. Old guideline said: "`module=\"foo-bar/js/foo.js\"` // Relative path to your new JS file" (`guidelines/dxp/extracting_js_from_jsps.md`).

### Portlet namespacing

- The portlet namespace is `_<portletId>_`, where portletId includes the instance id for instanceable portlets. Sources:
  - JSP: `<portlet:namespace />` or `liferayPortletResponse.getNamespace()`.
  - JS: `Liferay.Util.getPortletNamespace(portletId)` (`frontend-js-web/.../liferay/util/get_portlet_namespace.es.js`).
- `Liferay.Util.ns(namespace, strOrObject)` (`frontend-js-web/.../liferay/util/ns.es.js`, exposed at `liferay/index.js:308`) prefixes a string, or every key of an object, unless it is already prefixed. Use it for portlet request parameters. It is a `Liferay.Util` global only and is not exported from the `frontend-js-web` module.
- Props that the tags inject:
  - `<liferay-frontend:component>` always sets `namespace` (portletDisplay namespace) and `spritemap` in the context, **overwriting** any same-named context keys (`modules/apps/frontend-taglib/frontend-taglib/src/main/java/com/liferay/frontend/taglib/servlet/taglib/ComponentTag.java:217-227`).
  - `<react:component>` / `ReactRenderer` add `portletId`, `portletNamespace`, `locale` and `componentId`, but **not** `namespace` (`ReactRendererImpl.java:66-115`).

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline says `<liferay-frontend:component>` makes "`namespace` (or `portletNamespace`)" available. The tag injects only `namespace` and `spritemap`, and overwrites any `namespace` key in `context`. `portletNamespace` is what the React renderer injects. Evidence: `modules/apps/frontend-taglib/frontend-taglib/src/main/java/com/liferay/frontend/taglib/servlet/taglib/ComponentTag.java:217-227`, `modules/apps/portal-template/portal-template-react-renderer-impl/src/main/java/com/liferay/portal/template/react/renderer/internal/ReactRendererImpl.java:102-108`. Old guideline said: "When using this tag, `namespace`(or `portletNamespace`) and `spritemap` props will become available" (`guidelines/dxp/liferay_frontend_component.md`).
- AUI taglibs namespace both `id` and `name`:
  - `aui:input` writes `id="<%= namespace + id %>" name="<%= namespace + name %>"` (`portal-web/docroot/html/taglib/aui/input/page.jsp:150`).
  - `aui:form` has no `id` attribute; its DOM id and name are both `namespace + name` (`portal-web/docroot/html/taglib/aui/form/start.jsp:11-14`).
- Taglib attribute contract for references to other elements: an attribute named `xxxId` receives the **final DOM id** and is used as-is; an attribute named `xxxName` receives a **non-namespaced name** and the component prepends `namespace`. Example: frontend-data-set `formId` / `formName` in `modules/apps/frontend-data-set/frontend-data-set-web/src/main/resources/META-INF/resources/management_bar/controls/BulkActions.tsx:158-159` resolves `formId || \`${namespace}${formName}\``.

> **⚠️ REVIEW-FLAG [outdated]:** The old rule was "ids are not namespaced, names are namespaced". In master that holds only as a contract for taglib attributes that reference other elements (`formId` vs `formName`). The AUI form and input taglibs namespace the rendered `id` too, and `aui:form` has no `id` attribute. The guideline's `<clay:headless-data-set-display>` is now `<frontend-data-set:classic-display>` / `headless-display`. Evidence: `portal-web/docroot/html/taglib/aui/input/page.jsp:150`, `portal-web/docroot/html/taglib/aui/form/start.jsp:11-14`, `modules/apps/frontend-data-set/frontend-data-set-taglib/src/main/resources/META-INF/frontend-data-set.tld:14,183`. Old guideline said: "Unique attributes, such as `id`s, should _not_ be namespaced" (`guidelines/dxp/namespacing.md`).

### Content Security Policy (CSP)

- Configuration: `ContentSecurityPolicyConfiguration` (`modules/apps/portal-security/portal-security-content-security-policy/.../configuration/ContentSecurityPolicyConfiguration.java`). Defaults are `enabled=false` and `report-only=true`. The policy may contain `[$NONCE$]`, which `ContentSecurityPolicyFilter` replaces with `nonce-<value>` (`.../servlet/filter/ContentSecurityPolicyFilter.java:97-119`).
- Nonce lifetime (`ContentSecurityPolicyNonceManager.java:73-91`): the nonce lives for the whole session when SPA is enabled and is regenerated per request when SPA is disabled. It is exposed to JS as `window.Liferay.CSP` (`ContentSecurityPolicyTopHeadDynamicInclude.java:53`).
- Server-side emitters that add the nonce through `ContentSecurityPolicyNonceProviderUtil.getNonceAttribute()` (`portal-kernel/src/com/liferay/portal/kernel/content/security/policy/ContentSecurityPolicyNonceProviderUtil.java`):
  - `<aui:script>` in both modes (`ScriptTag.java:247-250`).
  - `PortletDataRendererImpl`.
- Raw `<script>` elements in JSPs get no nonce. Master has none outside an XSS sample.

> **⚠️ REVIEW-FLAG [policy]:** "No raw `<script>` in JSPs; use `<aui:script>`" holds in practice (one raw `<script>`, in a CKEditor XSS sample JSP), but no source-formatter check enforces it, so it needs confirmation as a team rule. Evidence: `git grep -n "<script" -- '*.jsp' '*.jspf' | grep -v aui:script` (1 hit, `frontend-editor-ckeditor4-sample-web/.../view_xss.jsp:20`); no rejecting check under `modules/util/source-formatter/src/main/java/com/liferay/source/formatter/check/`. Old guideline said: nothing; the guidelines predate CSP support.

> **⚠️ REVIEW-FLAG [gap]:** None of the old guidelines cover CSP. This section was written from master code only. A dedicated CSP topic (policy configuration, `script-src-attr`, nonce handling for Client Extensions and FreeMarker) is still missing. Evidence: `modules/apps/portal-security/portal-security-content-security-policy/`, `build-test-content-security-policy.xml`. Old guideline said: n/a.
- Client-side:
  - `Liferay.Util.runScriptsInElement` re-creates scripts with `Liferay.CSP.nonce` (`frontend-js-web/.../liferay/util/run_scripts_in_element.es.js:10-11,33-34`).
  - `Liferay.Util.setCSPNonce(html)` rewrites the nonces in markup fetched over AJAX to the document nonce (`frontend-js-web/.../liferay/util/set_csp_nonce.js`). Portlet refresh and side navigation use it.
- Inline event-handler and `style` attributes: `<liferay-ui:csp [recursive]>` (`util-taglib/src/com/liferay/taglib/ui/CSPTag.java`, used in 60 JSPs) runs `ContentSecurityPolicyHTMLRewriter.rewriteInlineAttributes`. That moves `onclick` and similar handlers into a nonced `<script>`, and `style` attributes into a nonced `<style>`, so that `script-src-attr 'none'` policies do not break them.
- CI: `build-test-content-security-policy.xml` installs CSP OSGi configs from `portal-web/test/functional/com/liferay/portalweb/tests/coreinfrastructure/security/contentsecuritypolicy/dependencies` for functional tests.

## Review checklist

- **New `<aui:script>` that is more than a few lines of glue** — collected scripts are untyped, unlinted against module imports, and re-executed on every SPA navigation. Ask for a module behind `<liferay-frontend:component module="{X} from <bundle>">`, or `<react:component>` if it renders UI. Data should come from `context` / `props`, not from JSP-interpolated JS literals.
- **New `use="…"` (AlloyUI) or new AUI APIs (`A.one`, `A.Node`, `Liferay.provide`)** — AUI is legacy. Ask whether the same can be done with DOM APIs or `frontend-js-web` exports. Accept it only when extending an existing AUI widget.
- **New `require="…"`** — it loads AMD modules only and has zero uses left in master. Suggest `<aui:script type="module">` with an `import` from `FrontendESMUtil.buildURL(...)`, or `<liferay-frontend:component>`.
- **Top-level `const`, `let`, `class` or `function` in a plain `<aui:script>`, without `sandbox`** — every raw fragment on the page is concatenated into **one** classic script, so these bindings are page globals:
  - Two portlet instances, two JSPs declaring the same name, or a JSP included twice give `SyntaxError: Identifier has already been declared`. That error kills **all** raw scripts on the page.
  - On SPA navigation the script runs again in the same global scope and hits the same error.
  - Ask for `sandbox="<%= true %>"`, or a block or module.
  - Plain `var` and function declarations silently overwrite each other instead.

  > **⚠️ REVIEW-FLAG [uncertain]:** The same-page collision follows from `_computeRawCode` concatenating all raw fragments into one script. The SPA redeclaration error is inferred from JS semantics: `runScriptsInElement` creates a new classic script with the same text in the same realm. It was not reproduced at runtime, and a few JSPs in master do declare top-level `const`/`let` in plain `<aui:script>`. Evidence: `PortletDataRendererImpl.java:42-50,362-380`, `frontend-js-web/.../liferay/util/run_scripts_in_element.es.js:6-27`, `git grep -n -A1 '^<aui:script>$' -- '*.jsp' | grep -e "-	const " -e "-	let "` (e.g. `on-demand-admin-web/.../justification.jsp:35`). Old guideline said: "`var myVar = 'foo'; // This variable will be available globally`" (`guidelines/dxp/aui_script.md`).
- **Global function names built from the namespace** (`window['<portlet:namespace />foo']`, `function <portlet:namespace />foo()`, `Liferay.provide(window, …)`) — these are the old pattern for inline `onClick` hooks, with about 416 occurrences. They leak one global per portlet instance and survive SPA navigation. In new code prefer event delegation from a module (`delegate` from `frontend-js-web`).
- **Order assumptions between a plain `<aui:script>` and a component tag** — raw fragments run **before** the module script that instantiates `<liferay-frontend:component>` / `<react:component>`, whatever their DOM order. So `Liferay.component('X')` read synchronously in an `<aui:script>` returns `undefined`. Ask for `Liferay.componentReady('X').then(...)`.
- **Hard-coded ids or names used from JS without the namespace** — `document.getElementById('fm')` breaks with multiple instances and collides across portlets. Use `'<portlet:namespace />fm'` in JSP, and `${namespace}fm` (liferay-frontend:component) or `${portletNamespace}fm` (React) in modules.
- **Taglib or component APIs that take element references** — follow the `xxxId` (final DOM id, used as-is) versus `xxxName` (non-namespaced, the component adds the namespace) contract. Ask the author to document which one an attribute expects.
- **Request parameters built in JS for portlet URLs** — they must be namespaced, using `Liferay.Util.ns(namespace, params)` or `getPortletNamespace`, unless the portlet sets `requires-namespaced-parameters=false`.
- **JSP values interpolated into JS** — `'<%= value %>'` inside `<aui:script>` is an XSS vector unless escaped with `HtmlUtil.escapeJS`. Prefer passing data via `context` / `props`, which `JSONSerializer` escapes, including `/`.
- **Raw `<script>` in a JSP, or HTML injected via `innerHTML`** — raw `<script>` has no nonce and is blocked under CSP. Use `<aui:script>`. For injected markup, use `runScriptsInElement`, and call `Liferay.Util.setCSPNonce(html)` on HTML fetched from the server before injecting it.
- **New inline `onClick=` / `onChange=` / `style=` attributes in JSP output** — these break under strict CSP (`script-src-attr`). Prefer listeners attached from JS. If they are unavoidable, wrap the output in `<liferay-ui:csp>`.
- **`position="inline"` added "to fix ordering"** — this usually hides a dependency problem. Inline scripts run while the DOM below them does not exist yet, and they bypass the per-page aggregation. Ask why `componentReady` or events are not enough.
- **Changes to `ScriptTag`, `ScriptData`, `PortletDataRendererImpl`, `PositionTagSupport` or `ScriptDataPortletFilter`** — these affect every page. Check:
  - Raw versus module partitioning.
  - Alias de-duplication (`usedAliases`).
  - Nonce emission.
  - Inline forcing for fragments, resource, exclusive and embedded rendering.
  - Ask for tests covering two instances of the same portlet and a fragment-rendered portlet.

## Use cases and how-tos

- **Move inline JS to a module (no UI):**
  ```jsp
  <liferay-frontend:component
  	context='<%= HashMapBuilder.<String, Object>put("deleteURL", deleteURL.toString()).build() %>'
  	module="{DeleteHandler} from my-module-web"
  />
  ```
  ```js
  import {delegate} from 'frontend-js-web';

  // js/DeleteHandler.js, re-exported from js/index.js:
  // export {default as DeleteHandler} from './DeleteHandler';
  export default function DeleteHandler({deleteURL, namespace}) {
  	const handle = delegate(document.getElementById(`${namespace}fm`), 'click', '.delete', () => { /* … */ });

  	return {dispose() { handle.dispose(); }};
  }
  ```
  It must be a `function` or a `class`, not an arrow function, because the tag calls it with `new`. See `component-registry.md`.
- **Small inline glue that needs a frontend-js-web helper:** use `<aui:script type="module">` with `import {x} from '<%= FrontendESMUtil.buildURL(themeDisplay, "frontend-js-web", "<submodule>") %>';`.
- **Legacy inline code that must stay:** wrap it in `sandbox="<%= true %>"` and namespace every DOM id.
- **Fetched markup containing scripts:** `container.innerHTML = Liferay.Util.setCSPNonce(html); Liferay.Util.runScriptsInElement(container);`.

## Pitfalls and side effects

- **The second collected script is an ES module.** Code inside AMD, AUI and component fragments runs in strict mode, deferred until after parsing, at module scope. Top-level names there are not globals, so code that relied on sloppy-mode behaviour or on a global defined by such a fragment can break.
- **One syntax error in any raw `<aui:script>` (for example a bad JSP interpolation) breaks every raw script on the page**, because they share one `<script>` element.
- **SPA navigation (on by default: `javascript.single.page.application.enabled=true` in `portal-impl/src/portal.properties:1818`) re-runs all page scripts.** Global listeners (`Liferay.on`, `document.addEventListener`) added from inline scripts pile up unless they are detached on `destroyPortlet` or `beforeNavigate`. About 40 JSPs use the `Liferay.on('destroyPortlet', …)` cleanup idiom.
- **Rendering mode changes ordering.** In resource or exclusive requests, fragment renders and embedded portlets, scripts are forced inline. They run as soon as they are parsed, before the rest of the page has rendered, and may run inside markup injected via AJAX.
- **With CSP on and SPA off, every request gets a new nonce.** Markup fetched later carries a different nonce than the document, so scripts and styles in it are blocked unless `setCSPNonce` or `runScriptsInElement` is used.

## Not carried over

- `require` example with `metal-clipboard` and the Metal.js module naming (`aui_script.md`). Metal.js is gone, and `require` has 0 uses in master.
- The `use="liferay-alert"` / `Liferay.Alert` example (`aui_script.md`). It is AUI-specific and obsolete for new code. The remaining review concern is covered by the checklist.
- Help-center links (help.liferay.com) and the "Remove AUI/YUI" epic link (`aui_script.md`). They are external, possibly stale, and not verifiable.
- "Make sure to follow the file structure" / "use your best judgement when splitting files" (`extracting_js_from_jsps.md`). Generic code-shape advice.
- "We don't have support for transpiling modern JS from taglibs" as the reason to use the tag (`liferay_frontend_component.md`). It is still true that nothing is transpiled, but the motivation today is lifecycle, typing and SPA cleanup, not syntax support.
