# Resource Serving in DXP

This document explains how different resources (`.js`, `.css`, etc.) are handled by DXP to be served to the browser.

## Common Serving Architecture

When it comes to serving anything from DXP there are two important files from which to start the investigation. Both are inside [portal-web/docroot/WEB-INF](https://github.com/liferay/liferay-portal/tree/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-web/docroot/WEB-INF):

1. [`web.xml`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-web/docroot/WEB-INF/web.xml): this is the standard `web.xml` file of DXP webapp. It defines the portlets and filters that should be loaded by the application server (by default, Tomcat).
2. [`liferay-web.xml`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-web/docroot/WEB-INF/liferay-web.xml): this is a clone of `web.xml` that is loaded by DXP once `com.liferay.portal.kernel.servlet.filters.invoker.InvokerFilter` is loaded.

The default DXP startup sequence goes like this:

1. `Tomcat` is started.
2. `Tomcat` bootstraps the `ROOT` application.
3. The `ROOT` application initializes `com.liferay.portal.kernel.servlet.filters.invoker.InvokerFilter` and maps it to every URL requested.
4. The `InvokerFilter` processes `liferay-web.xml` and behaves like a standard application server.

This means that we only have to care about `liferay-web.xml` unless we need to find anything so low-level that we need to look at `web.xml`. It also means, that any request to DXP passes through `InvokerFilter` so it is a good place to put a breakpoint if we want to investigate any request routing.

> Keep in mind that, even though you could theoretically know how a request will be routed by looking at `liferay-web.xml`, there are thousands of ways to alter the flow. For example: some filters can be disabled by configuration (`portal.properties` or `System Settings`) and even the code of a filter may invoke another filter not mapped under `liferay-web.xml` under the hood.

> In general, the current state of request servicing is a bit entangled so the safest way to learn something is to use the debugger and use a default `portal.properties` file that doesn't disable filters (unless we really want to investigate what happens when a certain filter is disabled).

Let's now analyze each resource type request and see how it is serviced.

## Serving Architecture per Resource Type

This section analyzes how each resource type is piped through the different filters and servlets until it is finally served. You can see [the next section](#filter-descriptions) to find an in-depth description of what each filter does.

### JS Resources

URLs ending in `.js` are routed through these filters:

1. Header Filter
2. ETag Filter
3. Cache Filter - Resource
4. GZip Filter
5. Language Filter
6. Aggregate Filter

### CSS Resources

URLs ending in `.css` are routed through these filters:

1. Header Filter
2. ETag Filter
3. Cache Filter - Resource
4. GZip Filter
5. Aggregate Filter
6. Dynamic CSS Filter

### PNG Image Resources

1. Header Filter
2. ETag Filter
3. GZip Filter - Theme PNG

### Other Image (GIF, ICO, JPG) Resources

1. Header Filter
2. ETag Filter

## Filter Descriptions

### Header Filter

This is a configurable filter that allows adding arbitrary headers to a HTTP response.

Out of the box it comes preconfigured in DXP to add:

-   `Cache-Control: max-age=315360000, public`
-   `Expires: 315360000`

Note that, even though the filter looks generic, for any header, its implementation assumes that it is aimed at cache handling (probably because of its OOB configuration) and takes decisions based on the `t` parameter of the request and the `If-Modified-Since` header so that if the value of `t` is older than the one in the `If-Modified-Since` the portal automatically sends a `304 Not modified` HTTP status code, bypassing any further processing.

The filter also has some logic to avoid adding those two headers under certain circumstances when the session is new or the `web.server.proxy.legacy.mode` portal property has been set to `true`.

### ETag Filter

This filter computes [ETags](https://en.wikipedia.org/wiki/HTTP_ETag) for served resources unless they are bigger than the configured portal property `etag.response.size.max` or the request has the `etag` parameter set to `false`. The computed ETags are then added to the HTTP response as a header.

The algorithm to compute the ETag is a simple checksum computation that can be found in the [`ETagUtil` class](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-impl/src/com/liferay/portal/servlet/filters/etag/ETagUtil.java#L63).

> Note that this filter just adds the `ETag` header to the response, but doesn't handle the rest of the caching control protocol that is necessary for HTTP.

> Also note that, for dynamic resources, it may make more sense to avoid using this filter and compute `ETag`s with a better/safer/faster algorithm.

### Cache Filter

This filter is implemented in a single class but can be configured for friendly URLs, layouts and resources. We will describe the resources behavior only.

Caches are maintained by `companyId`. Then, there's a portal property called `cache.filter.include.user.agent` that when set to `true` maintains caches per user agent, instead of a global one for all browsers. By default it is `true`.

Basically this filter caches responses that are subject to caching (similar to what a proxy cache would do). Specifically it scans the `Cache-Control` header for `no-cache` but runs other additional tests to make sure that a request can be cached safely.

When a cache hit occurs, the server returns the same response it sent last time (including headers, not just the content).

### GZip Filter

This filter compresses the response with the `gzip` algorithm. Its activation can be altered:

1. Request parameter `compress`: when set to `false` filter is inhibited.
2. The browser's `Accept-Encoding` header: unless `gzip` is accepted, the filter is disabled.

### Language Filter

This filter first determines the request's locale from a variety of sources: the `languageId` parameter, the `ThemeDisplay`, `doAsUserLanguageId` parameter, stored session value, user, cookies, ... See [the class' source code](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-impl/src/com/liferay/portal/servlet/filters/language/LanguageFilter.java) for more detail.

Once the locale is determined, it replaces each occurrence of `Liferay.Language.get(...)` by the translated value according to the deployed `Language.properties` files.

> This filter is the reason why placing any `Liferay.Language.get(...)` call in your JavaScript source works transparently without calling the server again or executing any code.

> And of course, it is also the reason why dynamic language keys cannot be used in JavaScript.

### Aggregate Filter

This filter is used to bundle multiple JavaScript files into a minified single resource (called bundle) that can be fetched from the server, as well as to minify single JavaScript or CSS files.

In addition, it also gathers all JavaScript code contained in `<aui:script>` tags (and not marked inline) into a single block of code that is written at the end of the page.

#### JavaScript Bundle

> ⚠ This is a deprecated mechanism, though it still works if someone configures it. ⚠

This filter was used to serve _JavaScript bundles_ (sets of `.js` files that are bundled into a single resource) which were identified in the `portal.properties` file with the `javascript.bundle.ids` property. Out of the box, DXP came configured with two bundles: `javascript.barebone.files` and `javascript.everything.files`.

Each bundle had a location in the server's URL space defined by the portal property `javascript.bundle.dir`. So, for example, both `javascript.bundle.dir[javascript.barebone.files]` and `javascript.bundle.dir[javascript.everything.files]` were located in the root of the server (`/`). This is the place from which the files in the bundle were retrieved when requested.

Finally, any `.js` resource you requested (no matter what the URL was) which had valid `minifierType` and `minifierBundleId`/`bundleId` request parameters returned a cached copy of the JavaScript bundle aggregate. Any value was valid for `minifierType` while only defined bundles could be passed as `minifierBundleId`/`bundleId`.

However, as it is now, DXP doesn't define any file in `portal.properties` for any of the two predefined bundles because they were migrated to a `DynamicInclude` service registration.

Note that the caches of this filter are invalidated by means of the [`PortalWebResourcesUtil.getLastModified("js")`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-kernel/src/com/liferay/portal/kernel/servlet/PortalWebResourcesUtil.java#L40) method, which looks up all registered [`PortalWebResources`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-kernel/src/com/liferay/portal/kernel/servlet/PortalWebResources.java) services with the `"js"` `resourceType` to find the latest modified one and the time when it was updated.

#### JavaScript Single File

When a single `.js` file is requested and the `minifierType` is set to `js`, the filter will minify the JavaScript file contents delegating to the [`MinifierUtil.minifyJavascript()` method](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java#L45), which invokes the configured minifier (the OSGi service implementing the [`JavaScriptMinifier`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-impl/src/com/liferay/portal/minifier/JavaScriptMinifier.java) interface with highest service ranking).

Currently there are two implementations of `JavaScriptMinifier` which come out of the box with DXP: [`YahooJavaScriptMinifier`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/modules/apps/frontend-js/frontend-js-minifier/src/main/java/com/frontend/js/minifier/YahooJavaScriptMinifier.java) and [`GoogleJavaScriptMinifier`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/modules/apps/frontend-js/frontend-js-minifier/src/main/java/com/frontend/js/minifier/GoogleJavaScriptMinifier.java) (the default).

#### CSS Single File

In this case (when a single `.css` file is requested) the filter does three things:

1. Aggregating all imported CSS files (using the `@import url(...);` syntax) into one single resource.
2. Replacing CSS tokens.
3. Minifying the resulting CSS content.

The first step simply concatenates the CSS content of the imported files and the host one and updates relative URLs to avoid breaking the resulting CSS.

The second invokes [`DynamicCSSUtil.replaceToken()`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-impl/src/com/liferay/portal/servlet/filters/dynamiccss/DynamicCSSUtil.java#L47) to substitute the tokens `@base_url@`, `@portal_ctx@` and `@theme_image_path@` by their respective values.

Finally, the last step invokes [`MinifierUtil.minifyCss()`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-impl/src/com/liferay/portal/minifier/MinifierUtil.java#L37) to minify the generated CSS which, in turn, uses [`CSSCompressor`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-impl/src/com/liferay/portal/minifier/CSSCompressor.java) (an inlined fork of the old YUI CSS compressor) to minify the served CSS.

### Dynamic CSS Filter

This is a very limited version of the `AggregateFilter` for CSS files. All it does is call [`DynamicCSSUtil.replaceToken()`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-impl/src/com/liferay/portal/servlet/filters/dynamiccss/DynamicCSSUtil.java#L47), as in the other filter, to substitute the tokens `@base_url@`, `@portal_ctx@` and `@theme_image_path@` by their respective values.

Other than that, it also caches the result, but doesn't aggregate `@import url()` referenced files or manipulate the CSS in any other way.

> Note that this filter is affected by the `t` parameter which can be used to override the `last modified` value if `t` is set to a higher value (if it is set to a lower value it will be ignored).

> Also note that this filter is only enabled for `.css` files belonging to context paths **NOT** registered as [`PortalWebResources`](https://github.com/liferay/liferay-portal/blob/ab8d31265d241bb69c33c0a46914e1e2fe55c008/portal-kernel/src/com/liferay/portal/kernel/servlet/PortalWebResources.java).
