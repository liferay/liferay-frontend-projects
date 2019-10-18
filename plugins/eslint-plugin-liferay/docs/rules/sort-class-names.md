# Sort class names inside the "className" JSX attribute (sort-class-names)

This rule enforces (and autofixes) that the class names inside the "className" attribute of a JSX element are sorted, and any excess whitespace trimmed.

## Rule Details

Examples of **incorrect** code for this rule:

```js
<div className="a c b d"></div>
<div className="   a  b"></div>
<div className={'bar foo'}></div>
```

Examples of **correct** code for this rule:

```js
<div className="a b c d"></div>
<div className="a b"></div>
<div className={'foo bar'}></div>
```

### Limitations

Note that this only looks at string literals and simple template literals (that is, template literals without interpolated expressions).

It does not currently check calls to the popular [classnames](https://www.npmjs.com/package/classnames) NPM package:

```js
// `classNames()` calls are not checked:
<div className={classNames('a', 'b')}></div>
```

Likewise, it does not currently check for duplicate classnames:

```js
// Duplicates are not checked for:
<div className="a a a"></div>
```

## Further Reading

-   [Issue \#108: Sort class names in JSX className attributes](https://github.com/liferay/eslint-config-liferay/issues/108)
