# liferay-npm-bundler

The liferay-npm-bundler tool is of a kind known as bundler, like
[Browserify](http://browserify.org/) or [webpack](https://webpack.js.org/).

So, why writing another bundler? The main reason is that due to the modularity
of Liferay Portal, several portlets that don't know each other in advance may
need to cooperate to share their JavaScript dependencies, so we cannot just
deploy all JavaScript in a single file like other bundlers do for web
applications.

On the contrary, we need to bundle enough information so that Liferay can -when
assembling a page- determine which packages must be used and how they are going
to be shared among different portlets.

And that's where `liferay-npm-bundler` comes in handy.

## Installation

```sh
npm install --save-dev liferay-npm-bundler
```

## The two modes of operation

Since [#303](https://github.com/liferay/liferay-js-toolkit/issues/303) two
modes of operation coexist in the bundler.

The **old mode** assumed that, before the bundler, the build did some
preprocessing of sources so that after that, the bundler modified the output of
that preprocessing in place. For example: projects usually configured the
following:

```json
{
	"scripts": {
		"build": "babel --source-maps -d build src && liferay-npm-bundler"
	}
}
```

So that `babel` transpiled `.js` files from `src` to `build` and then the
bundler processed the produced `.js` files (inside `build`) again to prepare
them for deployment to Liferay Portal.

The **new mode** puts the bundler in charge of the whole build, much in the
same way as `webpack` expects to do everything needed when bundling a project.
So, the previous scenario is configured like:

```json
{
	"scripts": {
		"build": "liferay-npm-bundler"
	}
}
```

And now, because we don't run `babel`, we need to tell the bundler to transpile
`.js` files, which we do in its configuration file (`.npmbundlerrc`) like this:

```json
{
	"sources": ["src"],
	"rules": [
		{
			"test": "\\.js$",
			"exclude": "node_modules",
			"use": [
				{
					"loader": "babel-loader",
					"options": {
						"presets": ["env"]
					}
				}
			]
		}
	]
}
```

This makes the bundler process the `.js` files in `src` with `babel` and write
the result in `build` (because the default output directory is `build`).

> 👀 Note that in this case the bundler works like a typical build tool,
> reading from `src` and writing to `build`, as opposed to just modifying
> `build` when the old mode is used.

## The input

The expected input varies for the old and new modes of operation though nothing
prevents you from mixing the two modes, migrating from the old to the new mode,
or providing a different format of project as input (as long as you know how to
configure the bundler properly).

The **old mode** was intended to get Liferay portlet projects as input right
after every static resource and transpiled `.js` files had been placed in the
`build` directory. In then modified that `build` directory so that the build
could carry on to produce an OSGi bundle that could be deployed to Liferay
Portal (as explained in the
[deployment architecture reference](../reference/deployment-architecture.md)).

That OSGi bundle could be created by the standard Gradle build for portlets or,
alternatively, by the bundler itself (this was made possible when the 
[JavaScript portlet](../reference/js-portlet-entry-point.md) feature was
introduced).

The **new mode** aims at controlling the whole build and not doing (or not
needing to do) anything outside of the bundler. It is inspired in `webpack` and
thus, the expected input is any type of project with source files that are then
transformed by rules into output artifacts that are then bundled into an OSGi
`.jar` file that can be deployed to Liferay Portal.

However, there's nothing that prevents you from running pre-bundler steps in
your build and then make it run rules over your source files to combine both
outputs. It's just that you must take care of what you are doing because the
bundler may overwrite or delete some files if you don't configure it correctly.

## The output

As explained in the previous section, the output of `liferay-npm-bundler` is a
directory that is suitable for deploying npm packages to Liferay Portal or a
deployable OSGi bundle containing the files in that directory.

## How it works internally

The bundler runs the project source files through the following workflow:

1. Copy project's `package.json` file to the output directory.

2. Traverse project's dependency tree to determine which packages are needed to
   run it.

3. For the project:

    1. Run source files inside the source directories configured in
	   [.npmbundlerrc](../reference/dot-npmbundlerrc.md#sources) through the
	   [rules](../reference/dot-npmbundlerrc.md#rules).
    2. Pre-process project's package with configured plugins.
    3. Run Babel through each `.js` file in the project with configured plugins
	   (this is intended to convert ES5 files into AMD modules, not to transpile
	   ES6+ sources).
    4. Post-process project's package with configured plugins.

4. For each dependency package:

    1. Copy package to output dir (in plain _package_@_version_ format, as
	   opposed to the standard `node_modules` tree format). To determine what is
	   copied, the bundler invokes a special type of plugin intended to filter
	   the package file list.
    2. Run rules on the package files.
    3. Pre-process package with configured plugins.
    4. Run Babel through each `.js` file in the package with configured plugins
	   (this is intended to convert ES5 files into AMD modules, not to do any
	   other type of processing).
    5. Post-process package with configured plugins.

The pre and post process steps are the same, they only differ in the moment
when they are run (before or after Babel is run, respectively). In these steps,
`liferay-npm-bundler` calls all the configured plugins so that they can perform
transformations on the npm packages like, for instance, modifying its
`package.json` file, or deleting or moving files.

> 👀 Note that the pre, post and Babel phases were designed for the **old
> mode** of operation (see 
> [The two modes of operation](#The-two-modes-of-operation)) so they will be
> gradually replaced by rules in the future as the preferred way of building
> projects.

### How rules run

Rules were inspired by
[webpack's loaders feature](https://webpack.js.org/loaders/). Loaders are npm
packages that export a function in their main module which receives source file
contents and returns them modified according to how the loader is configured.

So, for example, imagine that you want to transpile your ES6+ `.js` files into
ES5 code. You may use `babel-loader` for that, which runs `babel` through each
`.js` file and returns the resulting code in addition to the generated source
map.

In addition to your own project files, you may want to run loaders on third
party dependencies (i.e. packages in your `node_modules` folder). That's
possible too.

To configure all this you must use the `sources` and `rules` section of the
`.npmbundlerrc` file.

The `sources` section simply specifies an array of folders inside the project
that contain source files to be processed by rules. Any file outside those
folders will be completely ignored

## An example

Let's see an example with the following `.npmbundlerrc` file (which is also the
default used when no `.npmbundlerrc` file is present):

```json
{
	"preset": "liferay-npm-bundler-preset-standard"
}
```

If we run `liferay-npm-bundler` with this file, it will apply the
[config file](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-preset-standard/config.json)
found in `liferay-npm-bundler-preset-standard`:

```json
{
	"packages": {
		"/": {
			"plugins": ["resolve-linked-dependencies"],
			".babelrc": {
				"presets": ["liferay-standard"]
			},
			"post-plugins": [
				"namespace-packages",
				"inject-imports-dependencies"
			]
		},
		"*": {
			"plugins": ["replace-browser-modules"],
			".babelrc": {
				"presets": ["liferay-standard"]
			},
			"post-plugins": ["namespace-packages", "inject-peer-dependencies"]
		}
	}
}
```

This states that for all npm packages (`*`) the pre-process phase (`plugins`)
must run the `replace-browser-modules` plugin (if we wanted to run that plugin
during the post phase, it should say `post-plugins` instead of `plugins`).

Looking at the
[documentation](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-plugin-replace-browser-modules/README.md)
of `replace-browser-modules` plugin we can see that this plugin replaces
JavaScript modules as defined under the `browser` section of `package.json`
files. This means that, for each npm package that our project has as
dependency, `liferay-npm-bundler` will make sure that each one having a
`browser` section in its `package.json` files will have its server side files
replaced by their counterpart browser versions.

The next part of the `.npmbundlerrc` section specifies the `.babelrc` file to
use when running Babel through the packages'`.js` files. Please keep in mind
that, in this phase, Babel is used to transform package files (for example to
convert them to AMD format if necessary) not to transpile them. If you need to
transpile your files you need to call Babel before the bundler or configure the
[babel-loader](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-loader-babel-loader)
to do so.

In this example, we use the `liferay-standard` preset, that applies the
following plugins according to
[its documentation](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/babel-preset-liferay-standard):

1. [babel-plugin-normalize-requires](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/babel-plugin-normalize-requires)
2. [babel-plugin-transform-node-env-inline](https://www.npmjs.com/package/babel-plugin-transform-node-env-inline)
3. [babel-plugin-minify-dead-code-elimination](https://www.npmjs.com/package/babel-plugin-minify-dead-code-elimination)
4. [babel-plugin-wrap-modules-amd](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/babel-plugin-wrap-modules-amd)
5. [babel-plugin-name-amd-modules](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/babel-plugin-name-amd-modules)
6. [babel-plugin-namespace-modules](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/babel-plugin-namespace-modules)
7. [babel-plugin-namespace-amd-define](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/babel-plugin-namespace-amd-define)

Checking the documentation of these plugins we find out that Babel will:

1. Remove trailing `.js` strings from `require()` calls in our packages.
2. Replace occurrences of `process.env.NODE_ENV` by its literal value.
3. Wrap modules with an AMD `define()` call.
4. Give a canonical name to each AMD module based on its package and relative
   path inside it.
5. Namespace module names in `define()` and `require()` calls with the project's
   package name.
6. Prefix `define()` calls with `Liferay.Loader.`.

Thus, after running `liferay-npm-bundler` on our project we will have a folder
with all our npm dependencies extracted from the project's `node_modules`
folder and modified to make them work on Liferay Portal under management of its
[Liferay AMD Loader](https://www.npmjs.com/package/@liferay/amd-loader).

A similar section for the project's root package (denoted by `/`) is also
listed in the `.npmbundlerrc` which defines similar steps for the project's
`package.json` and `.js` files.

## Loader rules

As of [#303](https://github.com/liferay/liferay-js-toolkit/issues/164), you can
use webpack-like loaders in the bundling process. The loaders are intended to
transform source files before the processing takes place. Keep in mind that the
frontier between loaders transformation and processing is a bit blurry, because
it's all done sequentially so there are things that can be done either in the
loaders phase or in the Babel's processing phase, for instance.

To add more complexity, you can also choose to run something before the bundler
so you may end up with (to show an example) three places where you can
transpile your JavaScript files:

1. Before the bundler is run
2. In the loaders phase of the bundler
3. Inside the Babel transformation phase of the bundler

Historically, before the loaders appeared, option 1 was used. Using option 3 is
possible and could theoretically lead to faster build times, but is complex to
configure and may lead to unexpected side effects. Luckily, now that we have
loaders, we may use their phase for all transpiling and reduce the build to a
single do-it-all run of the `liferay-npm-bundler`.

So, how do loaders work? Loaders have been designed to resemble
[webpack loaders](https://webpack.js.org/loaders/) but because `webpack` creates
a single JS bundle file while `liferay-npm-bundler` targets an AMD loader, they
are not compatible. So, keep in mind that, though we try to make everything
similar to `webpack`, it hasn't got to be the very same and subtle (or even
huge) differences may appear.

Each loader is a npm package that exports a function with a well defined API
(see the
[loader interface reference](../reference/liferay-npm-bundler-loader-spec.md)
for more info on that). That function receives the content of a file, modifies
it, and returns the new content. Optionally, loaders may create new files next
to the files they are processing. For instance,
[babel-loader](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-loader-babel-loader)
writes a `.map` file next to each `.js` file after it finishes the process.

With this simple schema you may write any loader you may think of. For example:

1. You can create a loader to pass `.js` files throuh Babel or tsc.
2. You may convert `.css` files into JavaScript modules that dynamically inject
   the CSS into the HTML page.
3. You can process `.css` files with SASS.
4. You can create tools that generate code based on
   [IDL](https://en.wikipedia.org/wiki/Interface_description_language) files.
5. ...

You can even chain several loaders to act upon each file. That way you can, for
example, convert a `.scss` file into real CSS (by running the
[sass-loader](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-loader-sass-loader) 
on it) and then make it a JavaScript module with the
[style-loader](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler-loader-style-loader)
loader.

Please see the [loaders catalog](../reference/liferay-npm-bundler-loaders.md)
for more information on all known loaders.

### How to configure rules and loaders

To define the sources to be transformed by loaders you just need to use the
[.npmbundlerrc sources option](../reference/dot-npmbundlerrc.md#sources), which
is an array of folders right below the project's directory which contain files
to be transformed.

Only project files inside those folders will be taken into account when
applying rules. All others will be ignored by the rules engine.

In addition to source files, all files in dependency packages will be
transformed too.

After that's defined, you need to configure which rules will be applied to
which files. To achieve that, you may use a limited subset of the syntax
`webpack` uses to define rule selectors inside the
[.npmbundlerrc rules section](../reference/dot-npmbundlerrc.md#rules).

Let's see an example in action.

```json
{
	"sources": ["src"],
	"rules": [
		{
			"test": "\\.js$",
			"exclude": "node_modules",
			"use": [
				{
					"loader": "babel-loader",
					"options": {
						"presets": ["env", "react"]
					}
				}
			]
		},
		{
			"test": "\\.scss$",
			"exclude": "node_modules",
			"use": ["sass-loader", "style-loader"]
		},
		{
			"test": "\\.css$",
			"include": "node_modules",
			"use": ["style-loader"]
		}
	]
}
```

As you can see, we have defined rules to be applied to the `src` folder of the
project. In addition to that, all files inside packages which are dependencies
of the project will get rules applied too.

Rules are specified as an array of objects which have a `use` array property
and one or more of the `test`, `include` and `exclude` properties.

The `test` property defines a regular expression that must be matched against
each file to elect it for rules appliance.

The project-relative path of each eligible file is compared against the regular
expression and those files matching are transformed by the defined loaders.

So, for example, a file `index.js` inside the `src` folder of your project will
have as path `src/index.js` whereas a `index.js` file inside the `is-array`
package will have `node_modules/is-array/index.js` as path.

You can refine your `test` expression with the `include` and `exclude`
properties which also contain regular expressions that are applied in that
order to filter the files that matched the `test`. So the algorithm is:

```javascript
let files = source_files + dependency_package_files

files = files.filter(file => test.matches(file))

if (include is present) {
  files = files.filter(file => include.matches(file))
}

if (exclude is present) {
  files = files.filter(file => !exclude.matches(file))
}
```

When the list of files to apply rules to is determined, the chain of loaders
specified in the `use` property is applied in order, passing the file contents
to the first loader, the output of the first loader to the second and so on,
until the final result is written to the output file, which path is determined
by the location of the input file.

So, for example, the `src/index.js` will be placed at `build/index.js` (note
that the `src` subfolder is stripped automatically) and the dependency package
files are output to the corresponding folder inside `build`.

Loaders configured in the `use` property may be specified by just a package
name or an object with `loader` and `options` property if they are
configurable.

Once rules have been applied, the bundler keeps on with the traditional steps
related to pre, post and babel phase of bundler plugins.

## Controlling what files are processed by plugins

You can control what gets processed and what doesn't at three levels:

1. You can force inclusion of npm packages in the output artifact even if they
   are not used anywhere in the code. This can be useful to bundle badly
   configured transitive dependencies, for example. See the
   [`include-dependencies`](../reference/dot-npmbundlerrc.md#include-dependencies)
   option for more information.
2. You can exclude any subset of files (or the whole package) in npm packages.
   This is useful to prevent imported packages from being bundled or optimize
   the resulting JAR by removing unused (or server only) files. See the
   [`exclude`](../reference/dot-npmbundlerrc.md#exclude) section for more
   information.
3. You can tell the tool to avoid processing (specifically with Babel) of any
   subset of files in the project (not of npm packages). This can be useful if
   you want to provide some JavaScript files in your project that don't need to
   be AMDized, for example. See the
   [`ignore`](../reference/dot-npmbundlerrc.md#ignore) section for more
   information.

## Creating OSGi bundles

As of [#164](https://github.com/liferay/liferay-js-toolkit/issues/164),
`liferay-npm-bundler` can create full fledged OSGi bundles for you. OSGi bundle
creation is activated when the
[`create-jar`](../reference/dot-npmbundlerrc.md#create-jar) option is given.

## Configuring the bundler

As said before, `liferay-npm-bundler` is configured placing a `.npmbundlerrc`
file in your project's folder. The available options for that file are
described in the
[.npmbundlerrc file reference](../reference/dot-npmbundlerrc.md).
