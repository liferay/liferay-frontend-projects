# liferay-npm-bridge-generator

> 👀 This tool is deprecated and its use is discouraged.

The `liferay-npm-bridge-generator` is a tool to generate bridge modules (npm
modules that re-export another module in the same package) inside a project.

This can be used for several purposes like, for example, maintaining
compatibility with older APIs when modules are moved to a different place.

## Installation

```sh
npm install --save-dev liferay-npm-bridge-generator
```

## Usage

Usually `liferay-npm-bridge-generator` is called in your `package.json` build
script after all processing has taken place. It assumes that you are using the
standard conventions to deploy to Liferay Portal (AMD modules named upon file
location, npm packages bundled by `liferay-npm-bundler`, and so on).

To do so, you must have something similar to this in your `package.json` file:

```json
"scripts": {
    "build": "... && liferay-npm-bridge-generator"
}
```

Where the `...` refers to any previous step you need to perform like, for
example, calling `liferay-npm-bundler`.

The output of `liferay-npm-bridge-generator` are several AMD modules suitable
for deploy to Liferay Portal inside an OSGi bundle.

The modules which are created don't need to be processed by
`liferay-npm-bundler`, they just need to be packed inside the OSGi bundle.

This tool is configured with an `.npmbridgerc` file in the root of your
project. The file has the following structure:

```
{
	"<scope 1>": {
		"input": "<relative path of input folder>",
		"output": "<relative path of output folder>",
		"file-globs": "<comma separated file globs>",
		"dest-file-mapper": {
			"from": "<regular expression>",
			"to": "<replacement>"
		},
		"src-mod-name-mapper": {
			"from": "<regular expression>",
			"to": "<replacement>"
		},
		"dest-mod-name-mapper": {
			"from": "<regular expression>",
			"to": "<replacement>"
		}
	},
	…
	"<scope n>": {
		…
	}
}
```

- **input**: the input directory to be scanned in search of source modules.

- **output**: the output directory where bridge modules are placed.

- **file-globs**: a comma separated list of file globs to be used as source
  modules.

- **dest-file-mapper**: an object with a regexp and a replacement value to be
  applied to source file paths to map them to destination file paths.

- **src-mod-name-mapper**: an object with a regexp and a replacement value to be
  applied to source file paths to map them to source module names.

- **dest-mod-name-mapper**: an object with a regexp and a replacement value to
  be applied to destination file paths to convert them to destination module names.

## Command line arguments

In addition to the configuration file, you can pass the following arguments to
the tool (from the command line):

- **--verbose**: when given, shows details about the execution of the tool.
