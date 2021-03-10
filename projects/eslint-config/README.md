# @liferay/eslint-config

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
$ npm install --save-dev eslint @liferay/eslint-config
```

## Usage

Once the `@liferay/eslint-config` package is installed, you can use it by specifying `@liferay` in the [`extends`](http://eslint.org/docs/user-guide/configuring#extending-configuration-files) section of your [ESLint configuration](http://eslint.org/docs/user-guide/configuring).

```js
module.exports = {
	extends: ['@liferay'],
};
```

This preset provides a reasonable starting point for an independent open source project.

### liferay-portal

In [liferay-portal](https://github.com/liferay/liferay-portal) itself we extend the `@liferay/eslint-config/portal` preset instead, which activates some rules specific to liferay-portal. This preset assumes the use of React, and also provides a set of custom rules that are described in detail in the `@liferay/eslint-plugin/portal` section below.

This extension is applied automatically by [@liferay/npm-scripts](https://github.com/liferay/liferay-frontend-projects/tree/master/projects/npm-tools/packages/npm-scripts), so you don't have to configure it explicitly.

> **An important disclaimer about the use of ESLint in liferay-portal**
>
> JavaScript code that appears inline inside JSP files and other templates is only lightly checked by ESLint, because JSP is an impoverished environment where we have to work with context-free snippets of text as opposed to fully-formed, valid JS modules. Our long-term strategy is to move as much code as possible out of JSP and into React components, but in the interim, please be aware that the level of safety provided by the linter inside JSP is greatly reduced.

### React

For React projects outside of liferay-portal, you can extend `@liferay/eslint-plugin/react` instead:

```js
module.exports = {
	extends: ['@liferay/eslint-config/react'],
};
```

### metal-jsx

For legacy projects inside liferay-portal that use [metal-jsx](https://www.npmjs.com/package/metal-jsx), we have a "metal" preset:

```js
module.exports = {
	extends: ['@liferay/eslint-config/metal'],
};
```

Use this preset to stop ESLint from [spuriously warning that variables that are used as JSX components are unused](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-uses-vars.md).

### Copyright headers

The included [`eslint-plugin-notice`](https://www.npmjs.com/package/eslint-plugin-notice) plug-in can be used to enforce the use of uniform copyright headers across a project by placing a template named `copyright.js` in the project root (for example, see [the file defining the headers used in eslint-config-liferay itself](https://github.com/liferay/liferay-frontend-projects/blob/master/projects/eslint-config/copyright.js)) and configuring the rule:

```javascript
const path = require('path');

module.exports = {
	extends: ['@liferay'],
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

If we were to provide configuration by default, then if `bottom-level/.eslintrc.js` does an `extends: ['@liferay']`, then the default configuration would be considered more local than the one provided by `mid-level`, causing the wrong `copyright.js` to be used.

### Base rules

| Rule or preset                                                                                                                          | Where we use it                                            | Notes                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)                                                            | @liferay                                                   | Preset that turns off ESLint rules that conflict with [Prettier](https://prettier.io/)                                             |
| [eslint:recommended](https://eslint.org/docs/rules/)                                                                                    | @liferay                                                   | Preset bundled with [ESLint](https://eslint.org/docs/rules/)                                                                       |
| [default-case](https://eslint.org/docs/rules/default-case)                                                                              | @liferay                                                   | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [@liferay/portal/deprecation](./plugins/portal/docs/rules/deprecation.md)                                                               | @liferay/eslint-config/portal                              | [\#55](https://github.com/liferay/eslint-config-liferay/pull/55)                                                                   |
| [@liferay/portal/no-explicit-extend](./plugins/portal/docs/rules/no-explicit-extend.md)                                                 | @liferay/eslint-config/portal                              | [\#54](https://github.com/liferay/eslint-config-liferay/pull/54)                                                                   |
| [@liferay/portal/no-global-fetch](./plugins/portal/docs/rules/no-global-fetch.md)                                                       | @liferay/eslint-config/portal                              | [\#62](https://github.com/liferay/eslint-config-liferay/pull/62)                                                                   |
| [@liferay/portal/no-loader-import-specifier](./plugins/portal/docs/rules/no-loader-import-specifier.md)                                 | @liferay/eslint-config/portal                              | [\#122](https://github.com/liferay/eslint-config-liferay/issues/122)                                                               |
| [@liferay/portal/no-metal-plugins](./plugins/portal/docs/rules/no-metal-plugins.md)                                                     | @liferay/eslint-config/portal                              | [\#61](https://github.com/liferay/eslint-config-liferay/pull/61)                                                                   |
| [@liferay/portal/no-react-dom-render](./plugins/portal/docs/rules/no-react-dom-render.md)                                               | @liferay/eslint-config/portal                              | [\#71](https://github.com/liferay/eslint-config-liferay/pull/71)                                                                   |
| [@liferay/portal/no-side-navigation](./plugins/portal/docs/rules/no-side-navigation.md)                                                 | @liferay/eslint-config/portal                              | [\#44](https://github.com/liferay/eslint-config-liferay/pull/44)                                                                   |
| [@liferay/liferay/array-is-array](./plugins/liferay/docs/rules/array-is-array.md)                                                       | @liferay                                                   | [\#139](https://github.com/liferay/eslint-config-liferay/issues/139)                                                               |
| [@liferay/liferay/destructure-requires](./plugins/liferay/docs/rules/destructure-requires.md)                                           | @liferay                                                   | [\#94](https://github.com/liferay/eslint-config-liferay/issues/94)                                                                 |
| [@liferay/liferay/group-imports](./plugins/liferay/docs/rules/group-imports.md)                                                         | @liferay                                                   | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [@liferay/liferay/import-extensions](./plugins/liferay/docs/rules/import-extensions.md)                                                 | @liferay                                                   | [\#137](https://github.com/liferay/eslint-config-liferay/issues/137)                                                               |
| [@liferay/liferay/imports-first](./plugins/liferay/docs/rules/imports-first.md)                                                         | @liferay                                                   | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [@liferay/liferay/no-absolute-import](./plugins/liferay/docs/rules/no-absolute-import.md)                                               | @liferay                                                   | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [@liferay/liferay/no-arrow](./plugins/liferay/docs/rules/no-arrow.md)                                                                   | @liferay                                                   | [\#179](https://github.com/liferay/eslint-config-liferay/issues/179)                                                               |
| [@liferay/liferay/no-duplicate-class-names](./plugins/liferay/docs/rules/no-duplicate-class-names.md)                                   | @liferay                                                   | [\#108](https://github.com/liferay/eslint-config-liferay/issues/108)                                                               |
| [@liferay/liferay/no-duplicate-imports](./plugins/liferay/docs/rules/no-duplicate-imports.md)                                           | @liferay                                                   | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [@liferay/liferay/no-dynamic-require](./plugins/liferay/docs/rules/no-dynamic-require.md)                                               | @liferay                                                   | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [@liferay/liferay/no-it-should](./plugins/liferay/docs/rules/no-it-should.md)                                                           | @liferay                                                   | [\#43](https://github.com/liferay/eslint-config-liferay/pull/43)                                                                   |
| [@liferay/liferay/no-require-and-call](./plugins/liferay/docs/rules/no-require-and-call.md)                                             | @liferay                                                   | [\#94](https://github.com/liferay/eslint-config-liferay/issues/94)                                                                 |
| [@liferay/liferay/padded-test-blocks](./plugins/liferay/docs/rules/padded-test-blocks.md)                                               | @liferay                                                   | [\#75](https://github.com/liferay/eslint-config-liferay/pull/75)                                                                   |
| [@liferay/liferay/sort-imports](./plugins/liferay/docs/rules/sort-imports.md)                                                           | @liferay                                                   | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [@liferay/liferay/sort-import-destructures](./plugins/liferay/docs/rules/sort-import-destructures.md)                                   | @liferay                                                   | [\#124](https://github.com/liferay/eslint-config-liferay/issues/124)                                                               |
| [@liferay/liferay/sort-class-names](./plugins/liferay/docs/rules/sort-class-names.md)                                                   | @liferay                                                   | [\#108](https://github.com/liferay/eslint-config-liferay/issues/108)                                                               |
| [@liferay/liferay/trim-class-names](./plugins/liferay/docs/rules/trim-class-names.md)                                                   | @liferay                                                   | [\#108](https://github.com/liferay/eslint-config-liferay/issues/108)                                                               |
| [no-console](https://eslint.org/docs/rules/no-console)                                                                                  | @liferay                                                   | [\#79](https://github.com/liferay/eslint-config-liferay/pull/79)                                                                   |
| [no-eval](https://eslint.org/docs/rules/no-eval)                                                                                        | @liferay                                                   | [\#432](https://github.com/liferay/liferay-frontend-projects/issues/432)                                                           |
| [no-for-of-loops/no-for-of-loops](https://www.npmjs.com/package/eslint-plugin-no-for-of-loops) (default: off)                           | @liferay                                                   | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [no-only-tests/no-only-tests](https://www.npmjs.com/package/eslint-plugin-no-only-tests)                                                | @liferay                                                   | [\#22](https://github.com/liferay/eslint-config-liferay/pull/22)                                                                   |
| [no-restricted-globals](https://eslint.org/docs/rules/no-restricted-globals)                                                            | @liferay/eslint-config/portal                              | [\#109](https://github.com/liferay/eslint-config-liferay/issues/109)                                                               |
| [no-return-assign](https://eslint.org/docs/rules/no-return-assign)                                                                      | @liferay                                                   | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [no-unused-expressions](https://eslint.org/docs/rules/no-unused-expressions)                                                            | @liferay                                                   | [\#19](https://github.com/liferay/eslint-config-liferay/issues/19)                                                                 |
| [no-unused-vars](https://eslint.org/docs/rules/no-unused-vars)                                                                          | @liferay                                                   | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [notice/notice](https://www.npmjs.com/package/eslint-plugin-notice)                                                                     | @liferay                                                   | [\#26](https://github.com/liferay/eslint-config-liferay/pull/26)                                                                   |
| [object-shorthand](https://eslint.org/docs/rules/object-shorthand)                                                                      | @liferay                                                   | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [prefer-const](https://eslint.org/docs/rules/prefer-const)                                                                              | @liferay                                                   | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [quote-props](https://eslint.org/docs/rules/quote-props)                                                                                | @liferay                                                   | [\#30](https://github.com/liferay/eslint-config-liferay/pull/30)                                                                   |
| [radix](https://eslint.org/docs/rules/radix)                                                                                            | @liferay                                                   | [\#66](https://github.com/liferay/eslint-config-liferay/pull/66)                                                                   |
| [react-hooks/exhaustive-deps](https://www.npmjs.com/package/eslint-plugin-react-hooks)                                                  | @liferay/eslint-config/react                               | [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)                                                                        |
| [react-hooks/rules-of-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)                                                   | @liferay/eslint-config/react                               | [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)                                                                        |
| [react/forbid-foreign-prop-types](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/forbid-foreign-prop-types.md) | @liferay/eslint-config/react                               | [\#301](https://github.com/liferay/liferay-npm-tools/issues/301)                                                                   |
| [react/jsx-curly-brace-presence](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-curly-brace-presence.md)     | @liferay/eslint-config/react                               | [\#421](https://github.com/liferay/liferay-frontend-projects/issues/421)                                                           |
| [react/jsx-fragments](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-fragments.md)                           | @liferay/eslint-config/react                               | [\#58](https://github.com/liferay/eslint-config-liferay/pull/58)                                                                   |
| [react/jsx-key](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-key.md)                                       | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/jsx-no-comment-textnodes](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-no-comment-textnodes.md)     | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/jsx-no-duplicate-props](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-no-duplicate-props.md)         | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/jsx-no-undef](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-no-undef.md)                             | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/jsx-sort-props](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-sort-props.md)                         | @liferay/eslint-config/react                               | [\#58](https://github.com/liferay/eslint-config-liferay/pull/51)                                                                   |
| [react/jsx-uses-react](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-uses-react.md)                         | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/jsx-uses-vars](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-uses-vars.md)                           | @liferay/eslint-config/react, @liferay/eslint-config/metal | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42), [\#50](https://github.com/liferay/eslint-config-liferay/pull/50) |
| [react/no-children-prop](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-children-prop.md)                     | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-danger-with-children](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-danger-with-children.md)       | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-direct-mutation-state](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-direct-mutation-state.md)     | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-is-mounted](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-is-mounted.md)                           | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-render-return-value](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-render-return-value.md)         | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-string-refs](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-string-refs.md)                         | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-unescaped-entities](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-unescaped-entities.md)           | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/no-unknown-property](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/no-unknown-property.md)               | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [react/require-render-return](https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/require-render-return.md)           | @liferay/eslint-config/react                               | [\#42](https://github.com/liferay/eslint-config-liferay/pull/42)                                                                   |
| [sort-destructure-keys/sort-destructure-keys](https://github.com/mthadley/eslint-plugin-sort-destructure-keys)                          | @liferay                                                   | [\#60](https://github.com/liferay/liferay-frontend-guidelines/issues/60)                                                           |
| [sort-keys](https://eslint.org/docs/rules/sort-keys)                                                                                    | @liferay                                                   | [\#63](https://github.com/liferay/eslint-config-liferay/pull/63)                                                                   |

### Custom rules

#### `@liferay/liferay`

The bundled `@liferay/liferay` plugin includes the following [rules](./plugins/liferay/docs/rules):

-   [@liferay/liferay/array-is-array](./plugins/liferay/docs/rules/array-is-array.md): Enforces (and autofixes) the use of `Array.isArray()` over `instanceof Array`.
-   [@liferay/liferay/destructure-requires](./plugins/liferay/docs/rules/destructure-requires.md): Enforces (and autofixes) that `require` statements use destructuring.
-   [@liferay/liferay/group-imports](./plugins/liferay/docs/rules/group-imports.md): Enforces (and autofixes) `import` and `require` grouping.
-   [@liferay/liferay/import-extensions](./plugins/liferay/docs/rules/import-extensions.md): Enforces consistent usage/omission of file extensions in imports.
-   [@liferay/liferay/imports-first](./plugins/liferay/docs/rules/imports-first.md): Enforces that imports come first in the file.
-   [@liferay/liferay/no-absolute-import](./plugins/liferay/docs/rules/no-absolute-import.md): Enforces that imports do not use absolute paths.
-   [@liferay/liferay/no-arrow](./plugins/liferay/docs/rules/no-arrow.md): Bans arrow functions (for IE; not on by default).
-   [@liferay/liferay/no-duplicate-class-names](./plugins/liferay/docs/rules/no-duplicate-class-names.md): Enforces (and autofixes) uniqueness of class names inside JSX `className` attributes.
-   [@liferay/liferay/no-duplicate-imports](./plugins/liferay/docs/rules/no-duplicate-imports.md): Enforces at most one `import` of any given module per file.
-   [@liferay/liferay/no-dynamic-require](./plugins/liferay/docs/rules/no-dynamic-require.md): Enforces that `require()` calls use static arguments.
-   [@liferay/liferay/no-it-should](./plugins/liferay/docs/rules/no-it-should.md): Enforces that `it()` descriptions start with a verb, not with "should".
-   [@liferay/liferay/no-require-and-call](./plugins/liferay/docs/rules/no-require-and-call.md): Enforces that the result of a `require()` call at the top level is not immediately called.
-   [@liferay/liferay/padded-test-blocks](./plugins/liferay/docs/rules/padded-test-blocks.md): Enforces blank lines between test blocks (`it()` etc).
-   [@liferay/liferay/sort-class-names](./plugins/liferay/docs/rules/sort-class-names.md): Enforces (and autofixes) ordering of class names inside JSX `className` attributes.
-   [@liferay/liferay/sort-imports](./plugins/liferay/docs/rules/sort-imports.md): Enforces (and autofixes) `import` and `require` ordering.
-   [@liferay/liferay/sort-import-destructures](./plugins/liferay/docs/rules/sort-import-destructures.md): Enforces (and autofixes) ordering of destructured names in `import` statements.
-   [@liferay/liferay/trim-class-names](./plugins/liferay/docs/rules/trim-class-names.md): Enforces (and autofixes) that class names inside JSX `className` attributes do not have leading or trailing whitespace.

#### `@liferay/portal`

The bundled `@liferay/portal` plugin includes the following [rules](./plugins/portal/docs/rules):

-   [@liferay/portal/deprecation](./plugins/portal/docs/rules/deprecation.md): Enforces standard formatting of `@deprecated` annotations.
-   [@liferay/portal/no-global-fetch](./plugins/portal/docs/rules/no-global-fetch.md): Prevents usage of unwrapped fetch to avoid possible issues related to security misconfiguration.
-   [@liferay/portal/no-explicit-extend](./plugins/portal/docs/rules/no-explicit-extend.md): Prevents unnecessary extensions in ESLint and Babel configuration files.
-   [@liferay/portal/no-loader-import-specifier](./plugins/portal/docs/rules/no-loader-import-specifier.md): Ensures that ".scss" files imported via the loader are used only for side-effects.
-   [@liferay/portal/no-metal-plugins](./plugins/portal/docs/rules/no-metal-plugins.md): Prevents usage of deprecated `metal-*` plugins and utilities.
-   [@liferay/portal/no-react-dom-render](./plugins/portal/docs/rules/no-react-dom-render.md): Prevents direct usage of `ReactDOM.render` in favor of our wrapper.
-   [@liferay/portal/no-side-navigation](./plugins/portal/docs/rules/no-side-navigation.md): Guards against the use of the legacy jQuery `sideNavigation` plugin.

## License

MIT
