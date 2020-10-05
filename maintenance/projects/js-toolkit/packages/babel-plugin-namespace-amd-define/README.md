# babel-plugin-namespace-amd-define

> Add a prefix to AMD `define()` calls.

## Example

**In**

```javascript
define([], function() {});
```

**Out**

```javascript
Liferay.Loader.define([], function() {});
```

## Installation

```sh
npm install --save-dev babel-plugin-namespace-amd-define
```

## Usage

Add the following to your `.babelrc` file:

**Without options:**

```json
{
	"plugins": ["namespace-amd-define"]
}
```

**With options:**

```json
{
	"plugins": [
		[
			"namespace-amd-define",
			{
				"namespace": "window.MyProject.Loader"
			}
		]
	]
}
```

## Technical Details and Options

This module adds a prefix to any AMD `define()` call that it finds. The prefix
is specified with the `namespace` option and a period is inserted between the
namespace string and the `define()` call.

By default, the `namespace` option is set to `Liferay.Loader`.
