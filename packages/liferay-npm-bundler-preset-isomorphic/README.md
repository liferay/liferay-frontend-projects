# liferay-npm-bundler-preset-isomorphic

> Liferay NPM Bundler preset for npm modules containing isomorphic code.

## Install

```sh
npm install --save-dev liferay-npm-bundler-preset-isomorphic
```

## Usage

Add the following to your `.npmbundlerrc` file:

```json
{
    "preset": "liferay-npm-bundler-preset-isomorphic"
}
```

## Technical Details

This preset includes the following Babel presets:

1. [babel-preset-liferay-isomorphic](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-preset-liferay-isomorphic)

And the following Liferay NPM Bundler plugins:

1. [liferay-npm-bundler-plugin-replace-browser-modules](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/liferay-npm-bundler-plugin-replace-browser-modules)
