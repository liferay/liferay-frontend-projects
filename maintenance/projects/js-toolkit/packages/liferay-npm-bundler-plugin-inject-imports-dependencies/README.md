# liferay-npm-bundler-plugin-inject-imports-dependencies

> Inject declared imports dependencies.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-plugin-inject-imports-dependencies
```

## Usage

Add the following to your `.npmbundlerrc` file:

**Without options:**

```json
{
	"*": {
		"plugins": ["inject-imports-dependencies"]
	}
}
```

## Technical Details

This plugin injects dependencies declared as imports inside the `.npmbundlerrc`
file in the `package.json` file.
