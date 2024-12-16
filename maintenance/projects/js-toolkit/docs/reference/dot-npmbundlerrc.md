This page contains the whole reference for `liferay-npm-bundler` options. See
[liferay-npm-bundler manual](../manuals/liferay-npm-bundler.md) for a more
detailed explanation on how to use the tool.

The options in this page are sorted alphabetically.

## --create-jar

-   **Description**: same as [`create-jar`](#create-jar) true
-   **Category**: `command line argument`
-   **Type**: `flag`
-   **See also**:
    -   [`-j`](#-j)
    -   [`create-jar`](#create-jar)
-   **Example**:

```sh
$ liferay-npm-bundler --create-jar
```

## --dump-report

-   **Description**: same as [`dump-report`](#dump-report)
-   **Category**: `command line argument`
-   **Type**: `flag`
-   **See also**:
    -   [`-r`](#-r)
    -   [`dump-report`](#dump-report)
-   **Example**:

```sh
$ liferay-npm-bundler --dump-report
```

## --no-tracking

-   **Description**: same as [`no-tracking`](#no-tracking)
-   **Category**: `command line argument`
-   **Type**: `flag`
-   **See also**:
    -   [`.liferay-npm-bundler-no-tracking`](#liferay-npm-bundler-no-tracking)
    -   [`LIFERAY_NPM_BUNDLER_NO_TRACKING`](#LIFERAY_NPM_BUNDLER_NO_TRACKING)
    -   [`no-tracking`](#no-tracking)
-   **Example**:

```sh
$ liferay-npm-bundler --no-tracking
```

## -j

-   **Description**: same as [`create-jar`](#create-jar) true
-   **Category**: `command line argument`
-   **Type**: `flag`
-   **See also**:
    -   [`--create-jar`](#--create-jar)
    -   [`create-jar`](#create-jar)
-   **Example**:

```sh
$ liferay-npm-bundler -j
```

## -r

-   **Description**: same as [`dump-report`](#dump-report)
-   **Category**: `command line argument`
-   **Type**: `flag`
-   **See also**:
    -   [`--dump-report`](#--dump-report)
    -   [`dump-report`](#dump-report)
-   **Example**:

```sh
$ liferay-npm-bundler -r
```

## \* (asterisk)

-   **Description**: Defines default plugin configuration for all npm packages. It contains four values identified by a corresponding key. Keys `copy-plugins`, `plugins` and `post-plugins` identify arrays of `liferay-npm-bundler` plugins to apply in the copy, pre and post process steps. Key `.babelrc` identifies an object specifying the configuration to be used in the Babel step and has the same structure of a standard `.babelrc` file.
-   **Category**: `.npmbundlerrc`
-   **Type**: `object`
-   **Default**: `{}`
-   **Example**:

```json
{
	"*": {
		"copy-plugins": ["exclude-imports"],
		"plugins": ["replace-browser-modules"],
		".babelrc:": {
			"presets": ["liferay-standard"]
		},
		"post-plugins": [
			"namespace-packages",
			"inject-imports-dependencies",
			"inject-peer-dependencies"
		]
	}
}
```

## .liferay-npm-bundler-no-tracking

-   **Description**: same as [`no-tracking`](#no-tracking) true when file exists in project's folder or any of its ancestors
-   **Category**: `marker file`
-   **Type**: `flag`
-   **See also**:
    -   [`--no-tracking`](#--no-tracking)
    -   [`LIFERAY_NPM_BUNDLER_NO_TRACKING`](#LIFERAY_NPM_BUNDLER_NO_TRACKING)
    -   [`no-tracking`](#no-tracking)
-   **Example**:

```sh
$ touch .liferay-npm-bundler-no-tracking
$ liferay-npm-bundler
```

## / (forward slash)

-   **Description**: Defines plugin configuration for project files. It contains three values identified by a corresponding key. Keys `plugins` and `post-plugins` identify arrays of `liferay-npm-bundler` plugins to apply in the pre and post process steps. Key `.babelrc` identifies an object specifying the configuration to be used in the Babel step and has the same structure of a standard `.babelrc` file.
-   **Category**: `.npmbundlerrc`
-   **Type**: `object`
-   **Default**: `{}`
-   **Example**:

```json
{
	"/": {
		"plugins": ["resolve-linked-dependencies"],
		".babelrc:": {
			"presets": ["liferay-standard"]
		},
		"post-plugins": ["namespace-packages", "inject-imports-dependencies"]
	}
}
```

## config

-   **Description**: Defines global configuration that is made available to all `liferay-npm-bundler` and `babel` plugins. See the description of the plugins you use in your build to know what to put in this section.
-   **Category**: `.npmbundlerrc`
-   **Type**: `object`
-   **Default**: `{}`
-   **Example**:

```json
{
	"config": {
		"imports": {
			"vuejs-provider": {
				"vue": "^2.0.0"
			}
		}
	}
}
```

## create-jar

-   **Description**: Activates OSGi bundle creation whenever it is set to a truthy value. When set to `true` all sub-options take default values; when set to an object, each sub-option can be tweaked separately.
-   **Category**: `.npmbundlerrc`
-   **Type**: `object|boolean`
-   **Default**: `false`
-   **See also**:
    -   [`--create-jar`](#--create-jar)
    -   [`-j`](#-j)
-   **Example**:

```json
{
	"create-jar": true
}
```

## create-jar.auto-deploy-portlet

-   **Category**: `.npmbundlerrc`
    > ⚠ This option is deprecated. Use [`create-jar.features.js-extender`](#create-jarfeaturesjs-extender) instead.

## create-jar.compression-level

-   **Description**: Defines the compression level to use when creating the JAR file. It must be a number between `0` (no compression) and `9` (maximum compression).
-   **Category**: `.npmbundlerrc`
-   **Type**: `number`
-   **Default**: `6`
-   **Example**:

```json
{
	"create-jar": {
		"compression-level": 9
	}
}
```

## create-jar.customManifestHeaders

-   **Description**: Defines custom headers to be written to the MANIFEST.MF file contained in the output JAR. Note that this is the same as [create-jar.features.manifest](#create-jarfeaturesmanifest) but with lower precedence, i.e., values are combined but the the ones from the other section take precedence over the ones in this.
-   **Category**: `.npmbundlerrc`
-   **Type**: `object`
-   **Default**: `{}`
-   **See also**:
    -   See [create-jar.features.manifest](#create-jarfeaturesmanifest) for a neater way to define headers.
-   **Example**:

```json
{
	"create-jar": {
		"customManifestHeaders": {
			"Project-Name": "A Project",
			"Responsible": "john.doe@somewhere.net"
		}
	}
}
```

## create-jar.features

-   **Description**: This section controls features of the OSGi bundle.
-   **Category**: `.npmbundlerrc`
-   **Type**: `object`
-   **Default**: `{}`
-   **Example**:

```json
{
	"create-jar": {
		"features": {
			"js-extender": true
		}
	}
}
```

## create-jar.features.configuration

-   **Description**: Defines the file describing the system (OSGi) and portlet instance (portlet preferences, as defined in Porlet spec) configuration to use.
-   **Category**: `.npmbundlerrc`
-   **Type**: `string`
-   **Default**:
    -   `features/configuration.json` if a file with that name exists
    -   `undefined` otherwise
-   **See also**:
    -   See [configuration.json file reference](../reference/configuration-json.md) for more information on the file format
-   **Example**:

```json
{
	"create-jar": {
		"features": {
			"configuration": "features/configuration.json"
		}
	}
}
```

## create-jar.features.js-extender

-   **Description**: Controls whether to process the OSGi bundle with the [JS Portlet Extender](https://web.liferay.com/marketplace/-/mp/application/115542926). In addition, since [#237](https://github.com/liferay/liferay-js-toolkit/issues/237) it lets the developer specify the minimum required version of the Extender for the bundle to deploy. This can be useful if your bundle uses advances features but you still want it to be deployable in older versions of the Extender.
-   **Category**: `.npmbundlerrc`
-   **Type**: `boolean|string`
    -   When a string is provided it can be:
        -   A semantic version number specifying the minimum required version
        -   The string `any` to let the bundle deploy in any version of the Extender
    -   If `true` is provided, the bundler automatically determines the minimum vesion of the Extender needed, based on the features used by the bundle.
-   **Default**: `true` if the `package.json` has a `portlet` entry, `false` otherwise
-   **Example**:

```json
{
	"create-jar": {
		"features": {
			"js-extender": "1.1.0"
		}
	}
}
```

## create-jar.features.localization

-   **Description**: Defines the base name of the L10N files to use in the OSGi bundle.
-   **Category**: `.npmbundlerrc`
-   **Type**: `string`
-   **Default**:
    -   `features/localization/Language` if a properties file with that base name exists
    -   `undefined` otherwise
-   **Example**:

```json
{
	"create-jar": {
		"features": {
			"localization": "features/localization/Language"
		}
	}
}
```

## create-jar.features.manifest

-   **Description**: Defines the file containing custom headers to be written to the MANIFEST.MF file contained in the output JAR. Note that this is the same as [create-jar.customManifestHeaders](#create-jarcustommanifestheaders) but with higher precedence, i.e., values are combined but the the ones from this section take precedence over the ones in the other.
-   **Category**: `.npmbundlerrc`
-   **Type**: `string`
-   **Default**:
    -   `features/manifest.json` if a file with that name exists
    -   `undefined` otherwise
-   **See also**:
    -   See [create-jar.customManifestHeaders](#create-jarcustommanifestheaders) for an alternative way of setting headers.
-   **Example**:

```json
{
	"create-jar": {
		"features": {
			"manifest": "features/manifest.json"
		}
	}
}
```

## create-jar.features.settings

-   **Category**: `.npmbundlerrc`
    > ⚠ This option is deprecated. Use [`create-jar.features.configuration`](#create-jarfeaturesconfiguration) instead.

## create-jar.features.web-context

-   **Description**: Defines the context path to use for publishing bundle's static resources.
-   **Category**: `.npmbundlerrc`
-   **Type**: `string`
-   **Default**: `/{project name}-{project version}`
-   **Example**:

```json
{
	"create-jar": {
		"features": {
			"web-context": "/my-project"
		}
	}
}
```

## create-jar.output-dir

-   **Description**: Defines where to place the final JAR.
-   **Category**: `.npmbundlerrc`
-   **Type**: `string`
-   **Default**: the value set in the [output](#output) option
-   **Example**:

```json
{
	"create-jar": {
		"output-dir": "dist"
	}
}
```

## create-jar.output-filename

-   **Description**: Defines the name of the final JAR.
-   **Category**: `.npmbundlerrc`
-   **Type**: `string`
-   **Default**: `<package name>-<version number>.jar`
-   **Example**:

```json
{
	"create-jar": {
		"output-filename": "my-bundle.jar"
	}
}
```

## create-jar.web-context-path

-   **Category**: `.npmbundlerrc`
    > ⚠ This option is deprecated. Use [`create-jar.features.web-context`](#create-jarfeaturesweb-context) instead.

## dump-report

-   **Description**: Controls whether to dump a file named `liferay-npm-bundler-report.html` in the root project's folder that describes all actions and decissions taken when processing project and npm modules.
-   **Category**: `.npmbundlerrc`
-   **Type**: `boolean`
-   **Default**: `false`
-   **See also**:
    -   [`-r`](#-r)
    -   [`--dump-report`](#--dump-report)
-   **Example**:

```json
{
	"dump-report": true
}
```

## exclude

-   **Description**: Defines lists of glob expressions to match npm package files to exclude from output JAR. Each list is an array identified by a key that can be: `*` if the list applies to any package, `{package name}` if the list applies to any version of a specific package, or `{package name}@{version}` if the list applies to a specific version of a specific package.
-   **Category**: `.npmbundlerrc`
-   **Type**: `object`
-   **Default**: `{}`
-   **Example**:

```json
{
	"exclude": {
		"*": ["__tests__/**/*"],
		"is-object": ["test/**/*"],
		"is-array@1.0.1": ["test/**/*", "Makefile"]
	}
}
```

## ignore

-   **Description**: Define glob expressions to match project's JavaScript files that must not be processed by Babel.
-   **Category**: `.npmbundlerrc`
-   **Type**: `array`
-   **Default**: `[]`
-   **Example**:

```json
{
	"ignore": ["lib/legacy/**/*.js"]
}
```

## include-dependencies

-   **Description**: Defines a list of package names to add to the output artifact even if they are not used by the project. Obviously, the packages must be present in the `node_modules` directory.
-   **Category**: `.npmbundlerrc`
-   **Type**: `array`
-   **Default**: `[]`
-   **Example**:

```json
{
	"include-dependencies": ["rxjs", "is-object"]
}
```

## LIFERAY_NPM_BUNDLER_NO_TRACKING

-   **Description**: same as [`no-tracking`](#no-tracking) true when set
-   **Category**: `environment variable`
-   **Type**: `flag`
-   **See also**:
    -   [`--no-tracking`](#--no-tracking)
    -   [`.liferay-npm-bundler-no-tracking`](#liferay-npm-bundler-no-tracking)
    -   [`no-tracking`](#no-tracking)
-   **Example**:

```sh
$ export LIFERAY_NPM_BUNDLER_NO_TRACKING=''
$ liferay-npm-bundler
```

## max-parallel-files

-   **Description**: Defines the maximum number of files to process in parallel to avoid `EMFILE` errors. See issue [#298](https://github.com/liferay/liferay-js-toolkit/issues/298) for more information.
-   **Category**: `.npmbundlerrc`
-   **Type**: `number`
-   **Default**: `128`
-   **Example**:

```json
{
	"max-parallel-files": 32
}
```

## no-tracking

-   **Description**: Controls whether to send usage statistics to our servers to enhance the tool in the future.
-   **Category**: `.npmbundlerrc`
-   **Type**: `boolean`
-   **Default**: `false`
-   **See also**:
    -   [`--no-tracking`](#--no-tracking)
    -   [`.liferay-npm-bundler-no-tracking`](#liferay-npm-bundler-no-tracking)
    -   [`LIFERAY_NPM_BUNDLER_NO_TRACKING`](#LIFERAY_NPM_BUNDLER_NO_TRACKING)
-   **Example**:

```json
{
	"no-tracking": true
}
```

## osgi.Web-ContextPath

-   **Category**: `package.json`
    > ⚠ This option is deprecated. Use [`create-jar.features.web-context`](#create-jarfeaturesweb-context) instead.

## output

-   **Description**: Specifies the output directory of project's build. This directory is scanned by `liferay-npm-bundler` for the project's JavaScript modules so, please note, that someone has to put them there (whether an npm script, gradle, maven, ...). Also, the dependency npm packages are placed in a `node_modules` folder inside this directory.
-   **Category**: `.npmbundlerrc`
-   **Type**: `string`
-   **Default**:
    -   `build` if [`create-jar`](#create-jar) is set
    -   `build/resources/main/META-INF/resources` if [`create-jar`](#create-jar) is unset
-   **Example**:

```json
{
	"output": "build"
}
```

## packages

-   **Description**: Defines specific per-package plugin configuration. Keys in the object can have two formats: `{package name}` or `{package name}@{package version}` depending on what they want to affect. Values of those keys have the same format as the [`*`](#-asterisk) option.
-   **Category**: `.npmbundlerrc`
-   **Type**: `object`
-   **Default**: `{}`

```
👀 Note that, prior to version 1.4.0, the `packages` section did not exist and
   package configurations where placed outside of any section, next to other
   global options. This created the possibility of a collision and thus, the
   package configurations were namespaced. However, the tool still falls back
   to the root section (outside 'packages') to maintain backwards compatibility.
```

-   **Example**:

```json
{
	"packages": {
		"is-object": {
			"copy-plugins": ["exclude-imports"],
			"plugins": ["replace-browser-modules"],
			".babelrc:": {
				"presets": ["liferay-standard"]
			},
			"post-plugins": [
				"namespace-packages",
				"inject-imports-dependencies",
				"inject-peer-dependencies"
			]
		}
	}
}
```

## preset

-   **Description**: Defines the name of the preset to use as base configuration. All settings in that preset are inherited but can be overriden.
-   **Category**: `.npmbundlerrc`
-   **Type**: `string`
-   **Default**: `liferay-npm-bundler-preset-standard`
-   **Example**:

```json
{
	"preset": "my-liferay-npm-bundler-base-preset"
}
```

## ~process-serially~

> ⚠ This option is not valid since `2.7.0`. See [#298](https://github.com/liferay/liferay-js-toolkit/issues/298) for more information.

## rules

-   **Description**: Defines rules to apply to source files in order to generate output. See [How to configure rules and loaders](../manuals/liferay-npm-bundler.md#How-to-configure-rules-and-loaders) for more on this field.
-   **Category**: `.npmbundlerrc`
-   **Type**: `array`
-   **Default**: `[]`
-   **Example**:

```json
{
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
			"test": "\\.css$",
			"use": ["style-loader"]
		},
		{
			"test": "\\.json$",
			"use": ["json-loader"]
		}
	]
}
```

## sources

-   **Description**: Defines directories in the project that contain source files. The directories can be nested (f.e: 'src/main/resources') and must be written using POSIX path separators (i.e: use `/` in place of `\` in win32 systems). The files in those directories are subject to rule appliance (see [Loader rules](../manuals/liferay-npm-bundler.md#Loader-rules)).
-   **Category**: `.npmbundlerrc`
-   **Type**: `array`
-   **Default**: `[]`
-   **Example**:

```json
{
	"sources": ["src", "assets"]
}
```

## verbose

-   **Description**: Controls whether to log messages about what the tool is doing to the console.
-   **Category**: `.npmbundlerrc`
-   **Type**: `boolean`
-   **Default**: `false`
-   **Example**:

```json
{
	"verbose": true
}
```
