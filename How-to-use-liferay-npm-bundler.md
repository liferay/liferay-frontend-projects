The liferay-npm-bundler tool is of a kind known as bundler, like [Browserify](http://browserify.org/) or [webpack](https://webpack.js.org/).

So, why writing another bundler? The main reason is that due to the modularity of Liferay Portal, several portlets that don't know each other in advance may need to cooperate to share their Javascript dependencies, so we cannot just deploy all Javascript in a single file like other bundlers do for web applications.

On the contrary, we need to bundle enough information so that Liferay can -when assembling a page- determine which packages must be used and how they are going to be shared among different portlets.

And that's where `liferay-npm-bundler` comes in handy.

## Installation

```sh
npm install --save-dev liferay-npm-bundler
```

## Usage

Usually `liferay-npm-bundler` is called in your `package.json` build script after all transpilation and processing has taken place.

To do so, you must have something similar to this in your `package.json` file:

```json
"scripts": {
    "build": "… && liferay-npm-bundler"
}
```

Where the `…` refers to any previous step you need to perform like, for example, transpiling your sources with Babel.

The output of `liferay-npm-bundler` is a directory that is suitable for deploying npm packages to Liferay as explained in [[How to deploy npm packages to Liferay]].

This tool is configured by means of a `.npmbundlerrc` file that must live inside the project's root folder. Continue reading to know how to write such file.

## How it works internally

This tool assumes a Liferay portlet project as input and outputs its files to a `build` directory so that the standard Gradle build for portlets can carry on and produce an OSGi bundle that can be deployed to Liferay Portal.

To do so, it runs the project source files through the following workflow:

1. Copy project's `package.json` file to the output directory.

2. Traverse project's dependency tree to determine which packages are needed to run it.

3. For each dependency package:

   1. Copy package to output dir (in plain _package_@_version_ format, as opposed to the standard `node_modules` tree format). To determine what is copied, the bundler invokes a special type of plugins intended to filter the package file list.
   2. Pre-process package with configured plugins.
   3. Run Babel through each `.js` file in the package with configured plugins.
   4. Post-process package with configured plugins.

4. For the project:

   1. Pre-process project's package with configured plugins.
   2. Run Babel through each `.js` file in the project with configured plugins.
   3. Post-process project's package with configured plugins.

The pre and post process steps are the same, they only differ in the moment when they are run (before or after Babel is run, respectively). In these steps, `liferay-npm-bundler` calls all the configured plugins so that they can perform transformations on the npm packages like, for instance, modifying its `package.json` file, or deleting or moving files.

Let's see an example with the following `.npmbundlerrc` file (which is also the default used when no `.npmbundlerrc` file is present):

```json
{
  "preset": "liferay-npm-bundler-preset-standard"
}
```

If we run `liferay-npm-bundler` with this file, it will apply the [config file](https://github.com/liferay/liferay-js-toolkit/blob/master/packages/liferay-npm-bundler-preset-standard/config.json) found in `liferay-npm-bundler-preset-standard`:

```json
{
  "/": {
    "plugins": ["resolve-linked-dependencies"],
    ".babelrc": {
      "presets": ["liferay-standard"]
    },
    "post-plugins": ["namespace-packages", "inject-imports-dependencies"]
  },
  "*": {
    "plugins": ["replace-browser-modules"],
    ".babelrc": {
      "presets": ["liferay-standard"]
    },
    "post-plugins": ["namespace-packages", "inject-peer-dependencies"]
  }
}
```

This states that for all npm packages (`*`) the pre-process phase (`plugins`) must run the `replace-browser-modules` plugin (if we wanted to run that plugin during the post phase, it should say `post-plugins` instead of `plugins`).

Looking at the [documentation](https://github.com/liferay/liferay-js-toolkit/blob/master/packages/liferay-npm-bundler-plugin-replace-browser-modules/README.md) of `replace-browser-modules` plugin we can see that this plugin replaces Javascript modules as defined under the `browser` section of `package.json`
files. This means that, for each npm package that our project has as dependency, `liferay-npm-bundler` will make sure that each one having a `browser` section in its `package.json` files will have its server side files replaced by their counterpart browser versions.

The next part of the `.npmbundlerrc` section specifies the `.babelrc` file to use when running Babel through the packages'`.js` files. Please keep in mind that, in this phase, Babel is used to transform package files (for example to convert them to AMD format if necessary) not to transpile them (though, in theory, you could transpile them too if you wanted by configuring the proper plugins).

In this example, we use the `liferay-standard` preset, that applies the following plugins according to
[its documentation](https://github.com/liferay/liferay-js-toolkit/tree/master/packages/babel-preset-liferay-amd):

1. [babel-plugin-normalize-requires](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-plugin-normalize-requires)
2. [babel-plugin-transform-node-env-inline](https://www.npmjs.com/package/babel-plugin-transform-node-env-inline)
3. [babel-plugin-wrap-modules-amd](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-plugin-wrap-modules-amd)
4. [babel-plugin-name-amd-modules](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-plugin-name-amd-modules)
5. [babel-plugin-namespace-modules](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-plugin-namespace-modules)
6. [babel-plugin-namespace-amd-define](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-plugin-namespace-amd-define)

Checking the documentation of these plugins we find out that Babel will:

1. Remove trailing `.js` strings from `require()` calls in our packages.
2. Replace occurrences of `process.env.NODE_ENV` by its literal value.
3. Wrap modules with an AMD `define()` call.
4. Give a canonical name to each AMD module based on its package and relative path inside it.
5. Namespace module names in `define()` and `require()` calls with the project's package name.
6. Prefix `define()` calls with `Liferay.Loader.`.

Thus, after running `liferay-npm-bundler` on our project we will have a folder with all our npm dependencies extracted from the project's `node_modules` folder and modified to make them work on Liferay Portal under management of its [Liferay AMD Loader](https://github.com/liferay/liferay-amd-loader).

A similar section for the project's root package (denoted by `/`) is also listed in the `.npmbundlerrc` which defines similar steps for the project's `package.json` and `.js` files.

## Controlling what files are transformed

You can control what gets transformed and what doesn't at three levels:

1. You can force inclusion of npm packages in the output artifact even if they are not used anywhere in the code. This can be useful to bundle badly configured transitive dependencies, for example. See the [`include-dependencies`](.npmbundlerrc-file-reference#include-dependencies) option for more information.
2. You can exclude any subset of files (or the whole package) in npm packages. This is useful to prevent imported packages from being bundled or optimize the resulting JAR by removing unused (or server only) files. See the [`exclude`](.npmbundlerrc-file-reference#exclude) section for more information.
3. You can tell the tool to avoid processing (specifically with Babel) of any subset of files in the project (not of npm packages). This can be useful if you want to provide some Javascript files in your project that don't need to be AMDized, for example. See the [`ignore`](.npmbundlerrc-file-reference#ignore) section for more information.

## Creating OSGi bundles

As of [#164](https://github.com/liferay/liferay-js-toolkit/issues/164), `liferay-npm-bundler` can create full fledged OSGi bundles for you. OSGi bundle creation is activated when the [`create-jar`](.npmbundlerrc-file-reference#create-jar) option is given.

See [[Creating OSGi bundles]] for a detailed explanation of this feature.

## Configuring the bundler

As said before, `liferay-npm-bundler` is configured placing a `.npmbundlerrc` file in your project's folder. The available options for that file are described in the following sections.

In addition, some of the options in `.npmbundlerrc` can be passed using command line arguments and/or environment variables. See the detailed explanations of `.npmbundlerrc` options to know more about them.

### Miscellaneous options

- [`output`](.npmbundlerrc-file-reference#output): specifies output directory of the project
- [`preset`](.npmbundlerrc-file-reference#preset): specifies the name of the `liferay-npm-bundler` preset to use as base configuration
- [`config`](.npmbundlerrc-file-reference#config): specifies plugin specific configuration

#### Logging

- [`verbose`](.npmbundlerrc-file-reference#verbose): controls verbose logging of what the tool is doing
- [`dump-report`](.npmbundlerrc-file-reference#dump-report): controls generation of a detailed report file

#### Privacy

- [`no-tracking`](.npmbundlerrc-file-reference#no-tracking): controls sending of usage analytics to our servers
  doing

### Package processing options

#### Miscellaneous options

- [`process-serially`](.npmbundlerrc-file-reference#process-serially): tells the tool wether to process each npm package sequentially or all in parallel

#### Plugin configuration options

- [`*`](.npmbundlerrc-file-reference#-asterisk): defines default plugin configuration for all npm packages
- [`/`](.npmbundlerrc-file-reference#-forward-slash): defines plugin configuration for project files
- [`packages`](.npmbundlerrc-file-reference#packages): defines per-package plugin configuration for npm packages

#### Exclusion, ignores, and inclusions

- [`exclude`](.npmbundlerrc-file-reference#exclude): excludes any subset of files in npm packages (or whole packages)
- [`ignore`](.npmbundlerrc-file-reference#ignore): skips processing of project's Javascript files with Babel
- [`include-dependencies`](.npmbundlerrc-file-reference#include-dependencies): force inclusion of dependency packages even if they are not used by the project

### OSGi bundle creation options

#### Miscellaneous options

- [`create-jar.output-dir`](.npmbundlerrc-file-reference#create-jaroutput-dir): specifies where to place the final JAR
- [`create-jar.features.js-extender`](.npmbundlerrc-file-reference#create-jarfeaturesjs-extender): controls whether to process the OSGi bundle with the [JS Portlet Extender](https://web.liferay.com/marketplace/-/mp/application/115542926)
- [`create-jar.features.web-context`](.npmbundlerrc-file-reference#create-jarfeaturesweb-context): specifies the context path to use for publishing bundle's static resources

#### Features

- [`create-jar.features.localization`](.npmbundlerrc-file-reference#create-jarfeatureslocalization): specifies the L10N file to be used by the bundle (see [Localization](Configuring-pure-javascript-projects#localization) for more information)
- [`create-jar.features.configuration`](.npmbundlerrc-file-reference#create-jarfeaturesconfiguration): specifies the JSON file describing the configuration structure (see [Configuration](Configuring-pure-javascript-projects#configuration) for more information)
