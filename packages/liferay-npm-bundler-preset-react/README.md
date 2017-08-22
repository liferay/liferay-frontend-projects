# liferay-npm-bundler-preset-react

> Liferay NPM Bundler preset for React projects. 

## Install

```sh
npm install --save-dev liferay-npm-bundler-preset-react
```

## Usage

Add the following to your `.npmbundlerrc` file:

```json
{
    "preset": "liferay-npm-bundler-preset-react"
}
```

## Technical Details

This preset includes the following Babel presets:

1. [babel-preset-liferay-standard](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-preset-liferay-standard)

And the following Liferay NPM Bundler plugins:

1. [liferay-npm-bundler-plugin-replace-browser-modules](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/liferay-npm-bundler-plugin-replace-browser-modules)


