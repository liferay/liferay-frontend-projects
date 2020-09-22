# Trim whitespace inside the "className" JSX attribute (trim-class-names)

This rule enforces (and autofixes) that the class names inside the "className" attribute of a JSX element are not preceded or followed by whitespace.

## Rule Details

Examples of **incorrect** code for this rule:

```js
<div className="   foo bar"></div>
<div className="foo bar"></div>
<div className={'    foo bar    '}></div>
```

Examples of **correct** code for this rule:

```js
<div className="foo bar"></div>
<div className="foo bar"></div>
<div className={'foo bar'}></div>
```

### Limitations

Note that this only looks at string literals and template literals.

It does not currently check calls to the popular [classnames](https://www.npmjs.com/package/classnames) NPM package:

```js
// `classNames()` calls are not checked:
<div className={classNames('   foo   ', '   bar   ')}></div>
```

## Related

-   [no-duplicate-class-names](./no-duplicate-class-names.md)
-   [sort-class-names](./sort-class-names.md)

## Further Reading

-   [Issue \#108: Sort class names in JSX className attributes](https://github.com/liferay/eslint-config-liferay/issues/108)
