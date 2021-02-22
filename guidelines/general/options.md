# Optional function parameters

## How to use an `options` parameter

A common JS pattern to avoid lengthy function parameter lists is to accept an `options` object. That is, rather than creating a function that accepts many parameters...

```js
function createDirectory(path, mode, owner, group, recursive) {
	// ...
}
```

we prefer to accept an options object:

```js
function createDirectory(path, options) {
	// ...
}
```

This means we don't have to think so hard about parameter order, and we have the ability to pass only a subset of options.

In order to provide reasonable defaults and make the function easy to call, you should use a combination of destructuring and default values:

```js
function createDirectory(
	path,
	{group = 'wheel', mode = '0755', owner = 'root', recursive = false} = {}
) {
	// ...
}
```

If the options list is particularly large, an acceptable alternative approach is to declare the defaults in a separate object as follows, but in practice Prettier is pretty good at making anything look good:

```js
const DEFAULT_OPTIONS = {
	group: 'wheel',
	mode: '0755',
	owner: 'root',
	recursive: false,
};

function createDirectory(path, options = {}) {
	const {group, mode, owner, recursive} = {
		...DEFAULT_OPTIONS,
		...options,
	};

	// ...
}
```

Finally, it is worth noting that you should avoid patterns like this, which preclude the user from passing only a subset of options (because they prevent the default options from applying):

```js
function createDirectory(path, options) {
	// ⚠️  If a user passes {recursive: true} here, none of the other
	// defaults take effect.

	options = options || {
		group: 'wheel',
		mode: '0755',
		owner: 'root',
		recursive: false,
	};

	// ...
}
```

## When to use an `options` parameter

Despite this pattern being convenient and widely used, it's _also_ important to remember that a function that takes too many options may become unwieldy and hard to use. [Some say, for example](https://www.informit.com/articles/article.aspx?p=1392524), that "Boolean arguments loudly declare that the function does more than one thing. They are confusing and should be eliminated."

Our `createDirectory()` example is obviously a good fit for an `options` object. It isn't too complex, and even though the function does "more than one thing", it's really just the same "thing" in different ways that clearly belong together in a cohesive way. The alternative — splitting the function into `createDirectoryRecursive()`, `createDirectoryShallow()` (etc) — is obviously very unpleasant.

A counter-example would be a `rotate(angle)` function that could take a `clockwise` boolean option. Nobody wants to have to write `rotate(90, {clockwise: false})`. A better choice would be avoid options and just take an `angle` parameter, stipulating in the documentation that all rotations are in a particular direction. This is what [the canvas `rotate()` method](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate) does; negative angles can be used to rotate in the opposite direction.
