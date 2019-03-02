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

## License

MIT
