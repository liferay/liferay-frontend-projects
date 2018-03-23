# liferay-npm-bundler-plugin-inject-peer-dependencies

> Inject peer dependencies and undeclared dependencies that are installed under 
> node_modules" in package.json files.

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

This plugin injects dependencies in `package.json` files when they are found
inside AMD `define()` calls in any of their module files. This is needed for 
peer dependencies to work correctly under Liferay Portal npm architecture and it 
may also make some incorrect setups work they way they do on Node.js.

To determine the version of the dependencies to inject, the plugin resolves the
peer/undeclared packages from the context of the module where they are
referenced using the standard node resolve algorithm.
