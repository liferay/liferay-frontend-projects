# Runtime utilities in `frontend-js-web` (browser detection, debounce/throttle, AOP, small helpers)

<!-- Sources: guidelines/dxp/browser_detection.md, guidelines/dxp/debounce_and_throttle.md, guidelines/dxp/aspect_oriented_programming.md -->

**Applies when the PR touches:** JS/TS that adds a home-grown helper or a new npm dependency for something `frontend-js-web` already provides. Code signals: `navigator.userAgent`, `navigator.platform`, `Liferay.Browser`, `isMobile`, `isMac`, `isFirefox`, `debounce`, `throttle`, `cancelDebounce`, `setTimeout`-based debouncing, `lodash`/`lodash.debounce`/`lodash.throttle`/`use-debounce`, `AOP.before`/`AOP.after`/`AOP.prevent`/`AOP.alterReturn`, `A.Do`, `memoize`, `uuid`, `escapeHTML`, `sub(`, `isPhone`/`isTablet`, `BREAKPOINTS`; files `frontend-js-web/**/liferay/index.js`, `**/main/index.js`, `**/main/index.d.ts`, `LiferayGlobalObjectPreAUIDynamicInclude.java`.

## What the reviewer needs to know

- **How `frontend-js-web` exports work.** `liferay/index.js` builds the globals (`Liferay.Util.*` and others) and stores the implementations in `Liferay.__INTERNALS`. The ES module entry `main/index.js` re-exports from `Liferay.__INTERNALS` and adds a few module-only helpers: `AOP`, `align`, `buildFragment`, `deepClone`, `printPage`, `dateUtils`, `mimeTypeUtils`, `getObjectValueFromPath`, `pkceChallenge`, `getFileAsBase64` and `uuidv4`. So `import {x} from 'frontend-js-web'` and `Liferay.Util.x` are the same instance.
  - Consumers declare `"frontend-js-web": "*"`.
  - Default imports are banned (`@liferay/portal/no-default-export-from-frontend-js-web`).
  - Types live in `main/index.d.ts`, which is hand-maintained and already drifts from the runtime: it declares `isReducedMotion`, which `main/index.js` does not export.
  - Some helpers are global-only: `Liferay.Util.ns`, `escape`/`unescape`, `formatXML`, `openInDialog`, `toCharCode`, `getURLWithSessionId`, `objectToURLSearchParams`.
  - Some are module-only: `throttle`, `cancelDebounce`, `AOP`, `uuidv4`.
  - Many `Liferay.Util.*` globals carry `@deprecated As of Athanasius (7.3.x), replaced by import {…} from 'frontend-js-web'`. In ES module code, import them instead of using the global.

### Browser detection: `Liferay.Browser`

- Rendered **server-side per request** from the User-Agent by `modules/apps/frontend-js/frontend-js-web/src/main/java/com/liferay/frontend/js/web/internal/servlet/taglib/LiferayGlobalObjectPreAUIDynamicInclude.java:317-353`, using `BrowserSnifferUtil` (now `portal-impl/src/com/liferay/portal/servlet/BrowserSnifferUtil.java`). It is injected into the inline `<script data-senna-track="temporary">` that defines the `Liferay` global.
- Methods are constant-returning functions: `acceptsGzip`, `getMajorVersion`, `getRevision`, `getVersion`, `isAir`, `isChrome`, `isEdge`, `isFirefox`, `isGecko`, `isIe`, `isIphone`, `isLinux`, `isMac`, `isMobile`, `isMozilla`, `isOpera`, `isRtf`, `isSafari`, `isSun`, `isWebKit`, `isWindows`.
- Legitimate current uses in master are mostly keyboard-shortcut labels (`isMac()` → `⌘` vs `Ctrl`, e.g. `product-navigation-omni-search-web/.../OmniSearch.tsx:310`, `layout-content-page-editor-web/.../ShortcutModal.js:12`) and a few targeted browser bug workarounds (`isFirefox()`, `isSafari()`).
- Viewport checks are a different thing: `isPhone()`/`isTablet()` compare `window.innerWidth` with `BREAKPOINTS` (`PHONE: 768`, `TABLET: 980`, `liferay/breakpoints.js`). They are not device detection.

### `debounce` / `throttle`

- `debounce(fn, delay)` (`liferay/debounce/debounce.es.js`; also `Liferay.Util.debounce`):
  - trailing-edge only;
  - stores the timer id on the returned function, so `cancelDebounce(debounced)` cancels it;
  - **drops `this`**: it calls `fn(...args)`;
  - returns `undefined`;
  - has no `flush`, `leading` or `maxWait`.
- `throttle(fn, interval)` (`liferay/throttle.es.js`; module export only):
  - leading call immediately, then one trailing call with the latest arguments;
  - preserves `this`;
  - has no cancel API.
- React: `useDebounce(value, delay)` from `@clayui/shared` debounces a *value*. It is used by Clay Autocomplete and data providers. `@liferay/frontend-js-react-web` has `useTimeout`/`useInterval` but no debounce hook.
- `frontend-js-lodash-web` still exists, but its configuration is `deprecated = true` behind feature flag `LPD-48975` (`frontend-js-lodash-web/.../JSLodashConfiguration.java:17`). Only `commerce-frontend-js` still depends on `lodash` directly.

### AOP (`import {AOP} from 'frontend-js-web'`)

- `main/aop/AOP.es.js` is a port of `metal-aop`. ESLint `no-metal-plugins` points `metal-aop` users here.
  - `AOP.before(fn, obj, 'method')` and `AOP.after(fn, obj, 'method')` replace `obj.method` with a dispatcher and return `{detach}`.
  - Listeners are called with the **original method arguments**, with `this` set to `obj`.
  - Return values from listeners control the flow:
    - `AOP.prevent()` (before only) skips the original method;
    - `AOP.halt(value)` stops everything and returns `value`;
    - `AOP.alterReturn(value)` (after) changes the return value.
  - `AOP.currentRetVal` and `AOP.originalRetVal` are *static*, shared across all intercepted methods.
- Only two callers in master: `journal-web/.../LocaleChangedHandler.es.js:123` and `document-library-web/.../LocaleChangedHandler.es.js` (`AOP.before(() => AOP.prevent(), …)` to suppress an AUI method). AUI's own `A.Do` / `Liferay.before(fn, obj, 'method')` still exist in legacy code.

### Other helpers worth pointing to

| Need | Use | Notes |
| --- | --- | --- |
| HTTP | `fetch` | See `requests.md`. |
| Storage, cookies | `localStorage`, `sessionStorage`, `getCookie`/`setCookie`/`checkConsent` | Consent-aware; see `session.md`. |
| Server-persisted UI state | `getSessionValue`/`setSessionValue` | See `session.md`. |
| HTML escaping | `escapeHTML`/`unescapeHTML`; `Liferay.Util.escape` | Before any `innerHTML`. |
| String templating | `sub(str, ...values)` | Used with `Liferay.Language.get`. |
| Portlet namespacing | `Liferay.Util.ns(namespace, strOrObject)`, `getPortletNamespace(portletId)` | `ns` is not a module export. |
| Portlet URLs | `createRenderURL`/`createActionURL`/`createResourceURL`/`createPortletURL` | They modify a server-provided base URL. |
| Navigation | `navigate(url)` | SPA-aware. Do not use `window.location =`. |
| Dialogs, windows | `openWindow`, `Liferay.Util.openInDialog`; `openModal`/`openToast` from `frontend-js-components-web` | |
| DOM delegation | `delegate(element, event, selector, handler)` | Returns a handle with `dispose()`. |
| Memoization | `memoize(fn)` | Unbounded `Map` cache; keys are `JSON.stringify` of object args. |
| IDs | `uuidv4()` | |
| Dates, MIME | `dateUtils`, `mimeTypeUtils` | |
| Deep clone | `deepClone` | |
| Viewport | `isPhone()`, `isTablet()`, `BREAKPOINTS` | Width-based. |
| Run inline scripts after injecting HTML | `runScriptsInElement(el)` | Respects CSP nonce (`setCSPNonce`). |
| Client Extensions | `loadClientExtensions`, `loadEditorClientExtensions`, `loadModule` | |
| Event emitters | `EventEmitter`, `EventHandler`, `Disposable` | Metal-compat classes; prefer DOM events or state atoms in new code. |

## Review checklist

- **Is the utility reinventing something in the table?** Ask for the existing `frontend-js-web` export instead of a local copy or a new npm dependency (`lodash.debounce`, `uuid`, `escape-html`, …). New third-party runtime dependencies add bundle weight and a version to maintain.
- **Browser sniffing: is it needed at all?** Prefer feature detection (`'IntersectionObserver' in window`), CSS (`@supports`, media queries, `prefers-reduced-motion`) or capability checks. Accept `Liferay.Browser` when:
  - the decision is only a label or shortcut (`isMac`);
  - or it works around a specific browser bug, with a comment naming the bug.
  - Reject raw `navigator.userAgent` parsing: `Liferay.Browser` keeps client and server in sync.
  - New code using `isIe()` is dead code.
- **`isMobile()` vs layout.** For responsive behavior, ask for CSS breakpoints or `isPhone`/`isTablet` (viewport), not UA-based `Liferay.Browser.isMobile()`. A desktop browser in a narrow window or a tablet in desktop mode gets the wrong answer from the UA.
- **Debounce vs throttle.**
  - Debounce: wait until the user stops (search-as-you-type, autosave, validation, resize-end recalculation).
  - Throttle: keep updating at a capped rate during continuous interaction (scroll or resize-driven positioning, drag feedback).
  - A debounced scroll handler gives no feedback until the scroll ends; a throttled search fires requests mid-typing.
- **Debounced functions in components:**
  - created once (`useMemo`/`useRef`), not on every render. A new debounced function per render never fires as intended;
  - cancelled on unmount (`cancelDebounce`), so the trailing call cannot `setState` after unmount or fire a stale request;
  - not relying on `this`, because `debounce` drops it.
  - `throttle` has no cancel, so guard the callback with `useIsMounted`.
- **Delay values.** Ask for the delay to be a named constant and justified. Typical values: 200–300 ms for typing, 16–100 ms for scroll and resize.
- **AOP: last resort.** Intercepting another module's methods (`AOP.before/after`, `A.Do`) creates an invisible coupling to private internals that breaks silently on refactors. Ask:
  - Is there an event, callback or extension point instead?
  - Is the handle detached when the owner is destroyed?
  - Are `AOP.currentRetVal`/`originalRetVal` avoided? They are static and race across intercepted methods.
- **`memoize` growth.** `memoize` never evicts. Do not memoize functions keyed by unbounded input (user text, ids from large lists) in long-lived pages.
- **Global vs import.** In ES modules, import from `frontend-js-web` rather than using `Liferay.Util.*` globals that are marked `@deprecated` (e.g. `Liferay.Util.isPhone`, `normalizeFriendlyURL`, `toggleDisabled`). Use globals only in JSP inline scripts or non-module code.

## Use cases and how-tos

- Debounced search in React:

  ```js
  import {cancelDebounce, debounce} from 'frontend-js-web';

  const search = useMemo(() => debounce((query) => fetchResults(query), 300), []);

  useEffect(() => () => cancelDebounce(search), [search]);
  ```

- Throttled scroll handler: `const onScroll = throttle(update, 100); window.addEventListener('scroll', onScroll, {passive: true});`. Remove the listener on cleanup, or use `useEventListener`.
- Shortcut label: `const modifier = Liferay.Browser?.isMac() ? '⌘' : 'Ctrl';`. Optional chaining keeps tests and iframes without the global working.
- Prevent a legacy method from running: `const handle = AOP.before(() => AOP.prevent(), instance, 'method');`, then `handle.detach()` on teardown.

## Pitfalls and side effects

- `Liferay.Browser` reflects the User-Agent of the request that rendered the page. Anything that serves cached HTML across browsers (full-page caches, CDNs caching HTML) can serve another browser's flags. The values also do not change on client-side UA spoofing or device emulation without a reload.
- `debounce` and `throttle` timers survive SPA navigation if they are attached to globals (`window` listeners). Always remove listeners on `destroyPortlet`/unmount.
- `AOP.after` on a method that another AOP user also wraps stacks dispatchers. Detach order matters.
- Old docs show `debounce(...)` returning a value. It always returns `undefined`.

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline points to `portal-web/docroot/html/common/themes/top_js.jspf` for `Liferay.Browser` and to `portal-kernel/.../BrowserSnifferUtil.java`. In master, `Liferay.Browser` is rendered by `LiferayGlobalObjectPreAUIDynamicInclude` in `frontend-js-web`, and `BrowserSnifferUtil` lives in `portal-impl` (`com.liferay.portal.servlet`). Evidence: `LiferayGlobalObjectPreAUIDynamicInclude.java:115,317`; `portal-impl/src/com/liferay/portal/servlet/BrowserSnifferUtil.java:26`; `top_js.jspf` has no `Browser`. Old guideline said: "use the _global_ `Liferay.Browser` (top_js.jspf) … wraps `BrowserSnifferUtil` (portal-kernel)" (`guidelines/dxp/browser_detection.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The old AOP examples show listeners receiving a `target` argument, use backtick quotes in the import, and point to `FragmentsEditorDragDrop.es.js`. In master, listeners receive the intercepted method's original arguments (with `this` set to the host object), and that file no longer exists; the real callers are the two `LocaleChangedHandler.es.js` files. Evidence: `frontend-js-web/.../main/aop/AOP.es.js` (`exec`: `this.before_[i].apply(this.obj_, args)`); `git ls-files | grep FragmentsEditorDragDrop` (no result). Old guideline said: "AOP.after(target => { return AOP.alterReturn(...) }, foo, 'bar')" (`guidelines/dxp/aspect_oriented_programming.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** I could not confirm whether HTML that embeds the UA-derived `Liferay.Browser` can be served from a page or CDN cache to a different browser in supported deployments. Evidence: `LiferayGlobalObjectPreAUIDynamicInclude.java:317-353` renders per request; caching behavior depends on deployment. Old guideline said: "both the server (java) and client (js) will be in 'sync'" (`guidelines/dxp/browser_detection.md`).

> **⚠️ REVIEW-FLAG [gap]:** `main/index.d.ts` is hand-written and drifts from `main/index.js`: it declares `isReducedMotion`, which is not exported, and the export lists differ. No check keeps them aligned, so reviewers cannot trust the typings as the API list. Evidence: `frontend-js-web/.../main/index.d.ts:861` vs `main/index.js`. Old guideline said: nothing on this.

## Not carried over

- The definitions of higher-order functions and generic explanations of debounce vs throttle. Condensed into the checklist.
- The instruction to add `"frontend-js-web": "*"` and the `bnd.bnd` version pinning (AOP guideline). Master uses `"*"` everywhere; see `requests.md`.
- The link to an external Medium article on AOP.
