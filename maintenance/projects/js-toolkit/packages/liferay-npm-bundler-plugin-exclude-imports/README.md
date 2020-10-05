# liferay-npm-bundler-plugin-exclude-imports

> Exclude declared imports dependencies.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-plugin-exclude-imports
```

## Usage

Add the following to your `.npmbundlerrc` file:

**Without options:**

```json
{
	"*": {
		"plugins": ["exclude-imports"]
	}
}
```

## Technical Details

This plugin excludes dependencies declared as imports inside the `.npmbundlerrc`
from the final bundle.
