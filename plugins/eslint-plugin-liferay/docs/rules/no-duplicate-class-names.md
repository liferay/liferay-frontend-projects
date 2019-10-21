# Class names inside the "className" JSX attribute must be unique (no-duplicate-class-names)

This rule enforces (and autofixes) that the class names inside the "className" attribute of a JSX element are unique.

## Rule Details

Examples of **incorrect** code for this rule:

```js
<div className="one one two"></div>
```

Examples of **correct** code for this rule:

```js
<div className="one two"></div>
```

### Limitations

Note that this only looks at string literals and template literals.

It does not currently check calls to the popular [classnames](https://www.npmjs.com/package/classnames) NPM package:

```js
// `classNames()` calls are not checked:
<div className={classNames('one', 'one')}></div>
```

## Related

-   [sort-class-names](./sort-class-names.md)
-   [trim-class-names](./trim-class-names.md)

## Further Reading

-   [Issue \#108: Sort class names in JSX className attributes](https://github.com/liferay/eslint-config-liferay/issues/108)
