# liferay-npm-bundler-preset-angular

> Liferay NPM Bundler preset for Angular projects. 

## Install

```sh
npm install --save-dev liferay-npm-bundler-preset-angular
```

## Usage

Add the following to your `.npmbundlerrc` file:

```json
{
    "preset": "liferay-npm-bundler-preset-angular"
}
```

## Technical Details

This preset includes the following Babel presets:

1. [babel-preset-liferay-standard](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-preset-liferay-standard)

And the following Liferay NPM Bundler plugins:

1. [liferay-npm-bundler-plugin-replace-browser-modules](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/liferay-npm-bundler-plugin-replace-browser-modules)
2. [liferay-npm-bundler-plugin-inject-angular-dependencies](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/liferay-npm-bundler-plugin-inject-angular-dependencies)


