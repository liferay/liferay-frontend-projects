# eslint-config-liferay

> An ESLint [shareable config](http://eslint.org/docs/developer-guide/shareable-configs.html) that helps enforce the [Liferay Frontend Guidelines](https://github.com/liferay/liferay-frontend-guidelines).

## Overview

| Preset    | Extends                                                                                                              | Description                                                                                                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `liferay` | [eslint:recommended](https://eslint.org/docs/rules/), [prettier](https://github.com/prettier/eslint-config-prettier) | Base configuration, suitable for general projects                                                                                                                                                     |
| `react`   | `liferay`                                                                                                            | `liferay`, plus rules from [eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react) and [react-hooks](https://reactjs.org/docs/hooks-rules.html), suitable for projects that use React |
| `metal`   | `react`                                                                                                              | Like `react`, but turns off rules that cause false positives in [Metal components](http://metaljs.com/)                                                                                               |
| `portal`  | `react`                                                                                                              | Default for projects inside [liferay-portal](https://github.com/liferay/liferay-portal) itself                                                                                                        |

## Installation

```
$ npm install --save-dev eslint eslint-config-liferay
```

## Usage

Once the `eslint-config-liferay` package is installed, you can use it by specifying `liferay` in the [`extends`](http://eslint.org/docs/user-guide/configuring#extending-configuration-files) section of your [ESLint configuration](http://eslint.org/docs/user-guide/configuring).

```js
module.exports = {
	extends: ['liferay'],
};
```

This preset provides a reasonable starting point for an independent open source project.

### liferay-portal

In [liferay-portal](https://github.com/liferay/liferay-portal) itself we extend the `liferay/portal` preset instead, which activates some rules specific to liferay-portal. This preset assumes the use of React, and also provides a set of custom rules that are described in detail in the `eslint-plugin-liferay-portal` section below.

This extension is applied automatically by [liferay-npm-scripts](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts), so you don't have to configure it explicitly.

> **An important disclaimer about the use of ESLint in liferay-portal**
>
> JavaScript code that appears inline inside JSP files and other templates is only lightly checked by ESLint, because JSP is an impoverished environment where we have to work with context-free snippets of text as opposed to fully-formed, valid JS modules. Our long-term strategy is to move as much code as possible out of JSP and into React components, but in the interim, please be aware that the level of safety provided by the linter inside JSP is greatly reduced.

### React

For React projects outside of liferay-portal, you can extend `liferay/react` instead:

```js
module.exports = {
	extends: ['liferay/react'],
};
```

### metal-jsx

For legacy projects inside liferay-portal that use [metal-jsx](https://www.npmjs.com/package/metal-jsx), we have a "metal" preset:

```js
module.exports = {
	extends: ['liferay/metal'],
};
```

Use this preset to stop ESLint from [spuriously warning that variables that are used as JSX components are unused](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-uses-vars.md).

### Copyright headers

The included [`eslint-plugin-notice`](https://www.npmjs.com/package/eslint-plugin-notice) plug-in can be used to enforce the use of uniform copyright headers across a project by placing a template named `copyright.js` in the project root (for example, see [the file defining the headers used in eslint-config-liferay itself](https://github.com/liferay/eslint-config-liferay/blob/master/copyright.js)) and configuring the rule:

```javascript
const path = require('path');

module.exports = {
	extends: ['liferay'],
	rules: {
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
```

Explicit configuration is required in order to make overrides possible; for example:

-   `top-level/`
    -   `.eslintrc.js`
    -   `copyright.js`
    -   `mid-level/`
        -   `.eslintrc.js`
        -   `copyright.js`
        -   `bottom-level/`
            -   `.eslintrc.js`

If we were to provide configuration by default, then if `bottom-level/.eslintrc.js` does an `extends: ['liferay']`, then the default configuration would be considered more local than the one provided by `mid-level`, causing the wrong `copyright.js` to be used.

### Base rules

| Rule or preset                                                                                                                          | Where we use it              | Notes                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)                                                            | liferay                      | Preset that turns off ESLint rules that conflict with [Prettier](https://prettier.io/)                                             |
| [eslint:recommended](https://eslint.org/docs/rules/)                                                                                    | liferay                      | Preset bundled with [ESLint](https://eslint.org/docs/rules/)                                                                       |
| [default-case](https://eslint.org/docs/rules/default-case)                                                                              | liferay                      | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [liferay-portal/no-explicit-extend](./plugins/eslint-plugin-liferay-portal/docs/rules/no-explicit-extend.md)                            | liferay/portal               | [\#54](https://github.com/liferay/eslint-config-liferay/pull/54)                                                                   |
| [liferay-portal/no-global-fetch](./plugins/eslint-plugin-liferay-portal/docs/rules/no-global-fetch.md)                                  | liferay/portal               | [\#62](https://github.com/liferay/eslint-config-liferay/pull/62)                                                                   |
| [liferay-portal/no-loader-import-specifier](./plugins/eslint-plugin-liferay-portal/docs/rules/no-loader-import-specifier.md)            | liferay/portal               | [\#122](https://github.com/liferay/eslint-config-liferay/issues/122)                                                               |
| [liferay-portal/no-metal-plugins](./plugins/eslint-plugin-liferay-portal/docs/rules/no-metal-plugins.md)                                | liferay/portal               | [\#61](https://github.com/liferay/eslint-config-liferay/pull/61)                                                                   |
| [liferay-portal/no-react-dom-render](./plugins/eslint-plugin-liferay-portal/docs/rules/no-react-dom-render.md)                          | liferay/portal               | [\#71](https://github.com/liferay/eslint-config-liferay/pull/71)                                                                   |
| [liferay-portal/no-side-navigation](./plugins/eslint-plugin-liferay-portal/docs/rules/no-side-navigation.md)                            | liferay/portal               | [\#44](https://github.com/liferay/eslint-config-liferay/pull/44)                                                                   |
| [liferay/destructure-requires](./plugins/eslint-plugin-liferay/docs/rules/destructure-requires.md)                                      | liferay                      | [\#94](https://github.com/liferay/eslint-config-liferay/issues/94)                                                                 |
| [liferay/group-imports](./plugins/eslint-plugin-liferay/docs/rules/group-imports.md)                                                    | liferay                      | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [liferay/import-extensions](./plugins/eslint-plugin-liferay/docs/rules/import-extensions.md)                                            | liferay                      | [\#137](https://github.com/liferay/eslint-config-liferay/issues/137)                                                               |
| [liferay/imports-first](./plugins/eslint-plugin-liferay/docs/rules/imports-first.md)                                                    | liferay                      | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [liferay/no-absolute-import](./plugins/eslint-plugin-liferay/docs/rules/no-absolute-import.md)                                          | liferay                      | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [liferay/no-duplicate-class-names](./plugins/eslint-plugin-liferay/docs/rules/no-duplicate-class-names.md)                              | liferay                      | [\#108](https://github.com/liferay/eslint-config-liferay/issues/108)                                                               |
| [liferay/no-duplicate-imports](./plugins/eslint-plugin-liferay/docs/rules/no-duplicate-imports.md)                                      | liferay                      | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [liferay/no-dynamic-require](./plugins/eslint-plugin-liferay/docs/rules/no-dynamic-require.md)                                          | liferay                      | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [liferay/no-it-should](./plugins/eslint-plugin-liferay/docs/rules/no-it-should.md)                                                      | liferay                      | [\#43](https://github.com/liferay/eslint-config-liferay/pull/43)                                                                   |
| [liferay/no-require-and-call](./plugins/eslint-plugin-liferay/docs/rules/no-require-and-call.md)                                        | liferay                      | [\#94](https://github.com/liferay/eslint-config-liferay/issues/94)                                                                 |
| [liferay/padded-test-blocks](./plugins/eslint-plugin-liferay/docs/rules/padded-test-blocks.md)                                          | liferay                      | [\#75](https://github.com/liferay/eslint-config-liferay/pull/75)                                                                   |
| [liferay/sort-imports](./plugins/eslint-plugin-liferay/docs/rules/sort-imports.md)                                                      | liferay                      | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [liferay/sort-class-names](./plugins/eslint-plugin-liferay/docs/rules/sort-class-names.md)                                              | liferay                      | [\#108](https://github.com/liferay/eslint-config-liferay/issues/108)                                                               |
| [liferay/trim-class-names](./plugins/eslint-plugin-liferay/docs/rules/trim-class-names.md)                                              | liferay                      | [\#108](https://github.com/liferay/eslint-config-liferay/issues/108)                                                               |
| [no-console](https://eslint.org/docs/rules/no-console)                                                                                  | liferay                      | [\#79](https://github.com/liferay/eslint-config-liferay/pull/79)                                                                   |
| [no-for-of-loops/no-for-of-loops](https://www.npmjs.com/package/eslint-plugin-no-for-of-loops)                                          | liferay                      | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [no-only-tests/no-only-tests](https://www.npmjs.com/package/eslint-plugin-no-only-tests)                                                | liferay                      | [\#22](https://github.com/liferay/eslint-config-liferay/pull/22)                                                                   |
| [no-restricted-globals](https://eslint.org/docs/rules/no-restricted-globals)                                                            | liferay/portal               | [\#109](https://github.com/liferay/eslint-config-liferay/issues/109)                                                               |
| [no-return-assign](https://eslint.org/docs/rules/no-return-assign)                                                                      | liferay                      | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [no-unused-expressions](https://eslint.org/docs/rules/no-unused-expressions)                                                            | liferay                      | [\#19](https://github.com/liferay/eslint-config-liferay/issues/19)                                                                 |
| [no-unused-vars](https://eslint.org/docs/rules/no-unused-vars)                                                                          | liferay                      | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [notice/notice](https://www.npmjs.com/package/eslint-plugin-notice)                                                                     | liferay                      | [\#26](https://github.com/liferay/eslint-config-liferay/pull/26)                                                                   |
| [object-shorthand](https://eslint.org/docs/rules/object-shorthand)                                                                      | liferay                      | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [prefer-const](https://eslint.org/docs/rules/prefer-const)                                                                              | liferay                      | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [quote-props](https://eslint.org/docs/rules/quote-props)                                                                                | liferay                      | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [radix](https://eslint.org/docs/rules/radix)                                                                                            | liferay                      | [\#66](https://github.com/liferay/eslint-config-liferay/pull/66)                                                                   |
| [react-hooks/exhaustive-deps](https://www.npmjs.com/package/eslint-plugin-react-hooks)                                                  | liferay/react                | [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)                                                                        |
| [react-hooks/rules-of-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)                                                   | liferay/react                | [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)                                                                        |
| [react/forbid-foreign-prop-types](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/forbid-foreign-prop-types.md) | liferay/react                | [\#301](https://github.com/liferay/liferay-npm-tools/issues/301)                                                                   |
| [react/jsx-fragments](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-fragments.md)                           | liferay/react                | [\#58](https://github.com/liferay/eslint-config-liferay/pull/58)                                                                   |
| [react/jsx-key](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-key.md)                                       | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/jsx-no-comment-textnodes](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-no-comment-textnodes.md)     | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/jsx-no-duplicate-props](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-no-duplicate-props.md)         | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/jsx-no-undef](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-no-undef.md)                             | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/jsx-sort-props](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-sort-props.md)                         | liferay/react                | [\#58](https://github.com/liferay/eslint-config-liferay/pull/51)                                                                   |
| [react/jsx-uses-react](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-uses-react.md)                         | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/jsx-uses-vars](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-uses-vars.md)                           | liferay/react, liferay/metal | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42), [\#50](https://github.com/liferay/eslint-config-liferay/pull/50) |
| [react/no-children-prop](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-children-prop.md)                     | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-danger-with-children](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-danger-with-children.md)       | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-direct-mutation-state](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-direct-mutation-state.md)     | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-is-mounted](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-is-mounted.md)                           | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-render-return-value](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-render-return-value.md)         | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-string-refs](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-string-refs.md)                         | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-unescaped-entities](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-unescaped-entities.md)           | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-unknown-property](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-unknown-property.md)               | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/require-render-return](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/require-render-return.md)           | liferay/react                | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [sort-destructure-keys/sort-destructure-keys](https://github.com/mthadley/eslint-plugin-sort-destructure-keys)                          | liferay                      | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [sort-keys](https://eslint.org/docs/rules/sort-keys)                                                                                    | liferay                      | [\#63](https://github.com/liferay/eslint-config-liferay/pull/63)                                                                   |

### Custom rules

#### `eslint-plugin-liferay`

The bundled `eslint-plugin-liferay` plugin includes the following [rules](./plugins/eslint-plugin-liferay/docs/rules):

-   [liferay/destructure-requires](./plugins/eslint-plugin-liferay/docs/rules/destructure-requires.md): Enforces (and autofixes) that `require` statements use destructuring.
-   [liferay/group-imports](./plugins/eslint-plugin-liferay/docs/rules/group-imports.md): Enforces (and autofixes) `import` and `require` grouping.
-   [liferay/import-extensions](./plugins/eslint-plugin-liferay/docs/rules/import-extensions.md): Enforces consistent usage/omission of file extensions in imports.
-   [liferay/imports-first](./plugins/eslint-plugin-liferay/docs/rules/imports-first.md): Enforces that imports come first in the file.
-   [liferay/no-absolute-import](./plugins/eslint-plugin-liferay/docs/rules/no-absolute-import.md): Enforces that imports do not use absolute paths.
-   [liferay/no-duplicate-class-names](./plugins/eslint-plugin-liferay/docs/rules/no-duplicate-class-names.md): Enforces (and autofixes) uniqueness of class names inside JSX `className` attributes.
-   [liferay/no-duplicate-imports](./plugins/eslint-plugin-liferay/docs/rules/no-duplicate-imports.md): Enforces at most one `import` of any given module per file.
-   [liferay/no-dynamic-require](./plugins/eslint-plugin-liferay/docs/rules/no-dynamic-require.md): Enforces that `require()` calls use static arguments.
-   [liferay/no-it-should](./plugins/eslint-plugin-liferay/docs/rules/no-it-should.md): Enforces that `it()` descriptions start with a verb, not with "should".
-   [liferay/no-require-and-call](./plugins/eslint-plugin-liferay/docs/rules/no-require-and-call.md): Enforces that the result of a `require()` call at the top level is not immediately called.
-   [liferay/padded-test-blocks](./plugins/eslint-plugin-liferay/docs/rules/padded-test-blocks.md): Enforces blank lines between test blocks (`it()` etc).
-   [liferay/sort-class-names](./plugins/eslint-plugin-liferay/docs/rules/sort-class-names.md): Enforces (and autofixes) ordering of class names inside JSX `className` attributes.
-   [liferay/sort-imports](./plugins/eslint-plugin-liferay/docs/rules/sort-imports.md): Enforces (and autofixes) `import` and `require` ordering.
-   [liferay/trim-class-names](./plugins/eslint-plugin-liferay/docs/rules/trim-class-names.md): Enforces (and autofixes) that class names inside JSX `className` attributes do not have leading or trailing whitespace.

#### `eslint-plugin-liferay-portal`

The bundled `eslint-plugin-liferay-portal` plugin includes the following [rules](./plugins/eslint-plugin-liferay-portal/docs/rules):

-   [liferay-portal/no-global-fetch](./plugins/eslint-plugin-liferay-portal/docs/rules/no-global-fetch.md): Prevents usage of unwrapped fetch to avoid possible issues related to security misconfiguration.
-   [liferay-portal/no-explicit-extend](./plugins/eslint-plugin-liferay-portal/docs/rules/no-explicit-extend.md): Prevents unnecessary extensions in ESLint and Babel configuration files.
-   [liferay-portal/no-loader-import-specifier](./plugins/eslint-plugin-liferay-portal/docs/rules/no-loader-import-specifier.md): Ensures that ".scss" files imported via the loader are used only for side-effects.
-   [liferay-portal/no-metal-plugins](./plugins/eslint-plugin-liferay-portal/docs/rules/no-metal-plugins.md): Prevents usage of deprecated `metal-*` plugins and utilities.
-   [liferay-portal/no-react-dom-render](./plugins/eslint-plugin-liferay-portal/docs/rules/no-react-dom-render.md): Prevents direct usage of `ReactDOM.render` in favor of our wrapper.
-   [liferay-portal/no-side-navigation](./plugins/eslint-plugin-liferay-portal/docs/rules/no-side-navigation.md): Guards against the use of the legacy jQuery `sideNavigation` plugin.

## License

MIT
