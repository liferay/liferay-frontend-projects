# Rendering React from JSP and Java

<!-- Sources: guidelines/dxp/react_rendering.md, guidelines/dxp/liferay_component.md (React notes), guidelines/dxp/extracting_js_from_jsps.md (react:component part) -->

**Applies when the PR touches:** JSP/JSPF with `<react:component`; Java using `ReactRenderer`, `ComponentDescriptor`, `renderReact(`; `modules/apps/frontend-taglib/frontend-taglib-react/**`; `modules/apps/portal-template/portal-template-react-renderer-{api,impl}/**`; `modules/apps/frontend-taglib/frontend-taglib-clay/**/BaseContainerTag.java` or `getHydratedModuleName()`; `modules/apps/frontend-js/frontend-js-react-web/**` (`render.tsx`, `node-scripts.config.js`, `FrontendJSReactWebDynamicJSImportMapsContributor.java`); props maps built with `HashMapBuilder.<String, Object>` for a React component; `propsTransformer`.

For client-side React concerns (hooks, state, `createRoot`, `__reactDOMFlushSync`), see `react.md`. For the registry and lifecycle, see `component-registry.md`.

## What the reviewer needs to know

### Pipeline in master

1. **`<react:component>`** (`modules/apps/frontend-taglib/frontend-taglib-react/src/main/java/com/liferay/frontend/taglib/react/servlet/taglib/ComponentTag.java`; TLD `src/main/resources/META-INF/resources/react.tld`).
   - Attributes: `module` (required), `componentId`, `props` (`Map<String, Object>`), `servletContext`, and `data`, which has been deprecated since 7.3 in favour of `props`.
   - There is **no** `propsTransformer` attribute on this tag.
   - `module="{Symbol} from <bundle>"` is used as-is (all 442 uses in master). Otherwise the bundle's resolved npm name is prepended (`getModule()`, AMD legacy).
   - It builds a `ComponentDescriptor(module, componentId, null, isPositionInLine())` and calls `ReactRenderer.renderReact(...)`.
   - `isPositionInLine()` is true for fragment renders (`p_f_id`), isolated, resource and exclusive requests, and embedded portlets (`:140-172`).
2. **`ReactRenderer`** (API: `modules/apps/portal-template/portal-template-react-renderer-api/.../ReactRenderer.java`, single method `renderReact(ComponentDescriptor, Map<String, Object> data, HttpServletRequest, Writer)`).
   - Implementation: `portal-template-react-renderer-impl/.../internal/ReactRendererImpl.java` and `ReactRendererUtil.java`.
   - It writes `<div id="reactComponent<N>"></div>` to the writer. N is a JVM-wide counter (`ReactRendererImpl.java:42`).
   - It enriches props (`_prepareProps`, `:66-115`) **only when the key is absent**: `componentId` (from the descriptor), `locale` (`LocaleUtil.toJSON(getMostRelevantLocale())`), `portletId` (`portal.getPortletId(request)`), and `portletNamespace`.
   - It adds a `JSFragment` to `ScriptData`, or writes it inline when `positionInLine`. For ESM modules the fragment imports `{render} from portal-template-react-renderer-impl`, the component (as `componentModule`), an optional `propsTransformer`, and the descriptor's `dependencies`. The code is `render(componentModule, [propsTransformer(]<serializeDeep(props)>[)], 'reactComponent<N>')` (`ReactRendererUtil.java:37-135`). The AMD variant is equivalent and uses `.default` exports (`:137-210`).
3. **`portal-template-react-renderer-impl/src/main/resources/META-INF/resources/render.es.js`** finds the placeholder and calls `render(component, props, placeholder.parentElement)` from `@liferay/frontend-js-react-web`. **The React root is the placeholder's parent element**, not the placeholder.
4. **`render()`** (`modules/apps/frontend-js/frontend-js-react-web/src/main/resources/META-INF/resources/js/render.tsx`):
   - Calls `createRoot(container)` on React 18 (`:92`), wraps the tree in Clay `Provider` and spritemap contexts, and adds `lfr-tooltip-scope` to the container.
   - Registers a synthetic `{destroy}` component that unmounts the root, with `{destroyOnNavigate: !portletId, portletId}` (`:95-117`).
   - The component id defaults to `__UNNAMED_COMPONENT__<portletId>__<n>`.
   - The component receives every prop plus `portletId`. `hasBodyContent` and `__reactDOMFlushSync` are stripped.
   - If SPA is loading, it defers to `SPAReady` (`:164-166`).
5. **Clay tags** (`frontend-taglib-clay`, `BaseContainerTag.java:346-412`) render **server-side HTML**. Only tags whose `getHydratedModuleName()` is non-null also call `ReactRenderer`. About 17 tags do, some conditionally: `Button`/`Link` only with `additionalProps`/`propsTransformer`, and `DropdownMenu` only with items. Those tags wrap their output in a dedicated `<div>` (the `_hydratedContainerElement`) so that the React root has its own parent. The details are in `taglibs.md`.

### React version and singleton

- React is a **portal-wide singleton**, `react@18.2.0` / `react-dom@18.2.0`, exported by `frontend-js-react-web`:
  - `node-scripts.config.js` `exports` (`modules/apps/frontend-js/frontend-js-react-web/node-scripts.config.js`).
  - Declared as global imports for all projects in `modules/node-scripts.config.js:201-215`.
  - Mapped in the browser import map by `FrontendJSReactWebDynamicJSImportMapsContributor` for `react`, `react-dom`, `react-dom/client`, and the `react-16`/`react-18` aliases.
- Every module's `package.json` declares `"react": "18.2.0"`. The `react-16` alias exists for tests that still need it (`render.tsx:24-28`, `USE_REACT_16`).

### Props serialization (`portal-impl/src/com/liferay/portal/json/JSONSerializerImpl.java`)

- `serializeDeep` has a fast path for `String`, `Boolean`, `Integer`, `Long`, Liferay `JSONObject`/`JSONArray`, `Map`, `Iterable` and arrays (`:65-75,131-189`).
- **`Long` values become JSON strings** (`"42"`, `:152-158`), but `Integer` stays numeric.
- Anything else (beans, `Date`, `Double`, enums, models) makes the **whole value** fall back to Jodd deep reflection serialization. That serializes every getter, recursively.
- `/` is escaped as `\/` (`:348`), so `</script>` in a string cannot break out of the inline script.
- Props end up inline in the page HTML, readable by anyone who can see the page.

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline says `ComponentDescriptor.dependencies` "is a reserved parameter… For now, it has no effect". In master each dependency becomes an ES import (`… from …`) or an AMD require of the rendered fragment, so it is loaded before `render()` runs. The placeholder is `reactComponent<N>`, not a random id, and the generated JS is an ES module import, not `Liferay.Loader.require`. Evidence: `portal-template-react-renderer-impl/.../ReactRendererUtil.java:51-62`, `ReactRendererImpl.java:42`. Old guideline said: "`dependencies`: this is a reserved parameter which can be used in the future to declare additional dependencies. For now, it has no effect." (`guidelines/dxp/react_rendering.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline says `module` must be a canonical AMD name with a version (`foo@1.3.2/js/Foo`), resolved with `NPMResolver`/`NPMResolverUtil`. In master the norm is `"{Symbol} from <bundle>"` (ESM, no version), and most `NPMResolverUtil` methods have been deprecated since 7.2. The TLD still describes `module` as "The AMD module". Evidence: `git grep -h -A2 "new ComponentDescriptor(" -- '*.java'` (28 ESM vs 5 other literals), `frontend-js-loader-modules-extender-api/.../npm/NPMResolverUtil.java:24`, `react.tld`. Old guideline said: "you need to provide the canonical name of the module (including its version number, like `foo@1.3.2/js/Foo`)" (`guidelines/dxp/react_rendering.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline says all Clay tags are created through `ReactRenderer`. In master, Clay tags emit server-side markup, and only tags with a hydrated module name (some conditionally) mount React on top of it. Evidence: `frontend-taglib-clay/.../internal/servlet/taglib/BaseContainerTag.java:346-388`, `git grep -n "protected String getHydratedModuleName" -- modules/apps/frontend-taglib/frontend-taglib-clay`. Old guideline said: "All Clay tags are supposed to extend from … `BaseContainerTag` which, in turn, leverages `…ReactRenderer`" (`guidelines/dxp/react_rendering.md`).

## Review checklist

- **`<react:component>` has its own wrapper element** — React mounts on the placeholder's **parent** and replaces that element's children. Sibling markup inside the same parent gets wiped, and two `<react:component>`s under one parent end up sharing a root container. Ask for a dedicated `<div>` (or `<span>`) around each tag; master wraps about 158 of them in a bare `<div>`.
- **Props are plain data** — check that the map holds only `String`, `Boolean`, `Integer`, `Long`, `Map`, `List`/arrays and `JSONObject`/`JSONArray`. Domain models, beans, `ThemeDisplay`, `Date` or enums trigger deep reflective serialization. That can leak fields such as passwords, tokens or internal ids, produce huge HTML, or fail on cycles. Ask for an explicit map or a `JSONObject`.
- **Data in props is safe to expose** — everything is embedded in the HTML source, so no secrets or other users' data. For large or paginated data, ask the author to fetch it from a headless API instead of inlining megabytes of JSON.
- **`Long` ids compared as numbers on the client** — they arrive as strings, so `id === 42` is false. Ask for `String(id)` comparisons or explicit conversion.
- **No HTML pre-escaping on the server for React props** — React escapes text. `HtmlUtil.escape(...)` in the props map shows `&amp;` to the user. Values that really contain HTML need `dangerouslySetInnerHTML` with server-side sanitization, so ask why.
- **`portletId` / lifecycle** — `<react:component>` adds `portletId` automatically. Java callers of `renderReact` outside a portlet request (dynamic includes, control menu, fragments) get `portletId=null`, which means `destroyOnNavigate=true`. Ask whether that is intended.
- **`componentId` only when something looks it up** — `Liferay.component(id)` returns the synthetic `{destroy}` object, never the React component or its state. Code that expects to call methods on it is wrong. Use events, `Liferay.State`, or a ref exposed via props instead. A fixed id must be unique per portlet instance (namespace it).
- **Reserved prop names are not reused with different meaning** — `componentId`, `locale`, `portletId` and `portletNamespace` are only filled in when absent, so a caller-provided value wins silently. `hasBodyContent` and `__reactDOMFlushSync` are consumed by `render()`.
- **New Java `ReactRenderer` usage** — it should be an `@Reference ReactRenderer` (OSGi) and pass the response `Writer` or JSP `out`, not a buffer that is later discarded:
  - The JS goes into the request's `ScriptData`, not into the writer, unless `positionInLine`.
  - Rendering into a `StringWriter` whose markup is dropped still leaves a script that looks for a missing placeholder. It silently does nothing (`render.es.js` checks for the element).
  - For markup returned via AJAX (resource or exclusive requests), positions are forced inline, so the caller must execute the scripts (`runScriptsInElement`).
- **A private React copy is not bundled** — a `package.json` dependency on another React version, or a bundler config that inlines `react`, breaks hooks (two Reacts) and context. React must resolve to the global import from `frontend-js-react-web`.
- **Changes to `ReactRendererImpl`, `ReactRendererUtil`, `render.es.js`, `render.tsx` or the react taglib** — these affect every React mount and every hydrated Clay tag. Check:
  - Placeholder-parent mounting.
  - Prop enrichment precedence (only when absent).
  - Inline-position rules.
  - That the AMD path still works for customer modules.

## Use cases and how-tos

- **JSP:**
  ```jsp
  <div>
  	<react:component
  		module="{AssetFilter} from my-module-web"
  		props='<%= HashMapBuilder.<String, Object>put("items", itemsJSONArray).put("readOnly", readOnly).build() %>'
  	/>
  </div>
  ```
  `AssetFilter` is a named export in the bundle's `js/index.(js|ts)`, for example `export {default as AssetFilter} from './AssetFilter';`.
- **Java (portlet, dynamic include, fragment renderer):**
  ```java
  _reactRenderer.renderReact(
  	new ComponentDescriptor("{MyIndicator} from my-module-web", "myIndicator"),
  	HashMapBuilder.<String, Object>put("count", count).build(),
  	httpServletRequest, httpServletResponse.getWriter());
  ```
  To transform props on the client (for example to add callbacks), use the five-argument constructor with `propsTransformer="{transform} from my-module-web"`. Functions cannot be serialized from Java.
- **Pure JS mount:** `render(MyApp, {portletId, ...props}, containerElement)` from `@liferay/frontend-js-react-web`. Never call `createRoot` directly (see `react.md`).

## Pitfalls and side effects

- **There is no server-side rendering.** "Render" only writes an empty placeholder plus a script, so the UI appears after JS loads. The area may shift layout, and it is empty for crawlers and for no-JS users. Reserve space with CSS if layout shift matters.
- **SPA navigation re-runs the render script, which builds a new root.** Old roots are unmounted only through the registry. Roots created outside `render()` leak.
- **Rendering inline (fragments, embedded portlets, resource requests) runs the script while the page is still parsing.** The placeholder exists, but elements after it do not.
- **The placeholder counter is JVM-wide, so ids are unique per page but not stable across requests.** Never target `#reactComponentN` from CSS or tests.
- **Changing a props key is an API change.** Customers override JSPs and call `renderReact` from their own modules with the same prop names, and the AMD `module` path is still supported for them.

> **⚠️ REVIEW-FLAG [policy]:** "Wrap each `<react:component>` in its own element" is derived from the placeholder-parent mounting in `render.es.js` and from usage in master (about 158 bare `<div>` wrappers). It is not documented or enforced anywhere. Confirm that this is the team rule. Evidence: `portal-template-react-renderer-impl/src/main/resources/META-INF/resources/render.es.js` (`element.parentElement`), `git grep -h -B1 '<react:component' -- '*.jsp'`. Old guideline said: "the React component will be mounted in the parent element of this `<div>`" (`guidelines/dxp/react_rendering.md`).

## Not carried over

- The full generated-JS sample with `Liferay.Loader.require('portal-template-react-renderer-impl@1.2.3/render.es', …)` (`react_rendering.md`). The current output is an ES module import, summarised above.
- The note that the `Writer` "is not intended to be used to write… to any place you like" (`react_rendering.md`). Folded into the checklist item on Java `ReactRenderer` usage.
- The `<clay:label>` / `<clay:alert>` samples and the Clay TLD tour (`react_rendering.md`). These belong to Clay taglib usage, which `taglibs.md` covers.
- "Both the React and non-React component accept the context in the same manner, by destructuring" (`extracting_js_from_jsps.md`). Partially true, but they differ:
  - `<liferay-frontend:component>` calls the export with `new` and injects `namespace`/`spritemap`.
  - React receives props plus `portletId`/`portletNamespace`/`locale`.
  - The current behaviour is in `component-registry.md` and `jsp-javascript-integration.md`.
