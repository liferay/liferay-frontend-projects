# Global event bus (`Liferay.on` / `Liferay.fire`)

<!-- Sources: guidelines/dxp/liferay_global_event_bus.md -->

**Applies when the PR touches:** any JS/TS/JSP under `modules/**/src/main/resources/META-INF/resources/` or `portal-web/docroot/html/` that calls `Liferay.on(`, `Liferay.once(`, `Liferay.after(`, `Liferay.onceAfter(`, `Liferay.before(`, `Liferay.fire(`, `Liferay.detach(`, `Liferay.detachAll(`, `Liferay.publish(`; listeners for page lifecycle events (`destroyPortlet`, `closePortlet`, `portletReady`, `allPortletsReady`, `beforeNavigate`, `startNavigate`, `endNavigate`, `beforeScreenFlip`, `screenLoad`, `sessionExpired`, `submitForm`, `closeWindow`); `Liferay.Util.ns(` / `PortletBase#ns` used to build event names; `modules/global.d.ts`; `frontend-js-web/.../liferay/events.js`.

## What the reviewer needs to know

- **It is still YUI/AlloyUI under the hood.** `Liferay` becomes an event target in `modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/events.js:11` (`A.augment(Liferay, A.Attribute, true)`). `A.Attribute` brings YUI `EventTarget` with `emitFacade: true` (`attribute-observable`). There is no separate non-AUI implementation in master.
  - The YUI modules this needs (`attribute-*`, `event-custom-base`, `event-custom-complex`, `oop`) are in the always-loaded AUI core list. See `_FILE_NAMES_AUI_CORE` in `modules/apps/frontend-js/frontend-js-aui-web/src/main/java/com/liferay/frontend/js/aui/web/internal/servlet/taglib/AUITopHeadJSDynamicInclude.java:224`. That is why `A.use('attribute', 'oop', …)` in `events.js` resolves synchronously and `Liferay.on` exists before module code runs.
  - The deprecation flag `LPD-57347` ("Deprecated AlloyUI Components") only drops the AUI *UI component* modules (`modules_deprecated.js`). The event core stays. So `Liferay.on/fire` keep working when customers turn AUI components off.
  - TypeScript typings are in `modules/global.d.ts:74-90`. Only `detach`, `fire`, `on` and `once` are declared; `on`/`once` return an `EventHandler` with `detach()`. `after`, `onceAfter`, `before`, `detachAll` and `publish` work at runtime (YUI `EventTarget`) but are untyped.
- **API semantics (YUI `EventTarget`).**
  - `on(type, fn)` subscribes and returns a handle (`handle.detach()`). `once` auto-detaches after the first call. `after` runs after `on` subscribers and after the event's `defaultFn`. `onceAfter` combines both.
  - `before(type, fn)` is the same as `on` for custom events. When the first argument is a function it falls back to YUI `Do` method injection (AOP), which is rarely what anyone wants.
  - `detach(type, fn)` removes one subscriber. **`detach(type)` with no callback removes every subscriber to that event on the page**, including other teams' listeners. `detachAll()` with no type wipes the whole bus.
  - `fire(type, payload)`: with `emitFacade`, an object payload is mixed into an `EventFacade`, so listeners read `event.portletId` and so on. Listeners may call `event.preventDefault()` to cancel a `defaultFn` registered through `Liferay.publish` (example: `Liferay.publish('submitForm', {defaultFn})` in `events.js:76`).
  - Firing an event that has no subscribers and was never published returns immediately. There is no buffering or replay, so **a listener registered after the fire never sees it**. Use `Liferay.componentReady()` / `Liferay.component()` for "wait until X exists" semantics.
- **Who fires the lifecycle events.**
  - `destroyPortlet` and `closePortlet`: `liferay/portlet.js:505-507`.
  - `beforeNavigate`, `startNavigate`, `endNavigate`: `modules/apps/frontend-js/frontend-js-spa-web/.../app/LiferayApp.js:243,317,396`.
  - `beforeScreenFlip`: `.../screen/EventScreen.js:102`.
  - On every SPA navigation, `resetAllPortlets()` (`frontend-js-spa-web/.../util/utils.js:176`) calls `Liferay.Portlet.destroy()` for each portlet, which fires `destroyPortlet`. It also destroys components registered with `destroyOnNavigate`.
- **The `Liferay` object outlives the page under SPA (Senna).** Subscriptions on `Liferay` are never cleaned up automatically. A listener added by portlet JS keeps running, and keeps its closure (DOM nodes, React state) alive, after the user navigates away, unless the author detaches it. That is the main source of leaks and of "handler runs twice" bugs.
- **Usage in master.** There are about 630 `Liferay.fire(` and 540 `Liferay.on/once/after(` call sites. The most listened-to event is `destroyPortlet`, which is the cleanup hook. Event names are not centrally registered. Styles coexist:
  - camelCase: `closeModal`, `destroyPortlet`.
  - `prefix:camelCase`: `journal:storeState`, `inputLocalized:localeChanged`, `ckeditor:ready`.
  - kebab-case: `fds-update-display`, `close-side-panel`.
  - portlet-namespaced: `'<portlet:namespace />formReady'`.

## Review checklist

- **Is a global event the right channel?** Within one React tree, use props, context, callbacks or state (`@liferay/frontend-js-state-web`). Within one portlet, use direct calls or `Liferay.componentReady`. The global bus is for decoupled contexts: separate portlets, iframes/modals opened with `Liferay.Util.openWindow`, JSP inline scripts talking to React, and Client Extensions. Ask the author why a direct dependency is not possible.
- **Every `Liferay.on` needs a matching teardown.**
  - React: subscribe in `useEffect` and return `() => handle.detach()`.
  - JSP/AUI scripts: detach on `destroyPortlet`. The common pattern is a self-detaching `destroyPortlet` listener, e.g. `asset-display-page-item-selector-web/.../view.jsp:100-104`.
  - Long-lived singletons: `beforeNavigate`, as in `liferay/session.ts:290`.
  - A handle saved but never detached is still a leak under SPA.
- **No bare `Liferay.detach('eventName')`.** It removes everyone's subscribers. Require `handle.detach()` or `Liferay.detach(type, sameFnReference)`. An inline arrow passed to `detach` never matches.
- **Event name scoping.** Generic names (`closeModal`, `CLOSE_MODAL`, `update`) collide across widgets that can sit on the same page. For per-instance events, require the portlet namespace: `Liferay.Util.ns(portletNamespace, 'eventName')`, `PortletBase#ns`, or `'<portlet:namespace />eventName'` in JSP. Otherwise require an app prefix (`myapp:eventName`).
- **The payload is a public contract.** An event name and its payload shape that other modules (or customer code, Client Extensions, fragments) listen to are de facto API. Renaming the event, removing or renaming payload keys, or changing value types is a breaking change. Ask for:
  - a grep of all listeners across `modules/` (including `modules/dxp`, commerce themes, fragments and site initializers);
  - backwards-compatible aliases (fire both names) or additive payload changes;
  - a breaking-change note when the event is plausibly used outside the repo (`closeModal`, `destroyPortlet`, `endNavigate`, `ckeditor:ready`, …).
- **Always fire a single object payload.** Listeners receive an `EventFacade`. Firing a primitive (`Liferay.fire('x', 'Hello')`) does not hand `'Hello'` to `(data) => …` as the first argument. Ask for `{message: 'Hello'}` and `event.message`.
- **Prefer plain data over live objects in new payloads.** DOM nodes and component instances in payloads leak, and listeners may mutate them because the facade is shared. Pass ids and plain data. Existing events already pass live objects (`inputLocalized:localeChanged` passes `{item: <DOM node>, source: <AUI instance>}`; `ckeditor:ready` passes `{editor}`), and those shapes are now part of the contract.
- **Ordering assumptions.** If the listener may be registered after the fire (lazy React mount, deferred `aui:script`), the event will be missed. Ask how ordering is guaranteed, or switch to `Liferay.componentReady(id)` or a state atom.
- **`preventDefault` contracts.** When code uses `Liferay.publish` with a `defaultFn`, check that cancelling listeners are intended, and that `submitForm` overrides stay consistent with `frontend-js-spa-web`, which overrides form submission (see LPD-54311 in the `events.js` history).
- **New code should not depend on AUI for eventing.** Using `Liferay.on/fire` is fine. Reaching into `A.on`, `A.after`, `A.Do` or YUI-specific facade internals (`event._event`, `event.details`) ties the code to AUI. Prefer the plain `Liferay.*` surface or DOM `CustomEvent` for DOM-local communication.

## Use cases and how-tos

- React component listening to a global event:

  ```js
  useEffect(() => {
  	const handle = Liferay.on('inputLocalized:localeChanged', (event) => {
  		// Payload: {item, source}, see frontend-js-aui-web/.../liferay/input_localized.js:348

		onLocaleChange(event.item);
  	});

  	return () => handle.detach();
  }, []);
  ```

- JSP inline script with portlet-scoped cleanup:

  ```js
  const handle = Liferay.on('<portlet:namespace />itemSelected', onSelect);

  Liferay.once('destroyPortlet', () => handle.detach());
  ```

  `Liferay.once('destroyPortlet', …)` fires for the *first* portlet destroyed, not necessarily this one. Check `event.portletId` when several portlets share the page, or detach on `beforeNavigate` instead.
- Namespaced fire from ES module code: `Liferay.fire(Liferay.Util.ns(portletNamespace, 'closeModal'), {id})`. `ns` is **not** exported from the `frontend-js-web` module; use the global.
- Wait for a component instead of an event: `Liferay.componentReady('myComponentId').then((component) => …)`.

## Pitfalls and side effects

- Listeners that are not detached accumulate across SPA navigations. After N visits the handler runs N times and holds N stale closures. QA symptoms: duplicated requests, double toasts, "cannot read property of null" on removed DOM.
- `Liferay.detach(type)` without a callback silently breaks unrelated features on the same page.
- Generic event names fired from a reusable component (modal, side panel, data set) trigger listeners in every other instance on the page.
- Renaming a widely used event (`closeModal` has 34 fire sites; `destroyPortlet` has 53 listeners) breaks customer JS and Client Extensions that are invisible to the repo grep.
- Because the facade is shared, a listener that mutates the payload changes what later listeners see.

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline imports `ns` from `frontend-js-web`. Master does not export `ns` from the module; it exists only as `Liferay.Util.ns` (and `PortletBase#ns`). Evidence: `frontend-js-web/.../main/index.js` (no `ns` in the export list), `liferay/index.js:308`. Old guideline said: "import {ns} from 'frontend-js-web';" (`guidelines/dxp/liferay_global_event_bus.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** The old example fires a string (`Liferay.fire('my-custom-event', 'Hello!')`) and expects `data => alert(data)` to receive it. With `emitFacade: true` (set by `attribute-observable`), YUI passes the facade first, so the example most likely alerts an object. I did not verify this at runtime. Evidence: `frontend-js-aui-web/tmp/.../attribute-observable/attribute-observable.js:41` (`EventTarget.call(this, {emitFacade:true})`). Old guideline said: "By clicking the button in Module B, the event will trigger in Module A and execute `alert('Hello!')`" (`guidelines/dxp/liferay_global_event_bus.md`).

> **⚠️ REVIEW-FLAG [policy]:** There is no enforced naming convention for global events; camelCase, `prefix:camelCase` and kebab-case all appear in master. The old guideline's rule ("use `Liferay.Util.ns` … or an app prefix such as `commerce:`") needs human confirmation as the team rule, and someone should decide whether a preferred style exists. Evidence: `git grep -hoE "Liferay\.fire\(\s*'[^']+'" -- modules` (e.g. `closeModal`, `journal:storeState`, `fds-update-display`). Old guideline said: "The best practice number #1 is using Liferay's namespace utilities (`Liferay.Util.ns`) when possible" (`guidelines/dxp/liferay_global_event_bus.md`).

> **⚠️ REVIEW-FLAG [gap]:** There is no catalogue of the global events that count as public API (name, payload, firing module), and no plan for a non-AUI event bus if AUI core is ever removed. Reviewers cannot tell "internal" from "public" events today. Evidence: no registry found; `events.js:11` is the only implementation. Old guideline said: nothing on this.

## Not carried over

- The per-function reference for `on/once/onceAfter/after/before/detach/detachAll/fire`. It is condensed into the semantics bullets above because it duplicated the YUI docs.
- The advice to extend `PortletBase` to get `this.ns`. `PortletBase` is now a metal-state compatibility shim (`liferay/PortletBase.es.js:17-20`) and should not be recommended for new code.
- The naming rule that the callback parameter is called `event`, not `evt`/`e`. That is code shape, covered by lint and the pr-reviewer naming rules (`no-restricted-globals: event` is in `modules/frontend-sdk/eslint-plugin/configs/portal.js`).
