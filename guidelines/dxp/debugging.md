# Debugging

## Logging

Having more information sounds like a good thing, but when it comes to logging, it's very easy for a stream of useful information to grow into a flood. This is especially true of [Liferay DXP](https://github.com/liferay/liferay-portal), which has an enormous array of functionality built by many teams. If we log too much, then finding relevant information within the bulk becomes difficult.

Another problem with extensive logging is that it can easily be perceived as "console spew", and that reflects badly on the quality of the product. Customers may not have the necessary context to distinguish messages that indicate real problems from ones which merely seek to helpfully inform. Logging may actually scare or alarm people more than it helps them, especially when you consider the population of users — often customers of our customers — who know enough to open a browser console but who know little or nothing about the underlying system.

So, this leads us to our overall philosophy:

> Log as little as possible. Recover gracefully (and preferably silently) from errors. When there are problems that can't be resolved automatically, design user experiences that permit recovery (for example, that allow users to retry operations).

### On the use of `console.log`

`console.log` may be used as a temporary debugging aid but never committed to the repo, so we [use the `no-console` rule](https://github.com/liferay/eslint-config-liferay/pull/79) (via [eslint-config-liferay](https://github.com/liferay/eslint-config-liferay)) to prevent accidents. `console.error` and `console.warn` may be used sparingly to communicate _actual problems_, but in keeping with our philosophy, always prefer to implement graceful recovery and user experiences that are designed with resilience in mind. The section on `NODE_ENV=development` below describes one way in which you can avoid the "console spew" problem but still log useful information in a development context while keeping production environments pristine.

### Logging and the JS loader

[The loader](https://github.com/liferay/liferay-amd-loader) in [Liferay DXP](https://github.com/liferay/liferay-amd-loader) is a great example of how useful information can can "grow into a flood", but fortunately, you have full control over how much information it outputs. By default and in normal operation, it won't log anything, but if you ever need to troubleshoot a loading issue you can turn on "Explain Module Resolutions" in the DXP Control Panel, as well as set the log level ("Warn" is a reasonable starting point). To do this, visit the Control Panel &raquo; Configuration &raquo; System Settings &raquo; Infrastructure &raquo; JavaScript Loader:

![JavaScript Loader settings](../images/dxp-javascript-loader-settings.png)

## Use of `NODE_ENV=development`

When we build with `NODE_ENV=development` we can create sections of code that will only run in development environments. In [liferay-npm-bundler](https://github.com/liferay/liferay-js-toolkit/wiki/How-to-use-liferay-npm-bundler), we use [babel-plugin-transform-node-env-inline](https://www.npmjs.com/package/babel-plugin-transform-node-env-inline) to turn `process.env.NODE_ENV === 'development'` checks into simple `true`/`false` booleans. Thanks to [our use](https://github.com/liferay/liferay-js-toolkit/pull/380) of [minify-dead-code-elimination](https://www.npmjs.com/package/babel-plugin-minify-dead-code-elimination) Babel plug-in, those checks get completely stripped out in production builds, but remain intact in development environments (see "[Environment](./environment.md)" for a description of how to set `NODE_ENV` in [Liferay DXP](https://github.com/liferay/liferay-portal)).

As an example of how to log useful information only in development, consider [this pull request](https://github.com/jbalsas/liferay-portal/pull/1993/commits/9de7281d33a9705899d1ba7918c390ff6f4f48e6), which logs a deprecation warning only in development, and only on the first call to a function:

```javascript
let didEmitDeprecationWarning = false;

export function openSimpleInputModal(data) {
	if (process.env.NODE_ENV === 'development' && !didEmitDeprecationWarning) {
		console.warn(
			'The named "openSimpleInput" export is deprecated: use the default export instead'
		);

		didEmitDeprecationWarning = true;
	}

	return openSimpleInputModalImplementation.call(null, data);
}
```

If we build in a development environment (using `env NODE_ENV=development yarn build`, or having done the set-up described in "[Environment](./environment.md)"), we can inspect the "build/" directory and find that it produced the following code; note how the environment check gets transformed into `if (true)`, which allows the debug code to run:

```javascript
var didEmitDeprecationWarning = false;

function openSimpleInputModal(data) {
	if (true && !didEmitDeprecationWarning) {
		console.warn(
			'The named "openSimpleInput" export is deprecated: use the default export instead'
		);
		didEmitDeprecationWarning = true;
	}

	return openSimpleInputModalImplementation.call(null, data);
}
```

In contrast, if we inspect the result in "build/" after doing a production build (ie. using `env NODE_ENV=production yarn build`), we see that the `NODE_ENV` check (this time, transformed into `if (false)` and therefore making our debug code unreachable) got completely stripped out, along with all of the code inside the `if`:

```javascript
var didEmitDeprecationWarning = false;

function openSimpleInputModal(data) {
	return openSimpleInputModalImplementation.call(null, data);
}
```
