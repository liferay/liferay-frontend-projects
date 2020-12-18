# JavaScript Minification in DXP

This article describes DXP infrastructure to minify JavaScript source files. It is related to [Resource Serving in DXP](resource_serving.md).

## `MinifierUtil`, `JavaScriptMinifier` and `frontend-js-minifier`

These three pieces form the basic infrastructure available in DXP to minify JavaScript code.

-   [`JavaScriptMinifier`](https://github.com/liferay/liferay-portal/blob/3c6bbac29b64769b665e37798c7f51d4e45b6ff0/portal-impl/src/com/liferay/portal/minifier/JavaScriptMinifier.java): describes the interface that services to minify JavaScript must implement.

-   [`MinifierUtil`](https://github.com/liferay/liferay-portal/blob/3c6bbac29b64769b665e37798c7f51d4e45b6ff0/portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java): provides a way to retrieve the `JavaScriptMinifier` with highest service ranking currently deployed to DXP. Note that you can also obtain a reference to a `JavaScriptMinifier` (or all of them) using standard OSGi mechanisms (for example: [`@Component`](https://docs.osgi.org/javadoc/r4v43/cmpn/org/osgi/service/component/annotations/Component.html) or [`ServiceTracker`](https://docs.osgi.org/javadoc/r6/core/org/osgi/util/tracker/ServiceTracker.html)).

-   [`frontend-js-minifier`](https://github.com/liferay/liferay-portal/blob/3c6bbac29b64769b665e37798c7f51d4e45b6ff0/portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java): this project contains the two default minifiers that DXP ships out-of-the-box (Google and Yahoo). See the two following sections for more details.

> Note that, even though, `JavaScriptMinifier` and `MinifierUtil` are inside `portal-impl` to maintain backward compatibility, the implementation of the minifiers has been extracted to an OSGi module (`frontend-js-minifier`) for modularity.

### `GoogleJavaScriptMinifier`

This is the default DXP minifier (because it is deployed with a higher service ranking than the other ones available).

It uses [Google Closure Compiler](https://github.com/google/closure-compiler) under the hood. Because this is an _internal_ library from Google (thus unsupported and subject to big breaking changes) updating it usually has a significant cost so it is not done very often.

### `YahooJavaScriptMinifier`

This uses [YUI Compressor](https://github.com/yui/yuicompressor) from Yahoo!, which is still active but unmaintained (except for some PRs that get merged from time to time). The last commit at the time of this writing (Sep 2020) is from May 2019.

Unless someone has a very good reason to use it, this shouldn't be the choice for any production site but it is still shipped for compatibility reasons.

## Components of DXP using the minifier

Currently, the following components in DXP use the minifier services.

### `StripFilter`

This is a filter used to minify inline JavaScript code contained in `<script>` tags and embedded in the HTML code.

> It also does transformations for `<input>`, `<textarea>`, `<pre>` and `<style>` but that's out of the scope of this document.

It filters any resource with its URL starting with (as specified in [`liferay-web.xml`](https://github.com/liferay/liferay-portal/blob/3c6bbac29b64769b665e37798c7f51d4e45b6ff0/portal-web/docroot/WEB-INF/liferay-web.xml)):

-   `/c/...`
-   `/group/...`
-   `/user/...`
-   `/web/...`

And it can be configured with:

-   [portal.properties](https://github.com/liferay/liferay-portal/blob/3c6bbac29b64769b665e37798c7f51d4e45b6ff0/portal-impl/src/portal.properties):
    -   `minifier.inline.content.cache.enabled`: set to `true` to make the filter minify `<script>` tags content (by default, `true`).
    -   `minifier.inline.content.cache.skip.javascript`: this defines a comma separated list of tokens to look for in the `<script>` content so that, if any is found, the minified response is not cached. By default, any `<script>` containing `getSessionId` or `encryptedUserId` is not cached.
    -   `strip.ignore.paths`: list of paths to ignore (by default, `/document_library/get_file`).
    -   `strip.mime.types` in `portal.properties`: defines the MIME types of responses that should be processed by the filter (by default, `text/html*` and `text/xml*`). Note that you can put a `*` at the end of the config values to catch all MIME types starting with the string to the left of the `*`.
-   Request parameters:
    -   `ensureContentLength`: set to `true` if you want to make sure the `Content-Length` header is returned from the server.
    -   `strip`: set to `false` to disable the filter.
    -   `p_p_lifecycle`: if it is `1` ([`PortletRequest.ACTION_PHASE`](https://docs.oracle.com/cd/E13155_01/wlp/docs103//javadoc/javax/portlet/PortletRequest.html#ACTION_PHASE)) or `2` ([`PortletRequest.RESOURCE_PHASE`](https://docs.oracle.com/cd/E13155_01/wlp/docs103//javadoc/javax/portlet/PortletRequest.html#RESOURCE_PHASE)) the filter is disabled.

If all the rules match and a `<script>` is minified, the filter simply invokes [`MinifierUtil.minifyJavaScript()`](https://github.com/liferay/liferay-portal/blob/3c6bbac29b64769b665e37798c7f51d4e45b6ff0/portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java#L45) to do its duty.

### `AggregateFilter`

This filter is already described in [Resource Serving in DXP](resource_serving.md#aggregate-filter).

### `ComboServlet`

This servlet aggregates several `.js` or `.css` files and serves them as a single request to ease caching and reduce connection count. It also caches its responses.

It honors the `work.dir.override.enabled` portal property so if it is set to `true` it diverts requests to development project folders when using fast deployments.

The way to invalidate this servlet's cache is to check if any of the aggregated files has changed. If the portal property `combo.check.timestamp` is set to `false` (and by default, it is, in production systems) the check is not performed and the cache is never invalidated. Otherwise files are tested for changes every `combo.check.timestamp.interval` milliseconds (where `combo.check.timestamp.interval` is a configuration value of `portal.properties`).

Finally, each `.js` file aggregated by the servlet has its name tested for the `-min.js` or `.min.js` suffixes and, if they are NOT found, its content is minified using [`MinifierUtil.minifyJavaScript()`](https://github.com/liferay/liferay-portal/blob/3c6bbac29b64769b665e37798c7f51d4e45b6ff0/portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java#L45).

### `JSLoaderConfigServlet`

This servlet services request to the `/js_loader_config` URL, which returns the [AMD Loader](https://github.com/liferay/liferay-amd-loader) configuration so that the browser side can access it.

For example, it sets the following [loader properties](https://github.com/liferay/liferay-amd-loader/blob/17a5ab58150c211c433ca29b784a8e7460fba314/src/loader/config.js): `explainResolutions`, `logLevel`, `resolvePath` and `waitTimeout`.

It also controls the value of `Liferay.EXPLOSE_GLOBAL` which causes `Liferay.Loader.define()` method to be published under `window.define` (this is for compatiblity reasons, but its use is strongly discouraged as it can cause issues with third party libraries).

Even though it is small, this servlet minifies its response with [`MinifierUtil.minifyJavaScript()`](https://github.com/liferay/liferay-portal/blob/3c6bbac29b64769b665e37798c7f51d4e45b6ff0/portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java#L45) and also caches it for efficiency.

### `JSBundleConfigServlet`

This servlet services request to the `/js_bundle_config` URL, which is the configurator of the legacy `AUI` loader.

This servlet does not cache its response but minifies it leveraging [`MinifierUtil.minifyJavaScript()`](https://github.com/liferay/liferay-portal/blob/3c6bbac29b64769b665e37798c7f51d4e45b6ff0/portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java#L45).
