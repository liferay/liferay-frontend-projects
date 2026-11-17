# Building URLs (client and server)

<!-- Sources: guidelines/dxp/urls.md -->

**Applies when the PR touches:** JS/TS/JSX/JSP that builds or edits URLs: `new URL(`, `URLSearchParams`, string concatenation with `'/o/'`, `'/c/'`, `'/web/'`, `'/group/'`, `'/combo'`, `'/documents/'`, `'http://'`, `'localhost'`, `window.location`, `location.href =`; `Liferay.Util.PortletURL.*`, `createPortletURL`, `createRenderURL`, `createActionURL`, `createResourceURL` (from `frontend-js-web`), `Liferay.Util.navigate`, `Liferay.Util.fetch`/`fetch` from `frontend-js-web`, `Liferay.Util.getPortletNamespace`, `Liferay.Util.ns`, `Liferay.ThemeDisplay.get*` (`getPathContext`, `getPortalURL`, `getPathMain`, `getLayoutURL`, `getLayoutRelativeURL`, `getCDNBaseURL`, `getPathImage`, `getPathThemeImages`, `getDoAsUserIdEncoded`, `getCanonicalURL`), `Liferay.authToken`, `p_auth`, `p_p_auth`, `x-csrf-token`, `doAsUserId`, `getURLWithSessionId`. JSP/Java: `<portlet:renderURL|actionURL|resourceURL>`, `<liferay-portlet:renderURL|actionURL|resourceURL>`, `escapeXml=`, `PortletURLBuilder`, `ResourceURLBuilder`, `PortalUtil.getPathContext|getPathProxy|getPortalURL|getLayoutFriendlyURL|getLayoutRelativeURL|escapeRedirect`, `themeDisplay.getI18nPath()`, `AbsolutePortalURLBuilder`, `HashedFileUtil.getURL`. Config: `portal.proxy.path`, `locale.prepend.friendly.url.style`, `layout.friendly.url.*.servlet.mapping*`, `auth.token.*`, `portlet.url.escape.xml`, `cdn.host.*`, virtual hosts.

## What the reviewer needs to know

### Generic URL manipulation: native `URL`/`URLSearchParams`

- Use the platform `URL` and `URLSearchParams` APIs. `metal-uri` and other metal plugins are rejected by the portal ESLint rule `no-metal-plugins` (`modules/frontend-sdk/eslint-plugin/rules/portal/lib/rules/no-metal-plugins.js`), so there is nothing to review by hand there.
- `new URL(path, base)` needs a base for relative paths. In the portal the base is almost always `window.location.origin` or `Liferay.ThemeDisplay.getPortalURL()`, never a hard-coded host (`no-localhost-reference` rule exists for the literal case).
- Use `searchParams.set/append/get/has/delete` instead of string concatenation, so encoding and existing `?`/`#` are handled. `append` adds repeated keys (`a=1&a=2`), `set` replaces.

### Portlet URLs on the client (`frontend-js-web`)

- `createPortletURL(basePortletURL, parameters)`, `createRenderURL` (`p_p_lifecycle=0`), `createActionURL` (`1`), `createResourceURL` (`2`): source `modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/portlet_url/*.es.js`. They are exposed as `Liferay.Util.PortletURL.*` and as named exports of `frontend-js-web` (`liferay/index.js:317`, `main/index.js`).
  - A base not starting with the portal URL and without a scheme is prefixed with `Liferay.ThemeDisplay.getPortalURL()`.
  - Each parameter is namespaced with the portlet namespace of `p_p_id` (from `parameters` or the base URL), except a fixed set of reserved portal params (`p_auth`, `p_p_id`, `p_p_lifecycle`, `p_p_state`, `p_p_mode`, `p_p_resource_id`, `p_p_cacheability`, `p_l_id`, `doAsUserId`, `doAsGroupId`, `p_p_auth`, `refererPlid`...).
  - Throws if parameters are given but there is no portlet id.
  - **Returns a `URL` object**, not a string.
  - **Adds no `p_auth` and no `p_p_auth`.** These tokens must already be in the base URL, so the base should be a server-generated portlet URL (passed in as a prop or data attribute), not a hand-written string.
- `getPortletNamespace(portletId)` / `Liferay.Util.ns(namespace, obj)` for namespacing form fields and params.

### Portlet and page URLs on the server

- Java: `PortletURLBuilder.createRenderURL(renderResponse).setMVCRenderCommandName(...).setParameter(...).buildString()` and `ResourceURLBuilder` (`portal-kernel/src/com/liferay/portal/kernel/portlet/url/builder/`). This is the dominant idiom (~1500 files).
- JSP tags `<portlet:renderURL|actionURL|resourceURL>` (`liferay-portlet.tld`) and `<liferay-portlet:renderURL|actionURL|resourceURL>` (`liferay-portlet-ext.tld`, adds `plid`, `portletName`, `doAsUserId`, `copyCurrentRenderParameters`, `windowState`...). Action URLs generated server-side carry `p_auth`. URLs to a portlet that is not on the target page carry `p_p_auth`.
- `portlet.url.escape.xml=false` (`portal-impl/src/portal.properties:5247`): the tags do **not** XML-escape by default. Escape when printing a URL into HTML attributes or JS (`HtmlUtil.escapeAttribute`, `HtmlUtil.escapeJS`), or pass it through a JSON-serialized prop (`<react:component>` data, `liferay-frontend:component` context).

### Path context, proxy path, friendly URLs, i18n, virtual hosts

- `PortalUtil.getPathContext()` = `portal.proxy.path` + servlet context path (`PortalImpl.java:362`). `getPathMain()` = path context + `/c`, `getPathModule()` = path context + `/o`, `getPathImage()` = path context + `/image`. `Liferay.ThemeDisplay.getPathContext()`/`getPathMain()`/`getPathImage()` expose the same values on the client. `getPortalURL()` is scheme + host + port only.
- Friendly URL prefixes are configurable: `layout.friendly.url.public.servlet.mapping=/web`, `private.group=/group`, `private.user=/user`, and `layout.friendly.url.public.servlet.mapping.enabled` can drop `/web` entirely (`portal.properties:4902-4915`).
  - A site with a virtual host is served without `/web/<site>`.
  - `locale.prepend.friendly.url.style=3` (default) prepends `/<lang>` when the locale differs from the default (`portal.properties:2942`). Server side: `themeDisplay.getI18nPath()`. There is no `getI18nPath` on `Liferay.ThemeDisplay`.
- The client-side safe sources for page URLs are `Liferay.ThemeDisplay.getLayoutURL()`/`getLayoutRelativeURL()`/`getCanonicalURL()`/`getURLHome()`, or URLs computed on the server (`PortalUtil.getLayoutFriendlyURL`, `getLayoutRelativeURL`) and passed in.
- CDN and static resources: `ThemeDisplay.getCDNBaseURL()` (falls back to the portal URL), `AbsolutePortalURLBuilder` (`modules/apps/portal-url-builder/portal-url-builder-api/`, CDN/proxy-aware builders for scripts, stylesheets, ES modules, images, servlets, combo), `HashedFileUtil.getURL` (see `resource-loading.md`).

### `Liferay.Util.fetch` and `Liferay.Util.navigate`

- `fetch` from `frontend-js-web` (`liferay/util/fetch.es.js`; global `fetch` is banned by lint rule `no-global-fetch`):
  - prefixes root-relative URLs with `getPathContext()` when missing;
  - for same-origin requests adds header `x-csrf-token: Liferay.authToken`, `credentials: 'include'` and the `doAsUserId` param when impersonating.
  - Cross-origin requests get none of these.
- `navigate(url, listeners)` (`liferay/util/navigate.es.js`) uses SPA when `Liferay.SPA.app.canNavigate(url)`. Otherwise it sets `window.location.href`, only for `http:`/`https:` URLs (blocks `javascript:`).

### CSRF tokens

- `Liferay.authToken` is rendered per request by `LiferayGlobalObjectPreAUIDynamicInclude` from `AuthToken.getToken(request)`. That script is SPA-`temporary`, so the token is refreshed on every navigation.
- `SessionAuthToken` (`portal-impl/src/com/liferay/portal/security/auth/SessionAuthToken.java`) accepts the token as `p_auth` parameter **or** `X-CSRF-Token` header (line ~170). `p_p_auth` is the separate portlet-invocation token for portlets not on the page (`portlet.add.default.resource.check.enabled=true`).
- Global switch `auth.token.check.enabled=true`; exclusions via `auth.token.ignore.actions`, `auth.token.ignore.origins`, or portlet init param `check-auth-token=false` (`InvokerPortletImpl.java:108`).
- `Liferay.Util.submitForm` moves `p_auth` from the form action URL into a hidden input before submitting (`liferay/events.js:150-166`), so the token does not end up in history or `Referer`.

> **⚠️ REVIEW-FLAG [outdated]:** No `URL` polyfill is served for IE11 any more; IE is not supported and the IE compatibility module is gone. Evidence: `ls modules/apps/frontend-js modules/apps | grep -i compat` → nothing. Old guideline said: "a polyfill is also served for Internet Explorer 11, to ensure the `URL` API can be used correcly" (`guidelines/dxp/urls.md`).

> **⚠️ REVIEW-FLAG [policy]:** The checklist below recommends that portlet/page URLs be generated on the server and passed to JS (rather than composed client-side from `ThemeDisplay` parts), and that client helpers only add parameters to such a base URL. This matches how the helpers are built (no token handling) but is a team convention to confirm. Evidence: `frontend-js-web/.../portlet_url/create_portlet_url.es.js`. Old guideline said: only "We now recommend using the native URL API" (`guidelines/dxp/urls.md`).

> **⚠️ REVIEW-FLAG [gap]:** Redirect-parameter safety (`PortalUtil.escapeRedirect`, the redirect allow-list configuration in `modules/apps/redirect` / `friendly-url`) and `doAsUserId`/`doAsGroupId` propagation are only touched on here. A security-oriented URL topic would help. Evidence: `portal-kernel/src/com/liferay/portal/kernel/util/Portal.java:230` (`escapeRedirect`). Old guideline said: nothing.

## Review checklist

- **Hard-coded paths or hosts?** Literals like `'/o/...'`, `'/c/portal/...'`, `'/web/guest'`, `'/group/...'`, `'/documents/...'` or `'http://localhost:8080'` break under a proxy path or non-root context, a CDN, a virtual host, an i18n prefix, or a changed friendly-URL mapping. Ask for `Liferay.ThemeDisplay.getPathContext()`/`getPortalURL()`, `Liferay.Util.fetch` (auto-prefixes path context), or a server-provided URL.
- **Portlet URL built from scratch on the client?** Concatenating `p_p_id`/`p_p_lifecycle`/namespaced params by hand is fragile, and an action URL built that way lacks `p_auth` (request rejected with a CSRF error), as does a cross-portlet URL without `p_p_auth`. Ask for a server-generated base URL plus `createPortletURL`/`createActionURL` for extra params.
- **CSRF on state-changing requests.** POST/PUT/DELETE to portal endpoints must go through `Liferay.Util.fetch` (adds `x-csrf-token`), carry `p_auth`, or target headless APIs with their own auth. Flag manual `p_auth=${Liferay.authToken}` in a URL: it works, but the token leaks into logs/Referer. Prefer the header or a form field. Flag any new `check-auth-token=false` or `auth.token.ignore.*` entry and ask for the security reasoning.
- **Same-origin assumption.** `fetch` only adds the token and credentials for same-origin URLs. URLs built from `getCDNBaseURL()` or absolute hosts are cross-origin. Never send `Liferay.authToken` to a third-party origin.
- **Escaping.** Server-generated URLs are not XML-escaped by default (`portlet.url.escape.xml=false`). Check `HtmlUtil.escapeAttribute`/`escapeJS` when a URL is printed into markup/inline JS, or that it travels as JSON data.
- **`URL` object vs string.** `createPortletURL` and friends return `URL`. Check callers that do string operations (`.indexOf`, `+ '&x=1'`) or compare with `===`. Use `.toString()` or `searchParams`.
- **Navigation.** Use `Liferay.Util.navigate(url)` rather than `window.location.href = url`, so SPA is honored and non-HTTP schemes are rejected. Redirect targets taken from request params must be sanitized server-side (`PortalUtil.escapeRedirect`).
- **Parameter namespacing.** Params for a portlet must be namespaced (`createPortletURL` does it). Raw unnamespaced params are ignored by the portlet unless `requires-namespaced-parameters=false`.
- **Session id in URLs.** If code builds URLs for environments without cookies, use `Liferay.Util.getURLWithSessionId` (honors `themeDisplay.isAddSessionIdToURL()`).

## Use cases and how-tos

- **Add params to a URL received from the server:**
  ```js
  import {createPortletURL} from 'frontend-js-web';

  const url = createPortletURL(props.baseResourceURL, {
  	keywords,
  	p_p_resource_id: '/my_portlet/search',
  });

  const response = await fetch(url); // fetch from 'frontend-js-web'
  ```
- **Plain URL edit:** `const url = new URL(href, window.location.origin); url.searchParams.set('delta', 20); Liferay.Util.navigate(url.toString());`
- **Call a portal endpoint by path:** `fetch('/o/headless-admin-user/v1.0/my-user-account')`. `frontend-js-web`'s `fetch` prefixes the path context and adds the CSRF header.
- **Server URL into React:** in Java, `PortletURLBuilder.createActionURL(liferayPortletResponse).setActionName("/my_portlet/save").buildString()` into the component's props, then use it as is from JS.
- **Static asset URL in JS:** build it from `Liferay.ThemeDisplay.getPathThemeImages()`, `getPathContext()` or a server-provided `AbsolutePortalURLBuilder` URL. For files of your own module, let the build/import system resolve them.

## Pitfalls and side effects

- With `locale.prepend.friendly.url.style=3`, the same page has different URLs per user locale. Client code comparing `window.location.pathname` with a stored friendly URL can fail for non-default-locale users.
- `getPortalURL()` contains no context path. `getPortalURL() + '/o/x'` breaks on non-root deployments; `getPortalURL() + getPathContext() + '/o/x'` is right.
- `Liferay.authToken` is session-bound. Long-lived pages that cached the token in a closure before a re-login will send a stale token. Read `Liferay.authToken` at request time.
- `createPortletURL` silently namespaces anything not in its reserved list, including portal params it does not know (custom `p_*` params). Check the generated URL in the test.
- `Liferay.Util.fetch` only rewrites URLs starting with `/`. Relative URLs (`'o/x'`, `'../x'`) are resolved by the browser against the current page path, which changes with friendly URLs and i18n prefixes.

## Not carried over

- Basic MDN-style recipes (create relative/absolute URL, set/append/has/get/delete params): generic web knowledge, kept only as one-line guidance above.
- "Previously, we made use of the metal-uri module": enforced by lint (`no-metal-plugins`), no manual review needed.
