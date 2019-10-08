# babel-plugin-name-amd-modules

> Give a name to AMD modules based on package name and version and module path.

## Example

**In**

```javascript
define([], function() {});
```

**Out**

```javascript
define('package@1.0.0/index', [], function() {});
```

## Installation

```sh
npm install --save-dev babel-plugin-name-amd-modules
```

## Usage

Add the following to your `.babelrc` file:

**Without options:**

```json
{
	"plugins": ["name-amd-modules"]
}
```

**With options:**

```json
{
	"plugins": [
		[
			"name-amd-modules",
			{
				"packageName": "my-npm-package",
				"srcPrefixes": [
					"packages/my-npm-package",
					"packages/my-other-npm-package"
				]
			}
		]
	]
}
```

## Technical Details and Options

This plugin scans modules for AMD `define()` calls and rewrites the module name
argument with one based on the name of the package that contains the module and
the module's relative path inside that package (removing the .js extension from
the file name too).

By default (if no custom value is given for the `packageName` option) this
plugin looks for the `package.json` of the module assuming it is located in a
JS Toolkit project. Otherwise, the package name can be forced to any fixed value
by providing a value other than `<package.json>` to the `packageName` option.

To determine the relative path of the modules the `srcPrefixes` option is
examined and any folder found on it is removed from the path of the modules
being processed, giving the relative package name.

For example, given a `srcPrefixes` of `["src"]` if the module under
`src/index.js` is processed, its relative path is transformed to `index.js`.

However, note that the plugin automatically removes `sources` configured inside
`.npmbundlerrc` when it transforms a file inside any of those folders.
