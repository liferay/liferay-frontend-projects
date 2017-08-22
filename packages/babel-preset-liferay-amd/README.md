# babel-preset-liferay-amd

> Babel preset for npm modules written in AMD format.

## Details

This preset includes the following plugins:

1. [babel-plugin-normalize-requires](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-normalize-requires)
2. [babel-plugin-name-amd-modules](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-name-amd-modules)
3. [babel-plugin-namespace-amd-define](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-namespace-amd-define)

## Install

```
npm install --save-dev babel-preset-liferay-amd
```

## Usage

Add the following to your `.babelrc` file:

```
{
  "presets": ["liferay-amd"]
}
```