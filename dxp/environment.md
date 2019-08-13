# Environment

Unlike many other, smaller frontend projects, [Liferay DXP](https://github.com/liferay/liferay-portal) does not have a simplistic notion of running in a "production" or "development" environment: instead, it has a [large number of individual properties](https://github.com/liferay/liferay-portal/blob/master/portal-impl/src/portal.properties) that control specific aspects of its behavior, and these can be used in various combinations.

This document will cover:

1. Property settings that are useful for development-like environments.
2. Property settings that are useful for production-like environments.
3. What `NODE_ENV` means in the context of Liferay DXP.

## Properties for "development"-like enviroments

For the most part, Liferay DXP ships with defaults that make it behave in a reasonable way "out of the box" in production-like environments. This means that for development purposes, some adjustment is required. Assuming a typical development set up in which you have a clone of the [liferay-portal repo](https://github.com/liferay/liferay-portal) alongside a "bundles" directory from which you run Tomcat, you can add the following settings to your `bundles/portal-ext.properties` file.

For the latest recommended developer settings, see the [portal-developer.properties file](https://github.com/liferay/liferay-portal/blob/master/portal-impl/src/portal-developer.properties).

### Turning off caching

```
com.liferay.portal.servlet.filters.alloy.CSSFilter=false
com.liferay.portal.servlet.filters.cache.CacheFilter=false
com.liferay.portal.servlet.filters.etag.ETagFilter=false
com.liferay.portal.servlet.filters.header.HeaderFilter=false
combo.check.timestamp=true
javascript.fast.load=false
layout.template.cache.enabled=false
theme.css.fast.load.check.request.parameter=true
theme.css.fast.load=false
theme.images.fast.load.check.request.parameter=true
theme.images.fast.load=false
```

### Turning off minification

```
javascript.log.enabled=false
minifier.enabled=false
```

### Enabling telnet access to the [Gogo shell](https://portal.liferay.dev/docs/7-2/customization/-/knowledge_base/c/using-the-felix-gogo-shell)

```
module.framework.properties.osgi.console=localhost:11311
```

### Assorted quality-of-life improvements

```
# Don't pop up a browser window at launch.
browser.launcher.url=

# Enable theme previews.
com.liferay.portal.servlet.filters.themepreview.ThemePreviewFilter=true

# Automatically update database schema when needed.
schema.module.build.auto.upgrade=true

# Delay the expiry of login sessions.
session.timeout=100000
session.timeout.auto.extend=true
```

### Allow [IPv6 from localhost](https://dev.liferay.com/en/discover/deployment/-/knowledge_base/7-0/choosing-ipv4-or-ipv6)

```
tunnel.servlet.hosts.allowed=0:0:0:0:0:0:0:1
```

## Properties for "production"-like enviroments

As mentioned above, the default settings are usually suitable for "production"-like environments, so an empty `portal-ext.properties` file is a good approximation for developing and testing functionality in a production environment.

### Turning on GZIP

This one is off by default because of its CPU utilization, but you may want to activate it for testing GZIP-related functionality:

```
com.liferay.portal.servlet.filters.gzip.GZipFilter=true
gzip.compression.level=1
```

## `NODE_ENV` in Liferay DXP

### `NODE_ENV=production`

In the absence of an explicit `NODE_ENV`, our frontend tooling such as the [liferay-npm-bundler](https://github.com/liferay/liferay-js-toolkit/tree/master/packages/liferay-npm-bundler) and [liferay-npm-scripts](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts) will behave suitably for a production environment.

As such, you should never need to set `NODE_ENV=production` explicitly.

### `NODE_ENV=test`

Tests will run in the "test" environment by default.

### `NODE_ENV=development`

Set `NODE_ENV=development` to force our build tooling to produce development-friendly versions of artifacts.

> **Note:** The `NODE_ENV` environment variable propagates throughout the various layers of tooling, so the following all have the effect of setting `NODE_ENV=development` during the build:

```sh
# At the top level:
env NODE_ENV=development ant all

# In a project directory such as module/apps/*/*:
env NODE_ENV=development gradlew clean deploy -a

# Or:
env NODE_ENV=development yarn build
```

### Setting `NODE_ENV` persistently

If you want `NODE_ENV=development` to apply persistently when developing inside liferay-portal you have several options:

1. Run `export NODE_ENV=development` at the start of your shell session; or:
2. Add an `export` to your `~/.bash_profile`/`~/.zshrc` etc.

### Making a development build of React

Building a development version of React enhances the debugging experience. To do this, deploy a development build from inside [the frontend-js-react-web module](https://github.com/liferay/liferay-portal/tree/master/modules/apps/frontend-js/frontend-js-react-web):

```sh
env NODE_ENV=development gradlew clean deploy -a
```
