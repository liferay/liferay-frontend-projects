# Recommendations for testing

## Start `it()` descriptions with a verb, not with "should"

Descriptions that start with "should" can usually be rewritten more concisely and without loss of information by dropping the "should" and starting with an appropriate verb. This is useful because it reduces the likelihood we'll have to introduce an ugly linebreak that harms readability:

## Example

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
