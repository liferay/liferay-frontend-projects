# liferay-npm-bundler-loader-css-loader

> A liferay-npm-bundler loader that turns CSS files into JavaScript modules that inject a <link> into the HTML when they are required.

This loader assumes that the project will be deployed to a Liferay Portal and composes the .css file URL accordingly.

The web context path for the generated OSGi bundle is inferred by reading it from [the .npmbundlerrc file](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/docs/.npmbundlerrc-file-reference.md#create-jarfeaturesweb-context).

If the project is not configured to generate an OSGi bundle, the web context path is read from the `bnd.bnd` file in the project's folder. In particular, the `Web-ContextPath` property is used.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-loader-css-loader
```

## Usage

In order to use this loader you must declare a rule in your module's `.npmbundlerrc` file:

```json
{
	"rules": [
		{
			"test": "\\.css$",
			"use": ["css-loader"]
		}
	]
}
```

See the project's documentation for more information on [how to use build rules](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/docs/How-to-use-build-rules.md).
