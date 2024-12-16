# liferay-npm-bundler-loader-sass-loader

> A liferay-npm-bundler loader that runs `sass` or `node-sass` on source files. This loader changes the file extension from anything used in source (for example `.scss` or `.sass`) to `.css` in the output folder, so that it can be served correctly to browsers.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-loader-sass-loader
```

## Usage

In order to use this loader you must declare a rule in your module's `.npmbundlerrc` file:

```json
{
	"rules": [
		{
			"test": "\\.scss$",
			"exclude": "node_modules",
			"use": ["sass-loader"]
		}
	]
}
```

This loader tries to find `node-sass` in your project by default. If it is not there, it then looks for `sass` (in your project, too) and, if that fails again, it will use a bundled copy of `sass` that is provided with the loader.

See the project's documentation for more information on [how to use build rules](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/docs/How-to-use-build-rules.md).
