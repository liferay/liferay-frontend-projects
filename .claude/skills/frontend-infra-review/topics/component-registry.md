# Component registry and lifecycle

<!-- Sources: guidelines/dxp/liferay_component.md, guidelines/dxp/liferay_frontend_component.md -->

**Applies when the PR touches:** `<liferay-frontend:component` in JSP/JSPF, `modules/apps/frontend-taglib/frontend-taglib/**/ComponentTag.java`, `liferay-frontend.tld`, `modules/apps/frontend-js/frontend-js-web/**/liferay/component.es.js`, `modules/apps/frontend-js/frontend-js-spa-web/**`, `frontend-js-web/**/liferay/portlet.js`; JS signals: `Liferay.component(`, `Liferay.componentReady(`, `Liferay.destroyComponent(`, `Liferay.destroyComponents(`, `destroyOnNavigate`, `componentId`, `':registered'`, `dispose()` / `destroy()` returned from a module's default export, `Liferay.on('destroyPortlet'`, `beforeNavigate`, `beforeScreenFlip`.

## What the reviewer needs to know

### Registry API (`modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/component.es.js`, exposed in `liferay/index.js:148-154`, typed in `liferay/liferay.d.ts`)

- **`Liferay.component(id, value, componentConfig?)`** registers a component (`component.es.js:193-244`):
  - It stores `value` and `componentConfig`, fires the global event `` `${id}:registered` ``, resolves any pending `componentReady(id)`, and returns `value`.
  - Re-registering an existing id replaces it and logs `console.warn('Component with id "…" is being registered twice…')` (`:210-219`).
  - `Liferay.component(id, null)` unregisters **without** calling `destroy`/`dispose` (`:223-226`).
- **`Liferay.component(id)`** retrieves a component. If the stored value is a function, it is called once on the first retrieval and the result replaces it (lazy init, `:196-207`).
- **`Liferay.componentReady(...ids)`** or **`Liferay.componentReady([ids])`** returns a Promise (`:253-285`):
  - One id resolves to that component; several ids resolve to an array.
  - It resolves immediately if the component is already registered.
  - It never rejects.
- **`Liferay.destroyComponent(id)`** calls `component.destroy || component.dispose` (if present), then deletes the component, its config, its promise and its lazy fn (`:294-309`).
- **`Liferay.destroyComponents(filterFn?)`**: `filterFn(component, componentConfig)` selects which components to destroy; with no filter it destroys all (`:319-332`).
- **`Liferay.destroyUnfulfilledPromises()`** drops pending `componentReady` promises. SPA calls it on `beforeScreenFlip` (`frontend-js-spa-web/.../app/LiferayApp.js:105`), so those promises never settle.
- **`componentConfig` keys the platform reads:**
  - `destroyOnNavigate` (boolean).
  - `portletId` (string).
  - `cacheState` (array of state keys). This is used by the SPA component cache (`_onStartNavigate`, `getComponentCache`) only when the component also has `isCacheable()`, `element` and `getState()`.

### Automatic destruction

- **Portlet removal, destruction or refresh** calls `Liferay.Portlet.destroyComponents(portletId)`, which destroys every component whose `componentConfig.portletId` matches (`frontend-js-web/.../liferay/portlet.js:187-191`, called at `:503`, `:546` and `:808`).
- **SPA navigation**: on `beforeScreenFlip`, `resetAllPortlets()` (`frontend-js-spa-web/src/main/resources/META-INF/resources/util/utils.js:176-192`, wired at `app/LiferayApp.js:104`) does two things:
  - Calls `Liferay.Portlet.destroy` on every portlet in `Liferay.Portlet.list`, so all portlet-scoped components are destroyed.
  - Destroys every component with `destroyOnNavigate: true`.
  - Anything registered with neither `portletId` nor `destroyOnNavigate` **survives navigation** and leaks.

### Who registers components automatically

- **`<liferay-frontend:component>`** (`modules/apps/frontend-taglib/frontend-taglib/src/main/java/com/liferay/frontend/taglib/servlet/taglib/ComponentTag.java`). TLD attributes (`liferay-frontend.tld`): `module` (required), `componentId`, `containerId`, `context`, `destroyOnNavigate`, `servletContext`.
  - `module="{Symbol} from <bundle>"` (ESM; all uses in master) or a bundle-relative AMD path (legacy).
  - Emits roughly `Liferay.component(id, new ComponentModule({...context, namespace, spritemap}[, containerId]), {destroyOnNavigate, portletId})` (`:270-308` ESM, `:194-240` AMD).
  - `componentId` defaults to `__UNNAMED_COMPONENT__<uniqueElementId>` (`:378`). **`destroyOnNavigate` defaults to `true`** (`:130,388`), and `portletId` is always passed (the empty string outside a portlet).
  - The export is invoked with **`new`**. A `class` works, as does a `function` that returns an object with `dispose()`/`destroy()`. An arrow function throws `TypeError: … is not a constructor`. A function that returns nothing registers an empty object, so nothing is cleaned up.
  - Rendering position follows the same rules as `<aui:script>`: deferred to the page-bottom module script, and inline for fragments, resource/exclusive requests and embedded portlets (`ComponentTag.isPositionInline()`, `:149-190`). See `jsp-javascript-integration.md`.
- **`<react:component>`, `ReactRenderer` and `render()` from `@liferay/frontend-js-react-web`** register a **synthetic** `{destroy}` object that unmounts the React root, not the React component. They use `{destroyOnNavigate: !portletId, portletId}` (`modules/apps/frontend-js/frontend-js-react-web/src/main/resources/META-INF/resources/js/render.tsx:95-117`). See `react-rendering.md`.
- Some legacy AUI widgets self-register, for example `frontend-js-aui-web/.../liferay/search_container.js:333` with `destroyOnNavigate: true`.

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline implies that only `destroyOnNavigate` components are destroyed on SPA navigation. In master, `resetAllPortlets()` also destroys every portlet on the page, which tears down all portlet-scoped components. `<liferay-frontend:component>` defaults to `destroyOnNavigate: true`, and React components inside a portlet use `destroyOnNavigate: false` plus `portletId`. The guideline's links to `App.es.js` and `Utils.es.js` are stale; the files are now `LiferayApp.js` and `util/utils.js`. Evidence: `frontend-js-spa-web/src/main/resources/META-INF/resources/util/utils.js:176-192`, `ComponentTag.java:130`, `render.tsx:116`. Old guideline said: "On SPA navigation all the components registered with the option `destroyOnNavigate` set to `true` are destroyed" (`guidelines/dxp/liferay_component.md`).

## Review checklist

- **The module behind `<liferay-frontend:component>` returns a disposer** — if it adds listeners (`delegate`, `addEventListener`, `Liferay.on`), timers or observers and returns nothing, they pile up on every SPA navigation and every portlet refresh. Ask for `return {dispose() {…}}`, or for a class with `dispose()`/`destroy()`.
- **The export is constructible** — an arrow function or a bound function as the default/named export breaks under `new`. A `function` declaration or a `class` is required.
- **Manual `Liferay.component(id, value)` calls pass a lifecycle config** — without `{portletId}` or `{destroyOnNavigate: true}` the component is never destroyed automatically. Ask which scope applies:
  - Portlet-bound UI uses `portletId`.
  - Page-global UI (toasts, global menus) uses `destroyOnNavigate: true`.
- **`componentId` is unique per portlet instance** — a fixed id such as `componentId="MyHandler"` collides when two instances, or two JSPs with the same id, render on one page. The duplicate-registration warning then fires, and `componentReady` consumers may get the wrong instance. Prefix ids with the namespace (`liferayPortletResponse.getNamespace() + "foo"`), or omit `componentId` when nothing looks the component up.
- **Consumers use `componentReady`, not synchronous `Liferay.component(id)`** — collected component scripts run in a deferred module script, after plain inline `<aui:script>` code. A synchronous lookup from inline code or from a sibling component is racy.
- **Code waits on `componentReady` across navigations** — pending promises are dropped on `beforeScreenFlip` and never resolve or reject. Do not build flows that expect a component from a later page.
- **Lazy (function) registrations used with `componentReady`** — `componentReady` resolves with the stored value, which is the factory function, until someone calls `Liferay.component(id)`. Consumers expecting an instance get a function.
- **`Liferay.component(id, null)` used as "destroy"** — it only unregisters, so the component's `destroy`/`dispose` never runs. Use `Liferay.destroyComponent(id)`.
- **Changes to `component.es.js`, `ComponentTag`, `portlet.js` destroy paths or `resetAllPortlets`** — these are a global contract used by hundreds of JSPs and by every React mount. Check:
  - Default values (`destroyOnNavigate=true` in the tag, `!portletId` in `render`).
  - The id generation scheme.
  - That `destroy || dispose` is still honoured.
  - That the warn-and-replace semantics are preserved for compatibility.

## Use cases and how-tos

- **Non-UI behaviour from a JSP:**
  ```jsp
  <liferay-frontend:component
  	componentId='<%= liferayPortletResponse.getNamespace() + "fileEntryHandler" %>'
  	context="<%= fileEntryHandlerContext %>"
  	module="{FileEntryHandler} from my-module-web"
  />
  ```
  ```js
  export default class FileEntryHandler {
  	constructor({namespace, ...context}) { /* attach listeners */ }
  	dispose() { /* detach */ }
  }
  ```
- **Reach a component from another script:** `Liferay.componentReady(id).then((component) => …)`. For several components, use `Liferay.componentReady(id1, id2).then(([a, b]) => …)`.
- **Keep a component alive across SPA navigation:** pass `destroyOnNavigate="<%= false %>"` on the tag. Only do this outside a portlet, or for components registered without `portletId`, because portlet destruction still removes portlet-scoped ones. Ask why it must survive.
- **Listen for registration without a Promise:** `Liferay.once(\`${id}:registered\`, fn)`.

## Pitfalls and side effects

- **The registry is a single global map shared by the whole page and by all SPA screens.** Ids are not namespaced automatically except the generated `__UNNAMED_COMPONENT__*` ones.
- **`destroyComponent` has no `try/catch`.** An exception thrown inside `dispose()` propagates out of the `destroyComponents` loop (see the flag below). Review `dispose()` implementations for defensive cleanup.
- **The SPA component cache (`cacheState`, `getComponentCache`) has no consumers in master.** Changing it is low-risk, and new code should not start depending on it without discussion. Evidence: `git grep -n "cacheState\|isCacheable" -- 'modules/apps/**/*.js' 'modules/apps/**/*.ts*'` hits only `component.es.js` and SPA screen code.
- **Portlet refresh (`Liferay.Portlet.refresh`) destroys and re-creates the portlet's components** (`portlet.js:808`). Components must tolerate being constructed again on the same page.

> **⚠️ REVIEW-FLAG [uncertain]:** `destroyComponents` calls `destroyComponent` in a plain `forEach` with no `try/catch`, so a throwing disposer seems to stop the teardown of the remaining components. The code suggests this, but runtime impact was not verified. Evidence: `component.es.js:294-332`. Old guideline said: nothing.

## Not carried over

- The links into `component.es.js#L301` / `#L326` at an old commit (`liferay_component.md`). Replaced by the current paths and line numbers above.
- "All the content will be injected on the page using `AUI_SCRIPT_DATA`" (`liferay_frontend_component.md`). Still true, and covered in `jsp-javascript-integration.md`, which describes how the collected script is emitted today.
