# liferay-npm-bundler-plugin-resolve-linked-dependencies

> Replace linked dependencies versions by their real values.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-plugin-resolve-linked-dependencies
```

## Usage

Add the following to your `.npmbundlerrc` file:

**Without options:**

```json
{
	"*": {
		"plugins": ["resolve-linked-dependencies"]
	}
}
```

## Technical Details

This plugin replaces links to `file://` dependencies by their real version
number, taken from the resolved package looking up in `node_modules`.
