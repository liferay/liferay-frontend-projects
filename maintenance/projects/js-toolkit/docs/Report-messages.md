This page explains the messages that may appear in the report file in detail.

### 0001

> **Emptied file {file} as configured in {directory}**

This message is shown whenever the bundler encounters a `browser` declaration in a `package.json` file that aliases a module to `false` (see [the `browser` spec](https://github.com/defunctzombie/package-browser-field-spec/blob/master/README.md) for more information).

The mentioned file will be left empty which will cause the module to export an empty object `{}` if it is required.

### 0002

> **Redirected file {file} to {alias} as configured in {directory}**

This message is shown whenever the bundler encounters a `browser` declaration in a `package.json` file that aliases a module to another module (see [the `browser` spec](https://github.com/defunctzombie/package-browser-field-spec/blob/master/README.md) for more information).

The mentioned file content will be substituted by:

```javascript
module.exports = require('{alias}');
```

### 0003

> **Alias '${alias.from}' configured in ${where} will not be visible from outside because a local module with the same name exists**

This warning message is shown whenever the bundler encounters a `browser` declaration in a `package.json` file that aliases an external module to another module (see [the `browser` spec](https://github.com/defunctzombie/package-browser-field-spec/blob/master/README.md) for more information) but there is already a local module with the same name as the external one.

For example, imagine the following `package.json` which is polyfilling Node's `fs` module with a local file.:

```json
{
	"name": "my-project",
	"browser": {
		"fs": "./my-fs-shim.js"
	}
}
```

That configuration not only polyfills any `require('fs')` in your project, but also exports a `my-project/fs` package which effectively points to `my-project/my-fs-shim.js` and can be required from outside.

The bundler does so by creating a new `fs.js` file with the content in its output:

```javascript
module.exports = require('./my-fs-shim.js');
```

Note that even though this is not shown in the spec, but webpack does it, so it should be considered a de-facto standard, though the situation is quite uncommon.

Now imagine what would happen if you had a `fs.js` in your package, next to `my-fs-shim.js` there would be a collision, because `my-project/fs` would point both to `my-project/my-fs-shim.js` and `my-project/fs.js` which is impossible.

In that case, the bundler refrains from overwriting your `fs.js` file thus, if you require `my-project/fs` from outside, `my-project/fs.js` will be returned (instead of `my-project/my-fs-shim.js`).

### 0004

> **File {file} is aliased more than once, only the alias configured in \${directory} will be visible when required from outside**

This warning message is shown whenever the bundler encounters multiple `browser` declarations in `package.json` files that alias a module to different modules (see [the `browser` spec](https://github.com/defunctzombie/package-browser-field-spec/blob/master/README.md) for more information).

For example, you may have this in your project's root folder `package.json` file:

```json
{
	"name": "my-project",
	"browser": {
		"./util/random.js": "./my-random-shim.js"
	}
}
```

And then, in the `util` folder of your project, you may have another `package.json` file with:

```json
{
	"browser": {
		"./random.js": "./my-other-random-shim.js"
	}
}
```

Though the situation would be quite strange, this is aliasing `my-project/util/random.js` twice and, because the bundler is targeting an AMD environment, it can only return one of the two alternatives (`my-project/my-random-shim.js` or `my-project/util/my-other-random-shim.js`) when a `require('my-project/util/random)` is issued.

So, what the message tells you is which one will be used.

# 0005

> **Replaced require('{module}') with {}**

This message is shown whenever the bundler encounters a `browser` declarations in a `package.json` file that aliases a module to `false` (see [the `browser` spec](https://github.com/defunctzombie/package-browser-field-spec/blob/master/README.md) for more information).

For example, you may have this in your project's root folder `package.json` file:

```json
{
	"name": "my-project",
	"browser": {
		"./util/files.js": false
	}
}
```

In that case, any call like:

```javascript
var files = `require('./util/files')`;
```

will be replaced by:

```javascript
var files = {};
```

# 0006

> **Redirected '{module}' to '\${other module}'**

This message is shown whenever the bundler encounters a `browser` declarations in a `package.json` file that aliases a module to another module (see [the `browser` spec](https://github.com/defunctzombie/package-browser-field-spec/blob/master/README.md) for more information).

For example, you may have this in your project's root folder `package.json` file:

```json
{
	"name": "my-project",
	"browser": {
		"./util/random.js": "./browser/random.js"
	}
}
```

In that case, any call like:

```javascript
var files = `require('./util/random')`;
```

will be replaced by:

```javascript
var files = `require('./browser/random')`;
```
