# babel-preset-liferay-project

> Babel preset for modules included in Liferay Portal OSGi bundles.

## Install

```
npm install --save-dev babel-preset-liferay-project
```

## Usage

Add the following to your `.babelrc` file:

```
{
  "presets": ["liferay-project"]
}
```

## Technical Details

This preset includes the following plugins:

1. [babel-plugin-transform-es2015-modules-amd](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-transform-es2015-modules-amd)
2. [babel-plugin-name-amd-modules](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-name-amd-modules)
3. [babel-plugin-namespace-amd-define](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-namespace-amd-define)