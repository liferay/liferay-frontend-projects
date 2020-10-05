# babel-plugin-wrap-modules-amd

> Wrap modules inside an AMD `define()` module.

## Example

**In**

```javascript
var console = require('console');
console.info('Say something');
```

**Out**

```javascript
define(['module', 'exports', 'require', 'console'], function(
	module,
	exports,
	require
) {
	var console = require('console');
	console.log('Say something');
});
```

## Installation

```sh
npm install --save-dev babel-plugin-wrap-modules-amd
```

## Usage

Add the following to your `.babelrc` file:

```json
{
	"plugins": ["wrap-modules-amd"]
}
```

## Technical Details

This plugin wraps the code inside the module with an AMD `define()` call. The
module is not given any name and any dependencies detected by inspecting
`require()` calls are appended to the `define()` dependencies array so that they
can be found when `require()` is called.
