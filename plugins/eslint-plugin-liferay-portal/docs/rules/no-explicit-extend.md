# Disallow unnecessary `extends: ["liferay/portal"]` configuration (no-explicit-extends)

This rule guards against unnecessary inclusion of the "liferay/portal" configuration.

## Rule Details

Examples of **incorrect** code for this rule:

```js
// .eslintrc.js
module.exports = {
	extends: ['liferay/portal', 'liferay/react'],
};
```

Examples of **correct** code for this rule:

```js
// .eslintrc.js
module.exports = {
	extends: ['liferay/react'],
};
```

## Further Reading

-   [eslint-config-liferay/#53](https://github.com/liferay/eslint-config-liferay/pull/53)
