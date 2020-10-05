# liferay-npm-bundler-preset-standard

> Liferay NPM Bundler preset for regular npm modules.

## Install

```sh
npm install --save-dev liferay-npm-bundler-preset-standard
```

## Usage

Add the following to your `.npmbundlerrc` file:

```json
{
	"preset": "liferay-npm-bundler-preset-standard"
}
```

## Technical Details

This preset includes the following Babel presets:

1. [babel-preset-liferay-standard](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-preset-liferay-standard)

And the following Liferay NPM Bundler plugins:

1. [liferay-npm-bundler-plugin-replace-browser-modules](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/liferay-npm-bundler-plugin-replace-browser-modules)
