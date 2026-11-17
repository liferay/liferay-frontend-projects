# React in portal

<!-- Sources: guidelines/general/react.md, guidelines/dxp/react_state_management.md -->

**Applies when the PR touches:** `**/*.jsx`, `**/*.tsx`, `**/*.js`/`*.ts` under `modules/**/src/main/resources/META-INF/resources/` that import `react`, `react-dom`, `react-dom/client`, `@liferay/frontend-js-react-web`, `@liferay/frontend-js-state-web` or `@liferay/frontend-js-state-web/react`; any `package.json` that adds or changes `react*` dependencies; `node-scripts.config.js` `exports`; JSPs using `<react:component>`; Java using `ReactRenderer`/`ComponentDescriptor`; code signals `createRoot`, `ReactDOM.render`, `unmountComponentAtNode`, `createPortal`, `flushSync`, `__reactDOMFlushSync`, `useIsMounted`, `useStateSafe`, `useEventListener`, `useLiferayState`, `State.atom(`, `State.selector(`, `Liferay.State`, `__unsafe__`, `USE_REACT_16`.

## What the reviewer needs to know

- **One React for the whole portal.** Master runs React **18.2.0** (`modules/apps/frontend-js/frontend-js-react-web/package.json`, since LPD-28139, Oct 2024). `frontend-js-react-web` is the only module that ships `react`, `react-dom`, `react-dom/client`, `react-dnd`, `react-dnd-html5-backend`, `classnames`, `formik` and `prop-types` (`frontend-js-react-web/node-scripts.config.js`). It also ships the aliases `react-16`/`react-dom-16` (16.12.0) and `react-18`/`react-dom-18`.
  - The build (`modules/frontend-sdk/node-scripts/util/esbuild/plugins/getLinkerPlugin.mjs`) uses the generated `modules/node-scripts.config.js` to make any import of a package another module exports external. That is how every module gets the shared instance. Other modules list `react` in their own `package.json` only for types, tests and version alignment. The `formatPackageJSONVersionAlignment` preflight requires that version to match `modules/package.json`.
  - Client extensions and plain ES modules get the same React through the import map: `FrontendJSReactWebDynamicJSImportMapsContributor.java` maps `react`, `react-dom`, `react-dom/client` and the `-16`/`-18` aliases.
- **Mounting.** Mount through `render()` from `@liferay/frontend-js-react-web` (`js/render.tsx`), never directly. Inside, it:
  - uses `createRoot` (`render.tsx:92`), or the legacy `ReactDOM.render` when `process.env.USE_REACT_16 === 'true'`. That flag exists only for Jest suites still on React 16 (`render.tsx:28`; `node-scripts/util/jest/getJestConfig.js` maps `react` to `react-16`).
  - registers the root with `Liferay.component(componentId, {destroy})`, using `destroyOnNavigate: !portletId` (`render.tsx:95-116`). With a `portletId`, the root unmounts when the portlet is destroyed. Without one, it unmounts on the next SPA navigation.
  - wraps the tree in `LiferayProvider` (`render.tsx:176`). This supplies the Clay `Provider` with the spritemap, the illustration spritemap and the accessibility settings (reduced motion, persistent alerts) read from `accessibilityMenuAtom` via `useLiferayState`.
  - adds the `lfr-tooltip-scope` class to the container.
  - waits for `SPAReady` if SPA is enabled but not yet initialized (`render.tsx:164`).
  - accepts `__reactDOMFlushSync: true` in `renderData`. This escape hatch keeps rendering synchronous during the React 18 migration and has about 20 callers, e.g. `batch-planner-web/.../export/edit_batch_planner_plan.jsp:41`.
- **Server-side entry point.** `<react:component module=... props=...>` (`frontend-taglib-react/.../ComponentTag.java`; attributes are only `componentId`, `data`, `module`, `props`, `servletContext` per `react.tld`) goes through `ReactRendererImpl` and `ReactRendererUtil.renderEcmaScript()` (`portal-template-react-renderer-impl`). These emit an ES import of the module and of `{render} from portal-template-react-renderer-impl`, which calls the same `frontend-js-react-web` `render()` on the placeholder's parent. `portletId` and `portletNamespace` are added to props automatically (`ReactRendererImpl.java:90-108`). The `data` attribute is deprecated in favor of `props` (`ComponentTag.java:89`).
- **Portals.** Use `ReactPortal` from `@liferay/frontend-js-react-web` (`js/ReactPortal.tsx`). It adds the `lfr-tooltip-scope` wrapper. The lint rule `@liferay/portal/no-react-dom-create-portal` enforces it.
- **Hooks exported by `@liferay/frontend-js-react-web`** (`js/index.ts`):
  - `useIsMounted()` returns an `isMounted()` function. It is set in a layout effect.
  - `useStateSafe(initial)` is `useState` whose setter does nothing after unmount.
  - `useTimeout()` / `useInterval()` return schedulers. These skip the callback after unmount and return a cancel function.
  - `useEventListener(eventName, handler, phase, target)` attaches a listener to an external target such as `window` and detaches it on unmount or when its dependencies change.
  - `usePrevious(value)`.
  - `useThunk([state, dispatch])` wraps a `useReducer` tuple so it can dispatch thunks, and drops dispatches after unmount.
  - `useBrowserTabVisibility()` is built on `useSyncExternalStore` over `visibilitychange`.
  - `ReactPortal` and `render`.
  - `useLiferayState` is **not** exported here any more (see the flag below).
- **State management.** No Redux, Recoil, Zustand or similar is used anywhere in `modules/**/package.json`. The tools in use are local `useState`, lifting state up, `useContext` plus `useReducer` (often with `useThunk`), and, for state that truly spans independent apps, the global state API:
  - `@liferay/frontend-js-state-web` exports `State`, `Atom`, `Selector` and `Immutable` (`main/index.ts`). The hook `useLiferayState` lives in the `react` submodule: `import {useLiferayState} from '@liferay/frontend-js-state-web/react'` (`react/index.ts`).
  - `State.atom(key, default)` and `State.selector(key, get => ...)` register by string key (`main/State.ts:303,391`). Re-registering a key throws in production but is allowed in development for hot reload. An atom key that clashes with a selector key, or the reverse, always throws.
  - `read`/`readAtom`/`readSelector`, `write`/`writeAtom` (writing a selector throws), and `subscribe(atomOrSelector, cb)`, which returns `{dispose}`. Selectors are memoized, and their dependency graph is tracked through the `get` they receive. Cycles throw.
  - Values are frozen with `deepFreeze`, but **only when `NODE_ENV === 'development'`** (`main/deepFreeze.ts`). In production nothing stops mutation at runtime. Only the TypeScript `Immutable<T>` type does.
  - The module sets `window.Liferay.State = State` as a side effect when it loads (`main/State.ts:534`). The public type is declared in `frontend-js-web/.../liferay/liferay.d.ts:177`.
  - Escape hatch: `Liferay.State.__unsafe__` (`State.ts:97`) offers `readKey`, `subscribeKey` and `writeKey` (each logs a one-time warning in development) plus `getAtomOrSelectorKey(key)`. FDS uses the latter to find an atom registered by another bundle (`frontend-data-set-web/.../js/api/getFDSAtom.ts`).
  - Atoms are never garbage-collected. There is no persistence, no atom families and no async values.
- **Lint already covers:** `react-hooks/rules-of-hooks` (error), `react-hooks/exhaustive-deps` (warn), `react/jsx-key`, and `react-compiler/react-compiler` as an error (`modules/.eslintrc.js:97`, lint only, with no compiler in the build). Also `@liferay/portal/no-react-dom-render`, `no-react-dom-create-portal` and `unexecuted-ismounted`, the last of which catches `if (isMounted)` without the call (`frontend-sdk/eslint-plugin/configs/portal.js:22-25`). Do not repeat these in review.

> **⚠️ REVIEW-FLAG [outdated]:** `useLiferayState` moved out of `frontend-js-react-web`. It is now `import {useLiferayState} from '@liferay/frontend-js-state-web/react'`, and `@liferay/frontend-js-react-web` no longer exports it. Evidence: `modules/apps/frontend-js/frontend-js-state-web/src/main/resources/META-INF/resources/react/index.ts`, `modules/apps/frontend-js/frontend-js-react-web/src/main/resources/META-INF/resources/js/index.ts`. Old guideline said: "`import {useLiferayState} from '@liferay/frontend-js-react-web';`" (`guidelines/dxp/react_state_management.md`).

> **⚠️ REVIEW-FLAG [outdated]:** Immutability of global state values is enforced at runtime only in development builds. The old text implied that TypeScript enforcement is enough, which holds only at compile time. Evidence: `frontend-js-state-web/.../main/deepFreeze.ts:8` (`if (process.env.NODE_ENV === 'development')`). Old guideline said: "This is enforced when accessing the API via TypeScript" (`guidelines/dxp/react_state_management.md`).

> **⚠️ REVIEW-FLAG [gap]:** `@liferay/portal/no-react-dom-render` only flags `ReactDOM.render`. Direct `createRoot()` calls bypass `render()` and are not linted. Six exist in `modules/apps` (e.g. `ai-hub-cell-js-components-web/.../WritingAssistant.tsx:254`, `site-initializer-cms/.../vertical-navigation/index.js:17`). The lint rule and its docs predate React 18. Evidence: `frontend-sdk/eslint-plugin/rules/portal/lib/rules/no-react-dom-render.js:7`, `git grep -n "createRoot(" -- 'modules/apps/**'`. Old guideline said: nothing; it predates React 18.

> **⚠️ REVIEW-FLAG [uncertain]:** Why `react-16`/`react-dom-16` are still exported through the import map, so any client extension can bind to them, and whether that is a supported contract or a migration leftover. Evidence: `FrontendJSReactWebDynamicJSImportMapsContributor.java` `_MODULE_NAMES`, `frontend-js-react-web/package.json`. Old guideline said: nothing.

## Review checklist

- **New mount point uses `render()` (or `<react:component>`), not `createRoot`/`ReactDOM.render`** — a direct root is never registered with `Liferay.component`. It is not unmounted on portlet destroy or SPA navigation, which leaks the tree and its listeners, and it misses the Clay spritemap and a11y provider (icons break, reduced-motion is ignored). Ask the author to switch to `render(Component, {portletId, ...props}, container)`.
- **`portletId` passed when the component belongs to a portlet** — without it, the root is destroyed on *every* navigation (`destroyOnNavigate: !portletId`). With a wrong one, it outlives its portlet. `<react:component>` adds `portletId` automatically. Hand-written `render()` calls need it.
- **No second copy of React** — check that the PR does not bundle React into a module through a custom esbuild config (`build:custom`), a vendored file, or a package that is not linked as global. Check `package.json` versions match `modules/package.json`. Two Reacts give "Invalid hook call" errors and contexts that do not cross bundles. For client extensions, React must be imported from the import map (`react`), not bundled, if it shares components or context with the portal.
- **New entries in `frontend-js-react-web` `exports` or a React version bump** — this changes the runtime of every React module and every client extension that uses the import map. Ask for the LPD ticket, a test plan covering several apps, and confirmation that `modules/node-scripts.config.js` was regenerated (`node-scripts generate:global-config` / preflight `checkGlobalNodeScriptsConfig`).
- **`__reactDOMFlushSync` added** — it is a migration escape hatch, not a feature. Ask why synchronous rendering is needed, usually because legacy code queries the DOM right after `render()`. Ask whether the caller can instead wait for an effect or callback.
- **Async work guarded against unmount** — fetch/promise/timer callbacks that set state should be cancellable (an `AbortController` in effect cleanup) or guarded with `useIsMounted`/`useStateSafe`/`useTimeout`/`useInterval`. React 18 no longer warns about this, so stale updates and leaked timers go unnoticed.
- **Effects that touch the outside world clean up** — `window`/`document` listeners (prefer `useEventListener`), `Liferay.on` handlers (`.detach()`), `State.subscribe` (`dispose()`), intervals and observers. Missing cleanup survives SPA navigation, because the page is not reloaded.
- **Global state only for cross-app data** — new `State.atom(...)` calls should be justified: two independent bundles or apps need to coordinate. Otherwise ask for local state or context. Atoms are never freed and their keys are a global namespace.
- **Atom keys are unique and namespaced** — a key collision throws in production only (`State.ts:305-315`), so it passes local development and fails in production. Ask for keys prefixed by module or feature, plus instance id when per-widget (FDS uses `${id}_fdsState`).
- **Atom values treated as immutable and kept small** — no in-place mutation of values read from `State`/`useLiferayState`, because production does not freeze them. Prefer several small atoms over a "kitchen sink" atom: every subscriber is notified on every write. `useLiferayState`'s setter always `deepClone`s, so every call notifies subscribers even if the value did not change.
- **`__unsafe__` use is justified** — acceptable only from JSP inline scripts or to reach an atom owned by another bundle by key (the FDS pattern). It drops type checks for readers *and* weakens guarantees for all other writers. Ask for an importable atom instead when possible.
- **Index-as-`key` on reorderable or filterable lists** — not linted (`react/no-array-index-key` is not enabled). It causes wrong reconciliation, so input values, focus and component state stick to the wrong row after a reorder or filter. Ask for a stable identity key.
- **Props from `<react:component>` are serializable and stable** — they go through `JSONSerializer.serializeDeep` (`ReactRendererUtil.java`). Functions cannot travel through props; `<react:component>` has no `propsTransformer` attribute, so either build them inside the component or use a Java `ComponentDescriptor` (`portal-template-react-renderer-api/.../ComponentDescriptor.java:40`) or a `<clay:*>` tag, which do accept `propsTransformer`. Renaming a prop breaks every JSP or template that passes it, including customers' JSP overrides.

## Use cases and how-tos

- **Mount from JSP:**
  ```jsp
  <react:component module="{MyApp} from my-module-web" props="<%= props %>" />
  ```
- **Mount from JS** (for example, a legacy entry point):
  ```js
  import {render} from '@liferay/frontend-js-react-web';
  render(MyApp, {portletId, ...props}, container);
  ```
- **Overlay outside the component's DOM:** `<ReactPortal container={document.body}>…</ReactPortal>`.
- **Shared state between two independent widgets** (TypeScript, importable atom):
  ```ts
  // my-module-web/.../atoms/fooAtom.ts
  import {State} from '@liferay/frontend-js-state-web';
  export const fooAtom = State.atom('my-module-foo', {count: 0});

  // consumer
  import {useLiferayState} from '@liferay/frontend-js-state-web/react';
  const [foo, setFoo] = useLiferayState(fooAtom);
  setFoo({...foo, count: foo.count + 1});
  ```
  Real examples: `accessibility-settings-state-web/.../index.ts:35`, `item-selector-taglib/.../atoms/imageSelectorImageAtom.ts`, `layout-content-page-editor-web/.../usePageContents.ts:53`, `commerce-frontend-js/.../utilities/atoms/cartAtom.js`.
- **Reducer with async actions:** `const [state, dispatch] = useThunk(useReducer(reducer, initial));` then `dispatch((d) => fetch(...).then(r => d({type: 'loaded', r})))`.
- **Stale closure in an interval:** use the functional updater, `setValue((v) => v + 1)`, or put the value in the dependency list. Do not close over a stale value with empty dependencies.

## Pitfalls and side effects

- React 18 automatic batching and concurrent `createRoot` mean code that reads the DOM synchronously after `render()` can break. This is the reason `__reactDOMFlushSync` exists.
- Jest suites marked `USE_REACT_16=true` (21 `package.json` scripts) run against React 16 and `@testing-library/react` 12 (`getJestConfig.js`). A passing test there does not prove React 18 behavior.
- `Liferay.State` exists only after `frontend-js-state-web` has loaded, either imported directly or through `frontend-js-react-web`'s `render()`. Inline JSP code that calls `Liferay.State` before any React app loads can find it undefined. `portal-web/docroot/html/taglib/ui/input_localized/page.jsp:456` imports `/o/frontend-js-state-web/__liferay__/index.js` explicitly before using it.
- The atom and selector registries are module-level `Map`s in `State.ts`. A bundle that ended up with its own copy of `frontend-js-state-web` would get a separate registry: atoms with the same key would silently not be shared, and `window.Liferay.State` would point to whichever copy loaded last. `getFDSAtom.ts` deliberately goes through the global `Liferay.State` for this reason (see its doc comment).
- `useEventListener` re-subscribes whenever `handler` identity changes. Pass a memoized handler or it detaches and reattaches on every render.

## Not carried over

- General React state principles (keep state local, lift state up, simplify hierarchy, `useRef`/`useMemo`/`useCallback` explanations, stale-closure tutorial) — generic React education rather than portal-specific knowledge. The review-relevant essence is kept in the checklist and how-tos.
- List of external state libraries (Flux, Redux, Undux, Recoil, Apollo, Relay) — none is used in master (`git grep` over `modules/**/package.json`). Only `formik` and `graphql-hooks` appear.
- Detailed reconciliation explanation for `key` — tutorial. Condensed into one checklist item.
- Pointer to `projects/npm-tools/packages/npm-scripts/src/typescript/README.md` for TS build — master no longer uses `@liferay/npm-scripts`. See `javascript-and-typescript.md`.
- `frontend-js-clay-sample-web` gist example — tutorial material, not review knowledge.
