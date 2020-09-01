# babel-preset-liferay-standard

> Babel preset for regular (browser compatible) npm modules.

## Install

```sh
npm install --save-dev babel-preset-liferay-standard
```

## Usage

Add the following to your `.babelrc` file:

```json
{
	"presets": ["liferay-standard"]
}
```

## Technical Details

This preset includes the following plugins:

1. [babel-plugin-normalize-requires](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-plugin-normalize-requires)
2. [babel-plugin-transform-node-env-inline](https://www.npmjs.com/package/babel-plugin-transform-node-env-inline)
3. [babel-plugin-minify-dead-code-elimination](https://www.npmjs.com/package/babel-plugin-minify-dead-code-elimination)
4. [babel-plugin-wrap-modules-amd](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-plugin-wrap-modules-amd)
5. [babel-plugin-name-amd-modules](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-plugin-name-amd-modules)
6. [babel-plugin-namespace-modules](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-plugin-namespace-modules)
7. [babel-plugin-namespace-amd-define](https://github.com/izaera/liferay-js-toolkit/tree/master/packages/babel-plugin-namespace-amd-define)
