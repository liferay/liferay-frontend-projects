# Disallow unnecessary `extends: ["liferay/portal", "liferay/react"]` configuration (no-explicit-extends)

This rule guards against unnecessary inclusion of the "liferay/portal" or "liferay/react" configurations.

## Rule Details

Examples of **incorrect** code for this rule:

```js
// .eslintrc.js
module.exports = {
	extends: ['liferay/metal', 'liferay/portal', 'liferay/react'],
};
```

Examples of **correct** code for this rule:

```js
// .eslintrc.js
module.exports = {
	extends: ['liferay/metal'],
};
```

## Further Reading

-   [eslint-config-liferay/#53](https://github.com/liferay/eslint-config-liferay/pull/53)
-   [IFI-1194](https://issues.liferay.com/browse/IFI-1194)
