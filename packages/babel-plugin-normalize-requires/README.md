# babel-plugin-normalize-requires

> Normalize AMD `require()` calls.

## Details

This plugin removes `.js` and `/` suffixes from module names used in AMD 
`require()` calls.

However, the plugin is smart enough to not remove `.js` suffixes when they are 
part of the npm package name (as opposed to module name).

## Example

**In**

```
require('./a-module.js')
```

**Out**

```
 require('./a-module')
```

## Installation

```
npm install --save-dev babel-plugin-normalize-requires
```

## Usage

Add the following to your `.babelrc` file:

```
{
  "plugins": ["normalize-requires"]
}
```