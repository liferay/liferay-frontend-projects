# Anatomy of a test

> 🚧 This document is a work-in-progress.

## Start `it()` descriptions with a verb, not with "should"

Descriptions that start with "should" can usually be rewritten more concisely and without loss of information by dropping the "should" and starting with an appropriate verb. This is useful because it reduces the likelihood we'll have to introduce an ugly linebreak that harms readability:

### Example

Write this:

```javascript
it('applies default settings if none are given', () => {
	// ...
});
```

instead of:

```javascript
it('should apply default settings if none are given', () => {
	// ...
});
```

### Enforcement

[eslint-config-liferay](https://github.com/liferay/eslint-config-liferay) provide a custom lint rule, [liferay/no-it-should](https://github.com/liferay/eslint-config-liferay/blob/master/plugins/eslint-plugin-liferay/docs/rules/no-it-should.md), to guard against the use of "should" at the start of `it()` descriptions. It is active by default in all projects that use eslint-config-liferay.
