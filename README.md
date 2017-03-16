# eslint-config-liferay

> ESLint [shareable config](http://eslint.org/docs/developer-guide/shareable-configs.html) for the Liferay JavaScript style guide, based on [Google JavaScript style guide](https://google.github.io/styleguide/jsguide.html)


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

### Using the `liferay` config with `google` and `eslint:recommended`

The `liferay` config uses [`eslint:recommended` ruleset](http://eslint.org/docs/rules/) and Google style, in a way that combines the ESLint's recommended rule set with Google's own style rules where the last one is not opinionated.

To see how the `liferay` config compares with `google` and `eslint:recommended`, refer to the [source code of `index.js`](https://github.com/liferay/eslint-config-liferay/blob/master/index.js), which lists every ESLint rule along with whether (and how) it is enforced by the `liferay` config.


## License

MIT
