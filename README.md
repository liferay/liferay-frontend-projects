# eslint-config-liferay

> ESLint [shareable config](http://eslint.org/docs/developer-guide/shareable-configs.html) for the Liferay JavaScript style guide.

## Installation

```
$ npm install --save-dev eslint eslint-config-liferay
```

## Usage

Once the `eslint-config-liferay` package is installed, you can use it by specifying `liferay` in the [`extends`](http://eslint.org/docs/user-guide/configuring#extending-configuration-files) section of your [ESLint configuration](http://eslint.org/docs/user-guide/configuring).

```js
{
  "extends": "liferay",
  "rules": {
    // Additional, per-project rules...
  }
}
```

### Copyright headers

The included [`eslint-plugin-notice`](https://www.npmjs.com/package/eslint-plugin-notice) plug-in can be used to enforce the use of uniform copyright headers across a project by placing a template named `copyright.js` in the project root (for example, see [the file defining the headers used in eslint-config-liferay itself](https://github.com/liferay/eslint-config-liferay/blob/master/copyright.js)).

## License

MIT
