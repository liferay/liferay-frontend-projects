# Requests from the browser (`fetch`, headless, CSRF)

<!-- Sources: guidelines/dxp/requests.md -->

**Applies when the PR touches:** JS/TS/JSP that performs HTTP calls. Code signals: `fetch(`, `window.fetch`, `Liferay.Util.fetch`, `import {fetch} from 'frontend-js-web'`, `XMLHttpRequest`, `axios`, `A.io.request`, `Liferay.Service(`, `/api/jsonws`, `/o/headless-`, `/o/c/` (object REST), `p_auth`, `Liferay.authToken`, `x-csrf-token`, `credentials:`, `doAsUserId`, `objectToFormData`, `objectToURLSearchParams`, `postForm`, `createActionURL`/`createResourceURL`, `Accept-Language`, `response.ok`, `response.status`; Java `AuthTokenUtil.checkCSRFToken`, `SessionAuthToken`; ESLint `@liferay/portal/no-global-fetch`.

## What the reviewer needs to know

- **`fetch` from `frontend-js-web`** (`modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/util/fetch.es.js`, also `Liferay.Util.fetch`, `liferay/index.js:248`) is a thin wrapper over native `fetch`. Both paths resolve to the same function (`main/index.js` re-exports `Liferay.__INTERNALS`). What it adds:
  - **Relative URLs.** A URL starting with `/` gets `themeDisplay.getPathContext()` prepended unless it is already there (`fetch.es.js:45-53`). Portal deployments under a context path therefore work. Pass `/o/...`, not `${pathContext}/o/...` built by hand (that is tolerated, but redundant).
  - **Same-origin requests only** (`fetch.es.js:63-75`):
    - sets the header `x-csrf-token: Liferay.authToken`;
    - sets `credentials: 'include'`;
    - appends `doAsUserId` when impersonating.
    - Cross-origin requests get none of these, so the token does not leak to third parties.
  - The caller's `init` wins over the defaults, and caller headers are merged over the CSRF header. Passing `credentials: 'omit'` or overriding `x-csrf-token` disables the protection.
  - **What it does not do:**
    - it does not reject on HTTP errors (4xx/5xx resolve normally);
    - it does not parse JSON;
    - it does not set `Content-Type` or `Accept-Language`;
    - it has no timeout or retry;
    - it does not add `p_auth` as a URL parameter.
- **CSRF on the server.** `portal-impl/src/com/liferay/portal/security/auth/SessionAuthToken.java:170-174` accepts the token either as the `p_auth` parameter or the `X-CSRF-Token` header. Portlet action URLs generated server-side already carry `p_auth`. `createActionURL`/`createPortletURL` (`liferay/util/portlet_url/`) preserve it as a non-namespaced parameter. Struts-style portal actions check it explicitly, e.g. `SessionClickAction` calls `AuthTokenUtil.checkCSRFToken`.
- **Headless APIs (`/o/headless-*`, `/o/c/<object>`)** called from the portal UI rely on the session cookie plus the CSRF header, which the wrapper provides. The UI language is not implied: about 50 callers pass `'Accept-Language': Liferay.ThemeDisplay.getBCP47LanguageId()` explicitly (`git grep "'Accept-Language'"`). There is no shared portal-wide headless client. Apps carry their own helpers:
  - `object-js-components-web/.../utils/api.ts`;
  - `headless-builder-web/.../utils/fetchUtil.ts`;
  - `data-engine-taglib/.../utils/client.es.js`;
  - `data-engine-js-components-web/.../utils/fetch.es.js`, which also checks `Liferay.Session.sessionState`.
- **Form helpers in `frontend-js-web`:**
  - `objectToFormData(obj)` (`liferay/util/form/object_to_form_data.es.js`): nested objects become `parent[child]` keys. Array items are appended repeatedly under the **same key, without `[]`**. `File` is kept as is. Other objects, including `Blob` and `Date`, are recursed into, which yields nothing. `null`/`undefined` become the strings `'null'`/`'undefined'`.
  - `objectToURLSearchParams`, `postForm(form, {data, url})` (sets values on a real `<form>` and submits it through `submitForm`), `setFormValues` and `getFormElement`.
- **Legacy channels still present:**
  - `Liferay.Service(...)` (JSON web services at `/api/jsonws/invoke`, `liferay/liferay.js`), about 20 callers;
  - `A.io.request` (AUI), a handful of callers;
  - `PortletBase#fetch`, deprecated since 7.3 in favor of `Liferay.Util.fetch` (`liferay/PortletBase.es.js:141`).
- **Lint.** `@liferay/portal/no-global-fetch` is `error` in `modules/frontend-sdk/eslint-plugin/configs/portal.js`. It flags a bare `fetch(` call when the file does not import `fetch` from `frontend-js-web`. It does **not** catch `window.fetch(`, `globalThis.fetch(`, `XMLHttpRequest`, or third-party clients.

## Review checklist

- **Use the wrapper for portal-origin calls.** `window.fetch`, `XMLHttpRequest`, `axios` and similar to portal URLs skip the CSRF header, `doAsUserId` and the context path. Impersonation then silently acts as the admin, and installs under a context path break. Ask for `fetch` from `frontend-js-web`.
- **Never send the token cross-origin.** Hand-built headers with `Liferay.authToken`, or `p_auth` in URLs to external hosts (CDN, Client Extension backends, OAuth providers), leak the CSRF token. External services should use their own auth: OAuth2 for Client Extension microservices, through their own fetch.
- **Do not disable CSRF protection.** Overriding `credentials` or `x-csrf-token`, or adding endpoints that skip `checkCSRFToken`, needs a justification.
- **State-changing requests must not be `GET`.** Mutations through `GET` bypass `p_auth` expectations on many endpoints and can be triggered cross-site.
- **Handle HTTP errors explicitly.** Check `response.ok` or `status` before `response.json()`. A 403 (expired session or token), a 500 HTML error page, or a 204 with no body otherwise turns into an unhandled JSON parse error. The user should see a Clay toast or alert with a localized message, not a silent console error. Ask what the UI shows on failure and on an expired session (`Liferay.Session?.sessionState === 'expired'`).
- **Headless calls.** Check that:
  - `Accept-Language` is set when the response contains localized fields;
  - `Content-Type: application/json` is set when sending JSON;
  - pagination (`page`, `pageSize`) is not left to defaults for unbounded lists;
  - `fields=`/`restrictFields=`/`nestedFields=` are used instead of over-fetching;
  - filters built from user input are escaped (OData string quoting).
- **Prefer headless over JSONWS for new code.** New `Liferay.Service` or `/api/jsonws` usage needs a reason. JSONWS can be disabled or restricted per installation.
- **Race conditions and unmounts.** For type-ahead or search, ask for request cancellation (`AbortController` passed as `init.signal`) or a "latest request wins" guard, plus debouncing (see `runtime-utilities.md`). In React, results must not be set after unmount (`useIsMounted`/`useStateSafe` from `@liferay/frontend-js-react-web`).
- **`objectToFormData` gotchas.** Arrays of objects, `Blob` (non-`File`), `Date` and `null` values do not serialize the way most authors expect. Ask how the server reads the keys (`ParamUtil.getStringValues(name)` for repeated keys).
- **Do not duplicate one more headless helper.** If the module already depends on an app-level API helper (objects, data engine), reuse it rather than adding another wrapper.

## Use cases and how-tos

- JSON from a headless endpoint, in the UI language:

  ```js
  import {fetch} from 'frontend-js-web';

  const response = await fetch(`/o/headless-delivery/v1.0/sites/${siteId}/structured-contents?pageSize=20`, {
  	headers: {
  		'Accept': 'application/json',
  		'Accept-Language': Liferay.ThemeDisplay.getBCP47LanguageId(),
  	},
  });

  if (!response.ok) {
  	throw new Error(`Request failed: ${response.status}`);
  }

  const {items} = await response.json();
  ```

- POST JSON: `fetch(url, {body: JSON.stringify(data), headers: {'Content-Type': 'application/json'}, method: 'POST'})`.
- POST to a portlet `MVCResourceCommand` or action: use the server-generated URL (`<portlet:resourceURL>` / `<portlet:actionURL>`, passed as a prop) with `body: objectToFormData(Liferay.Util.ns(portletNamespace, data))`. Portlet parameters must be namespaced unless the portlet sets `requires-namespaced-parameters=false`.
- Non-module scripts (JSP `aui:script`, FreeMarker): `Liferay.Util.fetch(...)`.

## Pitfalls and side effects

- Building URLs with `themeDisplay.getPortalURL()` makes them absolute. They are still same-origin unless a CDN or virtual host differs from `window.location.origin`. If it differs, the wrapper treats the call as cross-origin and drops the CSRF header and credentials.
- `fetch` resolves on 4xx/5xx. Code that only has `.catch()` never sees server errors.
- A portal behind a context path breaks code that builds `'/o/...'` URLs for anything other than this wrapper: `<img src>`, `window.open`, `navigate()` with string concatenation.
- `doAsUserId` is appended only by the wrapper. Hand-rolled requests during impersonation act as the impersonating admin.

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline tells authors to pin `frontend-js-web` in `package.json` to the version in its `bnd.bnd` (`"4.0.0"`) and mentions an IE11 `fetch` polyfill. In master, all 219 consumers declare `"frontend-js-web": "*"` (the module is provided by the platform; current `Bundle-Version: 5.0.155`), and the IE compatibility module no longer exists. Evidence: `git grep -hE '"frontend-js-web": ' -- 'modules/**/package.json' | sort | uniq -c`; `ls modules/apps | grep -i compat` (empty). Old guideline said: "make sure ... the version corresponds to the one declared in the `frontend-js-web/bnd.bnd` file" and "a polyfill is also served for Internet Explorer 11" (`guidelines/dxp/requests.md`).

> **⚠️ REVIEW-FLAG [gap]:** There is no portal-wide guidance or shared helper for headless calls from the UI: error shape (`{status, title}` problem JSON), `Accept-Language`, pagination, abort handling. Each app rolls its own (`object-js-components-web/.../utils/api.ts`, `headless-builder-web/.../fetchUtil.ts`, data-engine `client.es.js`). A topic on "calling headless APIs from portal UI" should be written. Evidence: `git grep -lE "export (async )?function (fetchJSON|fetchData|request)\b|class ApiHelper"`. Old guideline said: nothing beyond a JSON example.

> **⚠️ REVIEW-FLAG [policy]:** Whether new `Liferay.Service`/JSONWS usage should be rejected outright in favor of headless is a team rule, not checkable in code; it needs human confirmation. Evidence: `Liferay.Service` still defined in `frontend-js-web/.../liferay/liferay.js`, with no `@deprecated`. Old guideline said: nothing on this.

## Not carried over

- The IE11 polyfill note. IE support and `frontend-compatibility-ie` are gone (see flag).
- "Visit MDN for fetch". This is generic and not review knowledge.
- Browser detection, from `guidelines/dxp/browser_detection.md`. It moved to `runtime-utilities.md`.
