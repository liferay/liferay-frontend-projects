# liferay-npm-bundler-loader-babel-loader

> A liferay-npm-bundler loader that runs Babel on source files.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-loader-babel-loader
```

## Usage

In order to use this loader you must declare a rule in your module's `.npmbundlerrc` file:

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
		}
	]
}
```

See the project's documentation for more information on [how to use build rules](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/docs/How-to-use-build-rules.md).
