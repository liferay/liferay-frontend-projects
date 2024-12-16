You can leverage Liferay's `blade` tool to create an empty portlet. Please
refer to
[blade's documentation](https://dev.liferay.com/develop/tutorials/-/knowledge_base/7-0/blade-cli)
for information on how to do it.

Once you have created a portlet project, initialize a `package.json` file
inside it by running `npm init` and begin using npm as you would do in a normal
project.

> 👀 Keep in mind that you must place all your web resources (JS, CSS, HTML,
> ...) in the `src/main/resources/META-INF/resources` folder, which is the
> standard place where resources are placed in OSGi bundles.

When you are ready to deploy your portlet, edit your `package.json` file and
configure a `build` script with the commands needed to build your project.

> 👀 You can use any languages you like as long as they can be transpiled to
> Ecmascript 5 or higher and use the CommonJS module resolution architecture
> (that is, Node.js's `require()` and `module.exports` idioms).
>
> Note that this can easily be achieved by writing ES2015+ code and then using
> Babel to transpile it.

The `build` script will be automatically run when you deploy your portlet to
Liferay running `gradlew deploy`.

After everything is transpiled (if necessary) to Ecmascript 5+ and CommonJS you
must run the [liferay-npm-bundler](../packages/liferay-npm-bundler) tool to
pack all JavaScript code (including npm dependencies) and transform it to AMD
so that [Liferay AMD Loader](https://www.npmjs.com/package/@liferay/amd-loader)
may grab it from the server to use it in the browser.

> 👀 In essence, `liferay-npm-bundler` is a bundler (like webpack or
> Browserify) that targets Liferay Portal as platform and assumes that you will
> be using your npm packages from portlets (as opposed to pure web
> applications).

The peculiarity of running npm packages inside portlets makes the workflow a
bit different from standard bundlers (like Browserify or webpack) because in
this scenario you cannot just bundle all needed JavaScript in a single file,
but instead you must _link_ all packages together in the browser when the full
web page is assembled so that different portlets may share versions of modules
instead of each one loading its own copy. That's where `liferay-npm-bundler`
comes in handy.

You may read more about `liferay-npm-bundler` in the
[liferay-npm-bundler manual](https://github.com/izaera/liferay-frontend-projects/blob/master/projects/js-toolkit/docs/manuals/liferay-npm-bundler.md).

Or you may read more about the technical details of OSGi bundles containing npm
packages in the
[deployment architecture document](https://github.com/izaera/liferay-frontend-projects/blob/master/projects/js-toolkit/docs/reference/deployment-architecture.md).
