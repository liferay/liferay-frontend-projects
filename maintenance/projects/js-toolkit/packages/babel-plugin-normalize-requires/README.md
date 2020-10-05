# babel-plugin-normalize-requires

> Normalize AMD `require()` calls.

## Example

**In**

```javascript
require('./a-module.js');
```

**Out**

```javascript
require('./a-module');
```

## Installation

```sh
npm install --save-dev babel-plugin-normalize-requires
```

## Usage

Add the following to your `.babelrc` file:

```json
{
	"plugins": ["normalize-requires"]
}
```

## Technical Details

This plugin removes `.js` and `/` suffixes from module names used in AMD
`require()` calls.

However, the plugin is smart enough to not remove `.js` suffixes when they are
part of the npm package name (as opposed to module name).
