# eslint-config-liferay

> ESLint [shareable config](http://eslint.org/docs/developer-guide/shareable-configs.html) for the Liferay JavaScript style guide.

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

### React

For React projects, you can extend `liferay/react` instead:

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

### liferay-portal

In [liferay-portal](https://github.com/liferay/liferay-portal) itself we extend the `liferay/portal` preset instead, which activates some additional rules specific to liferay-portal. See the `eslint-plugin-liferay-portal` section below for more details.

This extension is applied automatically by [liferay-npm-scripts](https://github.com/liferay/liferay-npm-tools/tree/master/packages/liferay-npm-scripts), so you don't have to configure it explicitly.

> **An important disclaimer about the use of ESLint in liferay-portal**
>
> JavaScript code that appears inline inside JSP files and other templates is not currently checked by ESLint. Our long-term strategy is to move as much code as possible out of JSP and into React components, but in the interim, our only option is to rely on liferay-portal's existing source formatter for those files.

### Copyright headers

The included [`eslint-plugin-notice`](https://www.npmjs.com/package/eslint-plugin-notice) plug-in can be used to enforce the use of uniform copyright headers across a project by placing a template named `copyright.js` in the project root (for example, see [the file defining the headers used in eslint-config-liferay itself](https://github.com/liferay/eslint-config-liferay/blob/master/copyright.js)).

### Custom rules

#### `eslint-plugin-liferay`

The bundled `eslint-plugin-liferay` plugin includes the following [rules](./plugins/eslint-plugin-liferay/docs/rules):

-   [liferay/no-it-should](./plugins/eslint-plugin-liferay/docs/rules/no-it-should.md): Enforces that `it()` descriptions start with a verb, not with "should".

#### `eslint-plugin-liferay-portal`

The bundled `eslint-plugin-liferay-portal` plugin includes the following [rules](./plugins/eslint-plugin-liferay-portal/docs/rules):

-   [liferay-portal/no-global-fetch](./plugins/eslint-plugin-liferay-portal/docs/rules/no-global-fetch.md): Prevents usage of unwrapped fetch to avoid possible issues related to security misconfiguration.
-   [liferay-portal/no-explicit-extend](./plugins/eslint-plugin-liferay-portal/docs/rules/no-explicit-extend.md): Prevents unnecessary `extends: ["liferay/portal"]` configuration.
-   [liferay-portal/no-metal-plugins](./plugins/eslint-plugin-liferay-portal/docs/rules/no-metal-plugins.md): Prevents usage of deprecated `metal-*` plugins and utilities.
-   [liferay-portal/no-side-navigation](./plugins/eslint-plugin-liferay-portal/docs/rules/no-side-navigation.md): Guards against the use of the legacy jQuery `sideNavigation` plugin.

## License

MIT
