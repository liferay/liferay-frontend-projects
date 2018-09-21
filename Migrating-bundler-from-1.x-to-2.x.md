1. First of all, read the [three blog posts](https://community.liferay.com/blogs/-/blogs/why-we-need-a-new-liferay-npm-bundler-1-of-3-) explaining the changes made in 2.x version series.

2. Then, head on to your bundler based project, update `liferay-npm-bundler` dependency to `^2.0.0` and remove any `liferay-npm-bundler-preset-...` dependency (as bundler 2.x already comes with those inside).

3. Edit your `.npmbundlerrc` file and remove any preset you had configured.

4. Do one of:

* **If you used Babel to transpile your project's code:**

Remove any `babel-preset-...` or `babel-plugin-...` dependencies contained in [this repository](https://github.com/liferay/liferay-npm-build-tools/tree/1.x/packages) and/or not directly used by your project.

For example, nearly all bundler 1.x projects used [babel-preset-liferay-project](https://github.com/liferay/liferay-npm-build-tools/tree/1.x/packages/babel-preset-liferay-project) in addition to anything else you were using to transpile your code.

Then edit your `.babelrc` and remove all the previous removed presets/plugins from the configuration.

* **If you don't need Babel to transpile your project's code:**

In this case just remove any Babel related dependency directly and delete any `.babelrc` file hanging around.
