# liferay-npm-bundler-loader-style-loader

> A liferay-npm-bundler loader that turns CSS files into JavaScript modules that inject the CSS into the HTML when they are required.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-loader-style-loader
```

## Usage

In order to use this loader you must declare a rule in your module's `.npmbundlerrc` file:

```json
{
	"rules": [
		{
			"test": "\\.css$",
			"use": ["style-loader"]
		}
	]
}
```

See the project's documentation for more information on [how to use build rules](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/docs/How-to-use-build-rules.md).
