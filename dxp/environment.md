# Environment

Unlike many other, smaller frontend projects, [Liferay DXP](https://github.com/liferay/liferay-portal) does not have a simplistic notion of running in a "production" or "development" environment: instead, it has a large number of individual properties [used at run-time](https://github.com/liferay/liferay-portal/blob/master/portal-impl/src/portal.properties) and [build-time](https://github.com/liferay/liferay-portal/blob/master/build.properties) that control specific aspects of its behavior, and these can be used in many combinations.

This document will cover:

1. Run-time settings that are useful for development-like environments.
2. Run-time settings that are useful for production-like environments.
3. Build-time settings and what `NODE_ENV` means in the context of Liferay DXP.

## Run-time settings for "development"-like enviroments

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

### Enabling the "deployFast" task

```
work.dir.override.enabled=true
```

With this setting, you can make changes to JS, JSP, and CSS files and see the results without doing a full deploy:

```
gradlew deploy # do the initial deploy
gradlew deployFast -at # start the deployFast task
```

If you make changes to other (non-JS/JSP/CSS) files, you'll need to CTRL-C the `deployFast` task and `deploy`/`deployFast -at` again, as described in [the announcement post in Loop](https://loop.liferay.com/home/-/loop/feed/19825955).

### Enabling telnet access to the Gogo shell

You can access the [Gogo shell](https://portal.liferay.dev/docs/7-2/customization/-/knowledge_base/c/using-the-felix-gogo-shell) from the web interface (Control Panel &raquo; Configuration &raquo; Gogo Shell), even in production-like environments. In development contexts, however, it is useful to enable local access via telnet:

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

## Run-time properties for "production"-like enviroments

As mentioned above, the default settings are usually suitable for "production"-like environments, so an empty `portal-ext.properties` file is a good approximation for developing and testing functionality in a production environment.

### Turning on GZIP

This one is off by default because of its CPU utilization, but you may want to activate it for testing GZIP-related functionality:

```
com.liferay.portal.servlet.filters.gzip.GZipFilter=true
gzip.compression.level=1
```

## Build-time properties and the role of `NODE_ENV` in Liferay DXP

### `NODE_ENV=production`

Similar to how our runtime settings have "production"-like defaults, in the absence of an explicit `NODE_ENV`, our build tooling will behave suitably for a production environment.

### `NODE_ENV=test`

Jest tests will _run_ in the "test" environment by default.

Note, however, that our CI infrastructure performs a standard build before running any tests, and that build effectively uses a `NODE_ENV` of "production".

### `NODE_ENV=development`

`NODE_ENV=development` will force our build tooling to produce development-friendly versions of artifacts. See "[Debugging](./debugging.md)" for a discussion of how `NODE_ENV=development` can be used to aid in debugging inside Liferay DXP.

### Setting `NODE_ENV` temporarily

There are three main ways to invoke frontend tooling such as [liferay-npm-bundler](https://github.com/liferay/liferay-js-toolkit/tree/master/packages/liferay-npm-bundler) and [liferay-npm-scripts](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts) in the context of Liferay DXP:

-   Using Yarn (eg. `yarn build`, `yarn checkFormat` etc); or:
-   Via Gradle (eg. `gradlew deploy -a`); or:
-   Ant (eg. `ant all`).

> **Note:** We recommend installing the [gradle-launcher package](https://www.npmjs.com/package/gradle-launcher) which provides a global `gradlew` executable that automatically locates and runs the nearest local `gradlew` script.

When invoking `yarn` directly, you can set the `NODE_ENV` in the traditional way; that is, with a command like:

```sh
env NODE_ENV=development yarn build
```

When using `ant` or `gradlew`, the `nodejs.node.env` property defined in [the `build.properties` file](https://github.com/liferay/liferay-portal/blob/master/build.properties) at the top of the [liferay-portal repo](https://github.com/liferay/liferay-portal) controls the value of `NODE_ENV` passed to the tools. It defaults to empty, which is equivalent to "production".

To override the value in a Gradle run:

```sh
# Use `-P` to override `nodejs.node.env` from build.properties:
gradlew clean deploy -a -Pnodejs.node.env=development

# If `nodejs.node.env` is not set in build.properties, a simple `env NODE_ENV` will work too:
env NODE_ENV=development gradlew clean deploy -a
```

To override the value in an Ant run:

```sh
# Use `-D` to override `nodejs.node.env` from build.properties:
ant all -Dnodejs.node.env=development

# If `nodejs.node.env` is not set in build.properties, a simple `env NODE_ENV` will work too:
env NODE_ENV=development ant all
```

> **Warning:** Using `-D` in this way will cause `ant` to cache a copy of the override in your `.gradle/gradle.properties` file, which means it _will_ take effect on following `gradlew` runs.

You can reset (regenerate) `.gradle/gradle.properties` at any time by running `ant setup-sdk` from the repository root.

### Setting `NODE_ENV` persistently

If you want `NODE_ENV=development` to apply persistently when developing inside liferay-portal you have several options:

-   For `ant` and `gradlew`:
    -   Create a `build.$USER.properties` file in liferay-portal repo root containing `nodejs.node.env=development`.
-   For `yarn` and other commands run in the shell:
    -   Run `export NODE_ENV=development` at the start of your shell session; or:
    -   Add that `export` to your `~/.bash_profile`/`~/.zshrc` etc.

In practice, actually deploying changes requires the use of Gradle, so we recommend setting `nodejs.node.env` in your `build.$USER.properties` file.

> **Note:** `build.*.properties` files are ignored by Git, which means that they won't survive a `git clean`. Either keep a copy of your customizations in a safe place, or pass the `-e build.$USER.properties` flag when you run `git clean`.

As noted in the previous section, temporary actions may end up having unintended permanent effects because of the way `ant` caches a copy of Gradle properties under `.gradle/gradle.properties`. You can reset (regenerate) the `.gradle/gradle.properties` file by running `ant setup-sdk` from the repository root.

#### Use case example: making a development build of React

Building a development version of React enhances the debugging experience in [the React Dev Tools](https://github.com/facebook/react-devtools). To do this, deploy a development build from inside [the frontend-js-react-web module](https://github.com/liferay/liferay-portal/tree/master/modules/apps/frontend-js/frontend-js-react-web):

```sh
# Override nodejs.node.env just once:
gradlew clean deploy -a -Pnodejs.node.env=development

# Or, if you have a persistent override set up in your
# build.$USER.properties file, as described above:
gradlew clean deploy -a
```

### Other useful `build.properties`

#### JSP precompilation

This setting may speed up builds by skipping ahead-of-time JSP precompilation:

```
jsp.precompile=off
```

#### Gradle binaries cache

This setting specifies a local clone of [the liferay/liferay-binaries-cache-2020 repo](https://github.com/liferay/liferay-binaries-cache-2020) to use as a cache of Gradle artifacts:

```
# This is the default; you can set it to an empty value to ignore the cache:
build.binaries.cache.dir=../${build.binaries.cache.repository.name}
```

For example, if you cloned [liferay-portal](https://github.com/liferay/liferay-portal) in a directory called `portal/liferay-portal`, the above setting says the cache clone should exist at `portal/liferay-binaries-cache-2020`.

Does the cache actually make the build faster?

-   On a fast network, you probably won't notice any difference; if anything, if the cache is not already up-to-date when you start the build, you may actually notice a slowdown.
-   On a slow network, it definitely makes a difference (although having an up-to-date copy of the cache before you start is critical). On bad connections, having the cache can make the difference between being able to finish the build at all, and it not finishing ever.

For more details see "[How to Improve Build Time](https://grow.liferay.com/people?p_p_id=com_liferay_wiki_web_portlet_WikiPortlet&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_com_liferay_wiki_web_portlet_WikiPortlet_struts_action=%2Fwiki%2Fview&_com_liferay_wiki_web_portlet_WikiPortlet_redirect=%2Fpeople%3Fq%3Dbuild%2520&_com_liferay_wiki_web_portlet_WikiPortlet_pageResourcePrimKey=751906&p_r_p_http%3A%2F%2Fwww.liferay.com%2Fpublic-render-parameters%2Fwiki_nodeName=Grow&p_r_p_http%3A%2F%2Fwww.liferay.com%2Fpublic-render-parameters%2Fwiki_title=How+to+Improve+Build+Time#Clone-liferay-binaries-cache-2020)".
