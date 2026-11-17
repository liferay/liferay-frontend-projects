# Session: timeout, session values and consent-aware storage

<!-- Sources: guidelines/dxp/session.md -->

**Applies when the PR touches:** `modules/apps/frontend-js/frontend-js-web/**/liferay/session.ts`, `**/liferay/util/session.es.js`, `**/liferay/util/{storage,local_storage,session_storage}.js`, `**/liferay/util/cookie/cookie.js`, `portal-web/docroot/html/common/themes/session_timeout.jspf`, `portal-impl/src/com/liferay/portal/action/SessionClickAction.java`, `portal-kernel/**/SessionClicks.java`, `SessionTimeoutConfiguration`/`SessionTimeoutImpl`; code signals `Liferay.Session`, `Liferay.Session.extend(`, `.autoExtend`, `sessionState`, `sessionExpired`, `getSessionValue`, `setSessionValue`, `Liferay.Util.Session.get/set`, `useHttpSession`, `/portal/session_click`, `/portal/extend_session`, `/portal/expire_session`, `localStorage`, `sessionStorage`, `Liferay.Util.LocalStorage`, `Liferay.Util.SessionStorage`, `Liferay.Util.Cookie`, `getCookie`/`setCookie`/`checkConsent`, `CONSENT_TYPE_*`, `COOKIE_TYPES`; portal properties `session.timeout*`, `session.clicks.*`.

## What the reviewer needs to know

There are three different things here that people mix up.

### 1. `Liferay.Session`: the client-side session timeout controller

- Implemented in `modules/apps/frontend-js/frontend-js-web/src/main/resources/META-INF/resources/liferay/session.ts`, a vanilla TS class that replaced the AUI one. Instantiated per page by `portal-web/docroot/html/common/themes/session_timeout.jspf`, included from `bottom.jsp:32`.
  - It is only created for guests, or for signed-in users **without** a Remember Me cookie. With Remember Me, `Liferay.Session` is `undefined`, so code must use `Liferay.Session?.…`.
  - Config comes from the following:
    - `sessionLength`: `session.timeout` (minutes, default 15, overridden by `web.xml`; FIPS idle timeout wins if set).
    - `warningLength`: `session.timeout.warning` (minutes, default 1; 0 disables the warning).
    - `autoExtend` and `sessionTimeoutOffset` come from `SessionTimeoutConfiguration`. That configuration is **site-scoped** (`scope = GROUP`, defaults `false` and `70` seconds) and lives in `frontend-js-web/.../internal/session/timeout/`. Guests always auto-extend.
    - `redirectOnExpire` and `redirectUrl` come from `SSOUtil` (OpenSSO config).
- **How it works.**
  - A 1-second `setInterval` compares `Date.now()` against a timestamp in `localStorage` under the key `LFR_SESSION_STATE_<realUserId>` (consent type `NECESSARY`). Because the key lives in `localStorage`, all tabs of the same user share one countdown.
  - States are `active`, `warned` and `expired`.
  - On warn it shows a Clay toast (`frontend-js-components-web` `openToast`) with a countdown and an "Extend" link, and updates `document.title`.
  - `extend()` resets the timestamp and calls `GET {pathMain}/portal/extend_session`. A 500 response means the server session is already gone, so it calls `expire()`.
  - `expire()` calls `{pathMain}/portal/expire_session` (which **invalidates the server session**), fires `Liferay.fire('sessionExpired')`, and optionally redirects.
  - The interval is cleared on `beforeNavigate` (`session.ts:290`), and the JSP calls `destructor()` before creating a new instance on each SPA page.
- **The client timer only knows about page loads and explicit `extend()` calls.** `Liferay.Util.fetch` traffic does *not* reset it, even though it keeps the server session alive. Long-lived single-page UIs must call `Liferay.Session.extend()` or toggle `autoExtend` themselves. Otherwise the client expires a session the server still considers active. Precedents:
  - `layout-content-page-editor-web/.../app_hooks/useExtendSession.js` (periodic `extend()`);
  - `dynamic-data-mapping-form-web/.../FormBuilder.es.js:147-165` (sets `autoExtend = true` while editing);
  - `data-engine-js-components-web/.../utils/fetch.es.js:33`, `ratings-taglib/.../BaseRatings.js:27` and `questions-web/.../ProtectedRoute.es.js:12` (read `sessionState` to avoid acting on an expired session).

### 2. Session values: `getSessionValue` / `setSessionValue` (`Liferay.Util.Session.get/set`)

- Implemented in `frontend-js-web/.../liferay/util/session.es.js`; exported from `frontend-js-web` and as `Liferay.Util.Session = {get, set}` (`liferay/index.js:343`).
- Both functions `POST` `FormData` to `{portalURL}{pathMain}/portal/session_click?p_l_id=…` with `cmd=get|set`, `p_auth` and `doAsUserId`. The server side is `portal-impl/src/com/liferay/portal/action/SessionClickAction.java`, which checks the CSRF token.
  - Object values are sent as `serialize://` + `JSON.stringify(value)` and parsed back on `get`. Everything else is sent as a string. `get` always resolves to a string unless it carries the `serialize://` prefix.
  - **By default the value is stored in `PortalPreferences`, not the HTTP session** (`SessionClicks.put(httpServletRequest, …)` in `portal-kernel/.../util/SessionClicks.java:75-108`). For signed-in users that is persisted per user and survives logout and login. Only `{useHttpSession: true}` stores it in the `HttpSession` (`SessionClickAction.java:49-70`).
  - Server limits: `session.clicks.max.allowed.values=1024` entries and `session.clicks.max.size.terms=1024` characters per key/value (`portal.properties:3113-3121`). Writes beyond the limit are silently dropped (`_isValidSize`).
  - JSP and Java read the same store with `SessionClicks.get(request, key, default)`. Example: `top_js.jspf` reads `com.liferay.frontend.js.web_toggleControls`.
- Typical uses: remembering UI state such as a collapsed panel, a selected tab, display style or toggle controls across page loads, readable by the server during render.

### 3. Consent-aware browser storage and cookies

- `frontend-js-web` exports `localStorage`, `sessionStorage` (instances of `liferay/util/storage.js`), `getCookie`, `setCookie`, `removeCookie`, `checkConsent` and `COOKIE_TYPES`. Globals: `Liferay.Util.LocalStorage`, `Liferay.Util.SessionStorage` and `Liferay.Util.Cookie` (`liferay/index.js:375-378`).
  - `getItem`, `key` and `setItem` take a consent `type` (`TYPES.NECESSARY | FUNCTIONAL | PERFORMANCE | PERSONALIZATION`, values `CONSENT_TYPE_*`). Without consent, `getItem` returns `null` and `setItem` returns `false` and **does not write**. `removeItem` and `clear` never check consent.
  - `checkConsent(type)` (`cookie/cookie.js`) is `true` for `NECESSARY`, or when the `CONSENT_TYPE_<X>` cookie is not the string `'false'`. **If the consent cookie is absent, access is allowed**, and **if `type` is omitted the check also passes**.
  - `setCookie` defaults to `path=/` and `max-age` of one year.
- Lint enforces the wrappers: `@liferay/portal/no-global-storage` and `@liferay/portal/no-document-cookie` are `error` in `modules/frontend-sdk/eslint-plugin/configs/portal.js`.

## Review checklist

- **Code that touches session timeout UI must handle `Liferay.Session` being undefined** (Remember Me users and some popups). Ask for optional chaining.
- **Long-running editors and wizards: does the author keep the client timer in sync?** If the screen can stay open past `session.timeout` while the user works (typing, drag and drop, background saves), require `Liferay.Session.extend()` on activity or a temporary `autoExtend = true` that is restored on unmount. Otherwise the user gets "session expired" mid-edit and the server session is actively invalidated.
- **Do not reimplement session warnings.** Toasts, countdowns and redirects belong to `Liferay.Session`. Listen to `Liferay.on('sessionExpired', …)` or read `Liferay.Session.sessionState` instead.
- **Changes to `session.ts` or `session_timeout.jspf` have portal-wide side effects:** every page, every tab, guests and SSO redirects. Ask:
  - Is the multi-tab case covered (shared `localStorage` timestamp)?
  - Is SPA navigation covered (`destructor`, the interval cleared on `beforeNavigate`)?
  - Is the Remember Me path covered?
  - Is the FIPS idle timeout covered?
  - Is the change visible to customers who override the JSPF via `bottom-ext.jsp`?
- **`setSessionValue` is a server round trip with persistence.** Check that:
  - the value is small (≤ 1024 chars, otherwise silently dropped);
  - the key is namespaced (module/portlet prefix, e.g. `com.liferay.foo.web_bar`) because the default namespace is shared;
  - it is not called on every keystroke or scroll (debounce it, or use `sessionStorage` if the server never needs it);
  - it does not contain sensitive data (it is persisted in portal preferences);
  - the author knows the value survives logout. If it should not, ask for `{useHttpSession: true}`.
- **Storage: pick the right consent type.** `NECESSARY` is only for things the site cannot work without (auth/session state, security). UI preferences are `FUNCTIONAL` or `PERSONALIZATION`; analytics is `PERFORMANCE`. Reject:
  - calls that omit `type` (they silently bypass consent);
  - code that assumes `setItem` succeeded. It returns `false` without consent, and the next `getItem` returns `null`.
- **Raw `window.localStorage` or `window.sessionStorage`.** The lint rule matches the bare globals; check for `window.` or `globalThis.` access that sidesteps it.
- **Storage keys are global per origin.** Require a module prefix and, when per-user, a user or company id in the key. Per-site state should include the site id.
- **New first-party cookies or storage keys:** ask whether they need an entry in the cookie inventory shown by the cookie banner (`modules/apps/cookies/cookies-impl/.../batch/03-object-entry.batch-engine-data.json`).

## Use cases and how-tos

- Remember a UI toggle server-side (readable from JSP via `SessionClicks.get`):

  ```js
  import {setSessionValue} from 'frontend-js-web';

  setSessionValue('com.liferay.my.web_sidebarOpen', String(open));
  ```

- Remember a per-tab, non-sensitive UI preference client-side only:

  ```js
  import {sessionStorage} from 'frontend-js-web';

  sessionStorage.setItem(KEY, value, sessionStorage.TYPES.FUNCTIONAL);
  ```

- Keep the session alive while an editor is open (pattern from `useExtendSession.js`): call `Liferay.Session?.extend()` on an interval shorter than `Liferay.Session.sessionLength`, and clear the interval on unmount.

## Pitfalls and side effects

- `expire()` is not cosmetic. It calls `/portal/expire_session`, so a client timer that is out of sync kills a valid server session.
- **`getSessionValue` for a key that was never set resolves to the string `'get'`, not `''` or `undefined`.** `SessionClickAction.getValue()` passes `cmd` as the default value to `SessionClicks.get(request, key, cmd)` (`SessionClickAction.java`, `getValue`). Non-serialized values always come back as strings, and `'false'` is truthy. Ask callers to compare against expected values explicitly, or to store JSON objects (the `serialize://` path) so that "missing" is distinguishable.
- Session values written without `useHttpSession` are stored in portal preferences. For signed-in users that means database writes per call.
- Without consent, storage `setItem` is a silent no-op. Features then "forget" state only for users who rejected optional cookies, which is hard to reproduce in QA.
- The cookie inventory entry for `LFR_SESSION_STATE_userID` still describes a cookie, but master stores it in `localStorage` (`session.ts:51-52`, `_setTimestamp`).

> **⚠️ REVIEW-FLAG [outdated]:** The old guideline says session values are associated "with a user's session". In master they go to `PortalPreferences` by default, which is persisted per user for signed-in users. Only `{useHttpSession: true}` stores them in the HTTP session. Evidence: `portal-impl/src/com/liferay/portal/action/SessionClickAction.java:49-70`, `portal-kernel/src/com/liferay/portal/kernel/util/SessionClicks.java:75-108`. Old guideline said: "makes a request to the server to associate `data` with `key` in the user's session" (`guidelines/dxp/session.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** Code reading says `getSessionValue('neverSetKey')` resolves to `'get'`, because the request's `cmd` is used as the default value. This looks like a long-standing bug rather than intended behavior. Confirm it at runtime before citing it in a review, and consider filing a fix. Evidence: `portal-impl/src/com/liferay/portal/action/SessionClickAction.java` (`getValue`: `SessionClicks.get(httpServletRequest, key, cmd)`), `portal-kernel/.../SessionClicks.java:27-50`. Old guideline said: "retrieves string data from the user's session" (`guidelines/dxp/session.md`).

> **⚠️ REVIEW-FLAG [uncertain]:** `checkConsent` allows access when the `CONSENT_TYPE_*` cookie is absent. Whether that cookie is pre-set to `'false'` before the user decides depends on cookie banner configuration (explicit consent mode, which is itself marked deprecated). I did not verify the effective default behavior at runtime. Evidence: `frontend-js-web/.../liferay/util/cookie/cookie.js` (`checkConsent`), `cookies-api/.../CookiesPreferenceHandlingConfiguration.java:72-75`. Old guideline said: nothing on consent.

> **⚠️ REVIEW-FLAG [policy]:** Whether new first-party cookies or `localStorage` keys must be registered in the cookie inventory (`cookies-impl/.../03-object-entry.batch-engine-data.json`) is a process question that needs human confirmation. The existing `LFR_SESSION_STATE_userID` entry is already stale. Evidence: `03-object-entry.batch-engine-data.json:88-94`. Old guideline said: nothing on this.

## Not carried over

- The GitHub permalinks to `session.es.js` at an old commit. Replaced with current master paths.
