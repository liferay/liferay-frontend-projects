# Disallow use of specifiers for non-JS resources imported via the loader (no-loader-import-specifier)

The Liferay bundler [provides various loaders](https://github.com/liferay/liferay-js-toolkit/wiki/List-of-loaders) for injecting non-JS resources (for example, CSS, SCSS) into a page. These resources should be included via `import` statements for their side effects only, and not bound to a name using an import specifier.

**NOTE:** At present, we only use this mechanism to load ".scss" files, but may extend this rule in the future to handle other non-JS resource types.

## Rule Details

Examples of **incorrect** code for this rule:

```js
import styles from './MyComponent.scss';
```

Examples of **correct** code for this rule:

```js
import './MyComponent.scss';
```

## Further Reading

-   [Default bundler loader configuration](https://github.com/liferay/liferay-npm-tools/blob/fd5b7f51151bdeb8280f2c2edd0de7c0f5c88f26/packages/liferay-npm-bundler-preset-liferay-dev/config.json#L271-L282) used in liferay-portal.
