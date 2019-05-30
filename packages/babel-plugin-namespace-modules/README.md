# babel-plugin-namespace-modules

> Namespace modules based on the root project's package name and version. This
> plugin prepends `<project-package-name>$` to each module name appearance (in
> define() or require() calls) so that the packages are localized per project
> and don't clash.

## Example

If your project is named `test-package`:

**In**

```javascript
define('a-module', ['a-module', './a-local-module', 'fs'], function() {
	require('a-module');
	require('./a-local-module');
	require('fs');
});
```

**Out**

```javascript
define('a-module', [
	'my-project$a-module',
	'./a-local-module',
	'fs',
], function() {
	require('my-project$a-module');
	require('./a-local-module');
	require('fs');
});
```

## Installation

```sh
npm install --save-dev babel-plugin-namespace-modules
```

## Usage

Add the following to your `.babelrc` file:

**Without options:**

```json
{
	"plugins": ["namespace-modules"]
}
```

## Technical Details

This plugins scans modules for AMD `define()` and `require()` calls and rewrites
module name arguments to prepend the root project's name to it.

In case a module belongs to a scoped package, the root project's name is
prepended to the scope name not including the `@`. So, for example:
`@a-scope/a-package` would be converted to `@my-project$a-scope/a-package`.

This plugin is normally used to sandbox dependencies of a whole project so that
they are not shared with any other project. This, of course, disables the
possibility of deduplication between different projects, but leads to better
stability and predictability during runtime (specially when using peer
dependencies).

When this plugin is used you are guaranteed that you will get the same
dependencies during runtime as you have in development.

Please note that, if you intend to use this plugin with `liferay-npm-bundler`,
you should also use its counterpart
`liferay-npm-bundler-plugin-namespace-packages` which namespaces `package.json`
dependencies too.
