# liferay-npm-bundler

A tool to process a Liferay portlet project to produce an OSGi bundle containing 
the needed npm dependencies so that it can be run when deployed to the Portal.

This tool is of a kind known as bundler, like 
[browserify](http://browserify.org/) or [webpack](https://webpack.js.org/). 

So, why writing another bundler? The main reason is that due to the modularity
of Liferay Portal, several portlets that don't know each other in advance may 
need to cooperate to share their Javascript dependencies, so we cannot just 
deploy all Javascript in a single file like other bundlers do for web 
applications. 

On the contrary, we need to bundle enough information so that the Portal can 
-when assembling a page- determine which packages must be used and how they are 
going to be shared among different portlets.

And that's where `liferay-npm-bundler` comes in handy.

## Installation

```sh
npm install --save-dev liferay-npm-bundler
```

## Usage

Usually `liferay-npm-bundler` is called in your `package.json` build script 
after all transpilation and processing has taken place.

To do so, you must have something similar to this in your `package.json` file:

```json
"scripts": {
    "build": "... && liferay-npm-bundler"
}
```

Where the `...` refers to any previous step you need to perform like, for 
example, transpiling your sources with Babel.

The output of `liferay-npm-bundler` is a directory that is suitable for 
deploying npm packages to Liferay Portal as explained in 
[this project's root README file](https://github.com/liferay/liferay-npm-build-tools/blob/master/README.md).

This tool is configured by means of a `.npmbundlerrc` file that must live inside
the project's root folder. Continue reading to know how to write such file.

## How it works internally

This tool assumes a Liferay portlet project as input and outputs its files to 
a `build` directory so that the standard Gradle build for portlets can carry on
and produce an OSGi bundle that can be deployed to Liferay Portal.

To do so, it runs the project source files through the following workflow:

1. Copy project's `package.json` file to the output directory.
2. Traverse project's dependency tree to determine which packages are needed to 
run it.
3. For each dependency package:
    1. Copy package to output dir (in plain _package_@_version_ format, as 
        opposed to the standard `node_modules` tree format).
    2. Pre-process package with configured plugins.
    3. Run Babel through each `.js` file in the package with configured plugins.
    4. Post-process package with configured plugins.
    
The pre and post process steps are the same, they only differ in the moment when
they are run (before or after Babel is run, respectively). In these steps,
`liferay-npm-bundler` calls all the configured plugins so that they can perform
transformations on the npm packages like, for instance, modifying its 
`package.json` file, or deleting or moving files.

Let's see an example with the following `.npmbundlerrc` file:

```json
{
    "preset": "liferay-npm-bundler-preset-standard"
}
```

If we run `liferay-npm-bundler` with this file, it will apply the 
[config file](https://github.com/liferay/liferay-npm-build-tools/blob/master/packages/liferay-npm-bundler-preset-standard/config.json)
found in `liferay-npm-bundler-preset-standard`:

```json
{
	"*": {
		"plugins": [
			"replace-browser-modules"
		],
		".babelrc": {
			"presets": ["liferay-standard"]
		}
	}
}
```

This states that for all npm packages (`*`) the pre-process phase (`plugins`) 
must run the `replace-browser-modules` plugin (if we wanted to run that plugin
during the post phase, it should say `post-plugins` instead of `plugins`).

Looking at the 
[documentation](https://github.com/liferay/liferay-npm-build-tools/blob/master/packages/liferay-npm-bundler-plugin-replace-browser-modules/README.md)
of replace-browser-modules plugin we can see that this plugin replaces 
Javascript modules as defined under the `browser` section of `package.json` 
files. This means that, for each npm package that our project has as dependency,
`liferay-npm-bundler` will make sure that each one having a `browser` section in
its `package.json` files will have its server side files replaced by their 
counterpart browser versions.

The next part of the `.npmbundlerrc` file specifies the `.babelrc` file to use 
when running Babel through the packages `.js` files. Please keep in mind that, 
in this phase, Babel is used to transform package files (for example to convert
them to AMD format if necessary) not to transpile them (though, in theory, you
could transpile them too if you wanted by configuring the proper plugins).

In this example, we use the `liferay-standard` preset, that applies the 
following plugins according to 
[its documentation](https://github.com/liferay/liferay-npm-build-tools/tree/master/packages/babel-preset-liferay-amd):

1. [babel-plugin-normalize-requires](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-normalize-requires)
2. [babel-plugin-transform-node-env-inline](https://www.npmjs.com/package/babel-plugin-transform-node-env-inline)
3. [babel-plugin-wrap-modules-amd](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-wrap-modules-amd)
4. [babel-plugin-name-amd-modules](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-name-amd-modules)
5. [babel-plugin-namespace-amd-define](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-namespace-amd-define)

Checking the documentation of these plugins we find out that Babel will:

1. Remove trailing `.js` strings from `require()` calls in our packages.
2. Replace occurrences of `process.env.NODE_ENV` by its literal value.
3. Wrap modules with an AMD `define()` call.
4. Give a canonical name to each AMD module based on its package and relative 
path inside it.
5. Prefix `define()` calls with `Liferay.Loader.`.

Thus, after running `liferay-npm-bundler` on our project we will have a folder
with all our npm dependencies extracted from the project's `node_modules` folder
and modified to make them work on Liferay Portal under management of its 
[Liferay AMD Loader](https://github.com/liferay/liferay-amd-loader).
    
## Configuration

As said before, `liferay-npm-bundler` is configured placing a `.npmbundlerrc` 
file in your project's folder. The full structure of that file is:

```json
{
    "exclude": {
        "*" : [
            (list of glob expressions excluding files)
        ],
        "(package name)" : [
            (same as for "*")
        ],
        "(package name)@(version)" : [
            (same as for "*")
        ]
    },
    "output": (relative path of output directory),
    "process-serially": (true|false),
    "*" : {
        "plugins": [
            (list of plugins)
		],
		".babelrc": {
            (standard .babelrc file)
		},
        "post-plugins": [
            (list of plugins)
		]
    },
    "(package name)" : {
        (same as for "*")
    },
    "(package name)@(version)" : {
        (same as for "*")
    }
    ...
}
```

Where:

* **"exclude"**: defines files to be excluded from bundling from all or specific
packages.
* **"output"**: by default the bundled packages are written to 
`build/resources/main/META-INF/resources`, which is the standard Gradle output
directory for resources, but it can be overriden for customized builds.
* **"process-serially"**: defines whether to process dependency packages in 
parallel, leveraging Node.js asynchronous model, or one by one. The default 
value is false, so that everything gets processed in parallel, but you can 
disable it in case you get EMFILE errors due to opening too many files at the
same time.
* **(list of plugins)**: is a comma separated list of strings defining the 
`liferay-npm-bundler` plugins to call (note that the 
`liferay-npm-bundler-plugin-` part from the npm package name may be omitted).
* **(standard .babelrc file)**: is a `.babelrc` file as defined in [Babel's 
documentation](https://babeljs.io/docs/usage/babelrc/) that gets passed to 
Babel when called by `liferay-npm-bundler`.
* **(package name)**: is a npm package name and the configuration under its 
scope will be only applied to packages with that name and *any* version.
* **(version)**: is a npm package version and the configuration under its 
`<package name>@<version>` scope will be only applied to packages with that 
specific name and version.
    
    
    
    