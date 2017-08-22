# liferay-npm-bundler-preset-amd

> Liferay NPM Bundler preset for projects based on AMD npm modules. 

## Install

```sh
npm install --save-dev liferay-npm-bundler-preset-amd
```

## Usage

Add the following to your `.npmbundlerrc` file:

```json
{
    "preset": "liferay-npm-bundler-preset-amd"
}
```

## Technical Details

This preset includes the following Babel presets:

1. [babel-preset-liferay-amd](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-preset-liferay-amd)
