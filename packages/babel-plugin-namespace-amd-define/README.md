# babel-plugin-namespace-amd-define

> Add a prefix to AMD `define()` calls.

## Details

This module adds a prefix to any AMD `define()` call that it finds. The prefix
is specified with the `namespace` option and a period is inserted between the 
namespace string and the `define()` call.

By default, the `namespace` option is set to `Liferay.Loader`.

## Example

**In**

```
define([], function(){})
```

**Out**

```
Liferay.Loader.define([], function(){})
```

## Installation

```
npm install --save-dev babel-plugin-namespace-amd-define
```

## Usage

Add the following to your `.babelrc` file:

**Without options:**
```
{
  "plugins": ["namespace-amd-define"]
}
```

**With options:**
```
{
  "plugins": [
    ["namespace-amd-define", {
        "namespace": "window.MyProject.Loader"
    }]
  ]
}
```
