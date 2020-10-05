# liferay-npm-bundler-plugin-inject-peer-dependencies

> Inject peer and undeclared dependencies (as long as they are installed under

    "node_modules") in package.json files.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-plugin-inject-peer-dependencies
```

## Usage

Add the following to your `.npmbundlerrc` file:

**Without options:**

```json
{
	"*": {
		"plugins": ["inject-peer-dependencies"]
	}
}
```

**With options:**

```json
{
	"*": {
		"plugins": [
			[
				"inject-peer-dependencies",
				{
					"defineCall": "Liferay.Loader.define"
				}
			]
		]
	}
}
```

## Technical Details

This plugin injects missing dependencies in `package.json` files when they are
found inside AMD `define()` calls in any of their module files and the
dependency is installed under "node_modules". This is needed for peer
dependencies to work correctly under Liferay's npm architecture and it may also
make some incorrect setups work they way they do on Node.js.

To determine the version of the dependencies to inject, the plugin resolves the
peer/undeclared packages from the context of the module where they are
referenced using the standard node resolve algorithm.

Please note that, for the referenced packages to be included they must also be
listed in the project's `package.json` so that they are included in the final
OSGi bundle.
