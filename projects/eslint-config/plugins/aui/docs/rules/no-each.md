# Avoid using `A.each(array, (item) => item)`

This rule prohibits using `A.Array` and its utilities.

## Rule Details

Examples of **incorrect** code for this rule:

```js
A.each(array, (item) => console.log(item));
```

Examples of **correct** code for this rule:

```js
array.forEach((item) => console.log(item));
```
