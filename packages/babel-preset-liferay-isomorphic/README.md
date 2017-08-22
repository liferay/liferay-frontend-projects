# babel-preset-liferay-isomorphic

> Babel preset for npm modules written for Node.js server that can run in the browser.

## Install

```sh
npm install --save-dev babel-preset-liferay-isomorphic
```

## Usage

Add the following to your `.babelrc` file:

```json
{
  "presets": ["liferay-isomorphic"]
}
```

## Technical Details

This preset includes the following plugins:

1. [babel-plugin-normalize-requires](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-normalize-requires)
2. [babel-plugin-shim-nodejs](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-shim-nodejs)
3. [babel-plugin-wrap-modules-amd](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-wrap-modules-amd)
4. [babel-plugin-name-amd-modules](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-name-amd-modules)
5. [babel-plugin-namespace-amd-define](https://github.com/izaera/liferay-npm-build-tools/tree/master/packages/babel-plugin-namespace-amd-define)