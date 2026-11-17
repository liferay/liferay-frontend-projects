# Development environment, runtime toggles and debugging

<!-- Sources: guidelines/dxp/environment.md, guidelines/dxp/debugging.md, guidelines/dxp/javascript_minification.md -->

**Applies when the PR touches:** `portal-impl/src/portal.properties` or `portal-impl/src/portal-developer.properties` keys `javascript.*`, `theme.*.fast.load*`, `combo.*`, `minifier.*`, `strip.*`, `layout.template.cache.enabled`, `template.engine.cache.enabled`, `com.liferay.portal.servlet.filters.{strip,etag,header,gzip,themepreview,aggregate}.*`, `feature.flag.*`; `build.properties` `nodejs.*`; `portal-impl/src/com/liferay/portal/minifier/**`, `portal-impl/src/com/liferay/portal/servlet/ComboServlet.java`, `portal-impl/src/com/liferay/portal/servlet/filters/{strip,aggregate}/**`, `portal-kernel/.../frontend/source/map/FrontendSourceMapUtil.java`, `ServicePreAction.java` fast-load logic; `frontend-js-loader-modules-extender` (`Details` configuration, `JSLoaderTopHeadDynamicInclude`); `frontend-js-web` `FrontendCachingConfiguration`, `SessionTimeoutConfiguration`. Code signals: `process.env.NODE_ENV`, `console.log|info|debug|warn|error`, `MinifierUtil`, `isThemeJsFastLoad`, `js_fast_load`, `css_fast_load`, `explainResolutions`, `logLevel`, `exposeGlobal`, `configuration.override.`.

## What the reviewer needs to know

### There is no single dev/prod switch

Behavior comes from three independent layers:

1. **Portal properties** (`portal-impl/src/portal.properties`, overridden in `portal-ext.properties`, or through env vars of the form `LIFERAY_<KEY>` as written on each property's `Env:` line).
2. **OSGi configuration / System Settings**. It can also be set from properties with `configuration.override.<pid>_<key>=<typed value>` (`modules/apps/static/portal-configuration/portal-configuration-persistence-api/.../ConfigurationOverridePropertiesUtil.java:45`). `portal-developer.properties` uses this syntax.
3. **Build-time `NODE_ENV`** for the JS/CSS bundles (see `build-process.md`).

### Recommended developer settings: `portal-developer.properties`

- Master ships `portal-impl/src/portal-developer.properties`. Developers enable it with `include-and-override=portal-developer.properties` in `portal-ext.properties`. Server Admin's production readiness check reports it if it is included (`modules/apps/server/server-admin-web/.../ProductionReadinessCheckUtil.java:562-575`).
- Frontend-relevant values in it: `theme.css.fast.load=false`, `theme.css.fast.load.check.request.parameter=true`, `theme.images.fast.load=false`, `theme.images.fast.load.check.request.parameter=true`, **`javascript.fast.load=true`** (it stays on), `javascript.log.enabled=false`, `layout.template.cache.enabled=false`, `template.engine.cache.enabled=false`, `combo.check.timestamp=true`, `direct.servlet.context.reload=true`, `minifier.enabled=false`, `browser.launcher.url=`, `module.framework.properties.osgi.console=localhost:11311`, `com.liferay.portal.servlet.filters.etag.ETagFilter=false`, `com.liferay.portal.servlet.filters.header.HeaderFilter=false`, `com.liferay.portal.servlet.filters.themepreview.ThemePreviewFilter=true`, `feature.flag.ui.visible[dev]=true`, and `configuration.override.com.liferay.frontend.js.web.internal.configuration.FrontendCachingConfiguration_cachingStrategy="use-one-hash-per-file"`.

### Runtime toggles that affect frontend resources (verified in master)

| Key (default) | What it does now | Evidence |
|---|---|---|
| `javascript.fast.load` (`true`) | Decides whether top-head JS is combined through `ComboServlet` or emitted as separate `<script>` tags. Also sets the loader's `combine` flag and the AUI filter (`min` vs `raw`/`debug`). It does **not** minify anything. The URL parameter `js_fast_load=0` overrides it and is kept in the session. | `portal.properties:1758-1770`, `ServicePreAction.java:1477-1479`, `TopHeadDynamicInclude.java:68`, `LiferayGlobalObjectPreAUIDynamicInclude.java:279-302`, `JSLoaderTopHeadDynamicInclude.java:78` |
| `theme.css.fast.load` (`true`) + `theme.css.fast.load.check.request.parameter` (`false`) | Combines theme and contributor CSS. When the check property is `true`, `css_fast_load=0` overrides it per session. | `ServicePreAction.java:1453-1459` |
| `theme.images.fast.load` (`true`) + `...check.request.parameter` | The `images_fast_load` request parameter has **no effect**: the `SessionParamUtil.getBoolean` result is thrown away. | `ServicePreAction.java:1461-1467` |
| `combo.check.timestamp` (`false`), `combo.check.timestamp.interval` (`1000`) | `ComboServlet` cache invalidation. With `false`, combined responses are cached for good. | `portal.properties:6407-6416`, `ComboServlet.java:251,488-497` |
| `minifier.enabled` (`false`, **deprecated**) | Turns on runtime **CSS** minification only (`MinifierUtil.minifyCss`, which is `@Deprecated` "with no direct replacement"). | `portal.properties:8611-8621`, `portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java:32-43` |
| `com.liferay.portal.servlet.filters.strip.StripFilter` (`false`) + `strip.*`, `minifier.inline.content.cache.*` | Off by default. When on, it strips whitespace and minifies inline `<style>` (CSS only). Inline `<script>` content passes through unchanged (only cached). Request params `strip=false` and `ensureContentLength` and `p_p_lifecycle` 1/2 still apply. | `portal.properties:10310`, `StripFilter.java:117-153` (CSS), `:261-296` (JS passthrough), `:479-484`, `:572` |
| `javascript.log.enabled` (`false`) | Legacy AUI/YUI logging: the AUI filter becomes `debug` when fast load is off, and `bottom_js_logging.jspf` is included. Not related to ESM code. | `LiferayGlobalObjectPreAUIDynamicInclude.java:284`, `portal-web/docroot/html/common/themes/bottom.jsp:24` |
| `com.liferay.portal.servlet.filters.gzip.GZipFilter` (`false`), `gzip.compression.level` (`-1`) | GZip of responses, off by default because of CPU cost. | `portal.properties:10230,6633` |
| `layout.template.cache.enabled`, `template.engine.cache.enabled` (`true`) | FTL/layout template caching. Turn off to see template edits without redeploying. | `portal.properties:5092,9916` |

### System Settings that matter for frontend debugging

- **JavaScript Loader** (pid `com.liferay.frontend.js.loader.modules.extender.internal.configuration.Details`, category Infrastructure). It has `explainResolutions` (default false), `exposeGlobal` (false), `logLevel` (default **`warn`**: off/error/warn/info/debug), `waitTimeout` (60 s) and `applyVersioning`. The values are written inline into `window.__CONFIG__` by `JSLoaderTopHeadDynamicInclude.java:63-97`. The configuration is marked `deprecated = true` and tied to feature flag **`LPD-48372`** ("The AMD loader is deprecated and will be removed in the future"). That flag defaults to `true` with type `deprecation` (`portal.properties:6892,7566-7571`). When the flag is off, the loader and its config are not emitted at all.
- **Frontend Caching** (`frontend-js-web/.../FrontendCachingConfiguration.java`, company scope). It sets `cachingStrategy` (`do-not-use-hashes` by default, `use-one-hash-per-file`, `use-one-hash-per-web-context`, which changes the URLs in the import map), the `send-no-cache-for-*` toggles, and the max-age values for JS, CSS, labels and translated JS. During development, the no-cache toggles are the supported way to avoid stale browser caches.
- **Session Timeout** (`frontend-js-web/.../SessionTimeoutConfiguration.java`: `autoExtend`, `autoExtendOffset`). It replaces the old `session.timeout.auto.extend` property (`PreupgradeVerifyProperties.java:969-973`). `session.timeout` itself is still a portal property (default `15`).

### Server-side JS minification is gone

- `JavaScriptMinifier`, the `frontend-js-minifier` module, and the Google Closure / YUI JS minifiers no longer exist in master (`git grep JavaScriptMinifier` and `git grep frontend-js-minifier` return nothing). `MinifierUtil` keeps only `minifyCss`.
- `ComboServlet` does not minify JS (`ComboServlet.java:604-619`). It rewrites `import` paths and strips `sourceMappingURL` comments through `FrontendSourceMapUtil` (`portal-kernel/.../frontend/source/map/FrontendSourceMapUtil.java`). CSS goes through `MinifierUtil.minifyCss`, which is a no-op unless `minifier.enabled=true`. `AggregateFilter` also touches only CSS.
- JS minification happens only at build time (esbuild when `NODE_ENV=production`, terser for themes).

> **⚠️ REVIEW-FLAG [outdated]:** The old minification architecture (a `JavaScriptMinifier` service ranked by OSGi, Google Closure as default, YUI as fallback, `StripFilter`/`ComboServlet`/`JSLoaderConfigServlet`/`JSBundleConfigServlet` calling `MinifierUtil.minifyJavaScript()`) is gone. Only CSS runtime minification remains, and it is deprecated and off by default. `StripFilter` is disabled by default. There is no `/js_loader_config` servlet any more: the loader config is inlined in the page. Evidence: `portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java:32-43`, `portal.properties:8621,10310`, `StripFilter.java:261-296`, `ComboServlet.java:604-619`, `JSLoaderTopHeadDynamicInclude.java:72-97`. Old guideline said: "`GoogleJavaScriptMinifier` … is the default DXP minifier" and "If all the rules match and a `<script>` is minified, the filter simply invokes `MinifierUtil.minifyJavaScript()`" (`guidelines/dxp/javascript_minification.md`).

> **⚠️ REVIEW-FLAG [outdated]:** "Turning off minification" with `minifier.enabled=false` and `javascript.log.enabled=false` no longer does what it says. Both are already the defaults, and neither affects JS minification, which is decided at build time by `NODE_ENV`. Evidence: `portal.properties:1811,8621`; `modules/frontend-sdk/node-scripts/util/esbuild/util/runEsbuild.mjs:37`. Old guideline said: "### Turning off minification `javascript.log.enabled=false` `minifier.enabled=false`" (`guidelines/dxp/environment.md`).

> **⚠️ REVIEW-FLAG [outdated]:** The old "turning off caching" list has drifted. `com.liferay.portal.servlet.filters.alloy.CSSFilter` and `com.liferay.portal.servlet.filters.cache.CacheFilter` do not exist in master. Master's own developer file keeps `javascript.fast.load=true`, where the old list recommended `false`. Evidence: `git grep -n "filters.alloy\|filters.cache.CacheFilter"` returns nothing; `portal-impl/src/portal-developer.properties`. Old guideline said: "`com.liferay.portal.servlet.filters.alloy.CSSFilter=false` `com.liferay.portal.servlet.filters.cache.CacheFilter=false` … `javascript.fast.load=false`" (`guidelines/dxp/environment.md`).

> **⚠️ REVIEW-FLAG [outdated]:** `deployFast` and `work.dir.override.enabled` were removed. The Gradle task was dropped in LPD-42696, and the property is listed as obsolete. There is no replacement in the old material. Evidence: `modules/sdk/gradle-plugins/CHANGELOG.md:1056` ("Remove deployFast"), `portal-impl/src/com/liferay/portal/verify/PreupgradeVerifyProperties.java:2087` (in `_OBSOLETE_PORTAL_KEYS`). Old guideline said: "`work.dir.override.enabled=true` … `gradlew deployFast -at`" (`guidelines/dxp/environment.md`).

> **⚠️ REVIEW-FLAG [gap]:** The current fast iteration loop for frontend work (after `deployFast` was removed) is not documented in the old material. Possible candidates are `direct.servlet.context.reload=true` for JSPs, `node-scripts build:custom --serve` (an esbuild watch server on port 8081, `bundle/custom.mjs:12-31`), and a plain `gradlew deploy`. The team should say which workflow is recommended. Evidence: `portal-developer.properties`, `modules/frontend-sdk/node-scripts/bundle/custom.mjs`. Old guideline said: "With this setting, you can make changes to JS, JSP, and CSS files and see the results without doing a full deploy" (`guidelines/dxp/environment.md`).

### Build-time environment (`NODE_ENV`)

- **production** (Gradle default through `build.properties:597` `nodejs.node.env=production`, and on CI through `nodejs.ci.node.env=production`): esbuild minifies, so `process.env.NODE_ENV === 'development'` blocks are removed. Sass uses the `compressed` style. Themes are minified with terser.
- **development**: no minification, Sass `expanded`, development blocks kept. React (exported by `frontend-js-react-web`) is built in development mode with React's dev warnings, because esbuild defines `process.env.NODE_ENV` as `"development"` whenever minification is off.
- **test**: `node-scripts test` forces `NODE_ENV=test` (`modules/frontend-sdk/node-scripts/test/index.mjs:23-25`). So `=== 'development'` branches **do not run in Jest** either.
- How to set it, and the change in default, are covered in `build-process.md`. The short version: use `-Pnodejs.node.env=development` or `nodejs.node.env=development` in `build.<user>.properties`, then `ant setup-sdk`, which copies `nodejs.*` into `.gradle/gradle.properties` (`build-common.xml:2172,2235`). A shell `NODE_ENV` is overridden by the property under Gradle.

> **⚠️ REVIEW-FLAG [outdated]:** Dev-only code is now removed by esbuild (`define` of `process.env.NODE_ENV` plus minifier dead-code elimination), not by `babel-plugin-transform-node-env-inline` + `babel-plugin-minify-dead-code-elimination` in liferay-npm-bundler. The pattern for authors is the same. The `env NODE_ENV=development gradlew …` and `ant all -Dnodejs.node.env=…` variants that rely on an empty `nodejs.node.env` no longer apply, because `build.properties` sets it to `production`. Evidence: `runEsbuild.mjs:28-38`, `build.properties:597`; checked with `modules/node_modules/.bin/esbuild` 0.21.5 (unminified output keeps `if (true)`, minified output drops the block). Old guideline said: "In liferay-npm-bundler, we use babel-plugin-transform-node-env-inline …" (`guidelines/dxp/debugging.md`) and "If `nodejs.node.env` is not set in build.properties, a simple `env NODE_ENV` will work too" (`guidelines/dxp/environment.md`).

### Source maps

- esbuild always writes `.js.map` next to each bundle, production included (`sourcemap: true`, `util/esbuild/bundleJavaScriptMain.mjs:64`). Sass always writes CSS maps (`util/sass/util/runSass.mjs`). The `sources` entries are rewritten to virtual paths `/sourcemap/<Web-ContextPath>/src/…`, `/node_modules/…` and `/generated/…` (`util/esbuild/util/relocateSourcemap.mjs`). In browser devtools the original files appear under that tree.
- Files served through `ComboServlet` (legacy top-head JS and combined CSS) have their `sourceMappingURL` stripped, so they have no maps in the browser. Use `js_fast_load=0` / `css_fast_load=0` to get individual files.

## Review checklist

- **New `console.*` calls in shipped code**: `no-console` allows only `warn` and `error` (`modules/frontend-sdk/eslint-plugin/configs/general.js:149`), so `log` is lint's job. For `warn`/`error`, ask whether the user can act on the message. Prefer graceful recovery and UI-level error states, and put diagnostic or deprecation messages behind `process.env.NODE_ENV === 'development'`.
- **Dev-only branches**: they must use the exact literal `process.env.NODE_ENV === 'development'` (or `!== 'production'`) so esbuild can remove them. Remember they never run in CI builds or in Jest (`NODE_ENV=test`). A test cannot cover them, and behavior must not depend on them. A typo makes them silently dead (real example: `ai-creator-openai-web/.../AICreatorModal.tsx:102` compares against `'developm̀ent'`).
- **New code calling `MinifierUtil`, or relying on server-side JS minification**: `MinifierUtil` is deprecated and only handles CSS. Large non-bundled JS (legacy `META-INF/resources/*.js`, top-head resources) ships unminified. Ask for it to go through the node-scripts bundle, or accept the size knowingly.
- **New dependencies on the AMD loader's debug knobs** (`explainResolutions`, `exposeGlobal`, `Liferay.Loader` logging): that configuration is deprecated under `LPD-48372`. Do not build new features or docs on it. `exposeGlobal=true` publishes `define` globally and breaks third-party UMD libraries.
- **Changes to defaults of the toggles in the table above, or to `portal-developer.properties`**: `portal-developer.properties` changes every developer's environment and the production-readiness check. A default change in `portal.properties` changes production caching behavior. Ask for the reason and for an upgrade note if production is affected.
- **New frontend toggle added as a portal property**: master has been moving such keys into OSGi configurations (System Settings), for example session auto-extend. Ask whether a configuration interface fits better (company or instance scope, editable at runtime).
- **Changes to `ServicePreAction` fast-load logic, `ComboServlet` caching or `FrontendSourceMapUtil`**: these affect every page. Ask for testing with `javascript.fast.load` both on and off, and with `combo.check.timestamp` on and off.

## Use cases and how-tos

- **Debug unminified JS of one module**: `gradlew clean deploy -Pnodejs.node.env=development` in the module. For React dev warnings, do the same in `modules/apps/frontend-js/frontend-js-react-web`, which builds React's exported bundle.
- **Log only in development, once**:

  ```js
  let warned = false;

  export function oldApi(...args) {
  	if (process.env.NODE_ENV === 'development' && !warned) {
  		console.warn('oldApi is deprecated: use newApi instead');

  		warned = true;
  	}

  	return newApi(...args);
  }
  ```

- **See individual legacy JS/CSS files instead of combo responses**: add `?js_fast_load=0` (and `css_fast_load=0` with `theme.css.fast.load.check.request.parameter=true`). The value sticks for the session.
- **Inspect module resolution**: for ESM, read the inline `<script type="importmap">` in the page head (`frontend-js-importmaps-extender/.../JSImportMapsExtenderTopHeadDynamicInclude.java:55`). For legacy AMD, use System Settings > Infrastructure > JavaScript Loader > Explain Module Resolutions and the log level.
- **Avoid stale browser caches while developing**: System Settings > Frontend Caching > send no-cache for JS/CSS. Also `combo.check.timestamp=true`.
- **Inspect what the build did**: `build/node-scripts/esbuild/config/*.json` (the exact esbuild options), `CREATE_BUNDLE_REPORTS=yes` for size reports, and `node-scripts report:*`.
- **Debug a Jest test in VS Code**: `modules/frontend-sdk/node-scripts/example-vscode-debug-config.json` (it runs `yarn test <file>` with `NODE_ENV=test`).
- **Gogo shell over telnet**: `module.framework.properties.osgi.console=localhost:11311` (already in `portal-developer.properties`). It is also available in Control Panel > Gogo Shell.

## Pitfalls and side effects

- `js_fast_load` / `css_fast_load` are stored in the session (`SessionParamUtil`). After testing with `=0`, the session keeps that mode until it is reset or ends.
- `combo.check.timestamp=false` (the production default) caches combined responses forever. A developer who hot-swaps a file under a running production-like portal sees stale content.
- Production bundles ship source maps (`.js.map`) and the `.ts`/`.tsx` sources, publicly reachable under the module web context. Do not put secrets or internal-only comments in frontend sources.
- `theme.images.fast.load.check.request.parameter=true` gives a false sense of control: `images_fast_load` is ignored (`ServicePreAction.java:1463-1466`).
- Disabling the AMD loader feature flag (`LPD-48372`) removes `window.__CONFIG__`, `Liferay.Loader` and the AMD bridges' runtime. Code still using `Liferay.Loader.require` breaks.

## Not carried over

- `deployFast` / `work.dir.override.enabled` workflow: removed (LPD-42696; property obsolete). Flagged above as a gap for the replacement workflow.
- `com.liferay.portal.servlet.filters.alloy.CSSFilter`, `...cache.CacheFilter`: these properties do not exist in master.
- `GoogleJavaScriptMinifier`, `YahooJavaScriptMinifier`, `JavaScriptMinifier`, `frontend-js-minifier`, and the remarks about how hard it is to upgrade Closure: removed from master.
- `JSLoaderConfigServlet` (`/js_loader_config`): gone. The config is inline (`JSLoaderTopHeadDynamicInclude`). `JSBundleConfigServlet` (legacy AUI, `frontend-js-bundle-config-extender`) still exists but does not minify. It is not review-relevant here.
- `session.timeout.auto.extend` property: moved to `SessionTimeoutConfiguration` (mentioned above).
- `tunnel.servlet.hosts.allowed` IPv6 tip, `gradle-launcher` npm package, `build.binaries.cache.dir` and `jsp.precompile=off` build-speed tips: personal environment tips with no review relevance. The properties still exist (`build.properties:61,377`, `portal.properties:10630`).
- Logging philosophy prose: compressed into the checklist (see the policy flag below).

> **⚠️ REVIEW-FLAG [policy]:** The team logging stance ("Log as little as possible. Recover gracefully (and preferably silently) from errors", with `warn`/`error` used sparingly and only for actual problems) is a team convention. Lint enforces only the `log` ban. Confirm it still holds. Evidence: `modules/frontend-sdk/eslint-plugin/configs/general.js:149`. Old guideline said: "Log as little as possible. Recover gracefully (and preferably silently) from errors." (`guidelines/dxp/debugging.md`).
