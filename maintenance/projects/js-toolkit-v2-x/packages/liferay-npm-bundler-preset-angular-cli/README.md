# liferay-npm-bundler-preset-angular-cli

> Liferay NPM Bundler preset for [Angular CLI](https://cli.angular.io/) adapted projects.

## Install

```sh
npm install --save-dev liferay-npm-bundler-preset-angular-cli
```

## Usage

Add the following to your `.npmbundlerrc` file:

```json
{
	"preset": "liferay-npm-bundler-preset-angular-cli"
}
```

## Technical Details

This preset takes care of projects created with the [Angular CLI](https://cli.angular.io/) tool so that they can be correctly bundled and deployed to Liferay DXP or Liferay Portal CE.

> 👀 Note that portlets processed by this preset MUST NOT be instanceable because of the way Angular bootstraps its applications. Also note that you MUST NOT place more than one Angular CLI adapted portlet into the same page for the very same reason.
