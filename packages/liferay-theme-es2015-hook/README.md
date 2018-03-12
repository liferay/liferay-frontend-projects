# Liferay Theme es2015 Hook

> A hook for liferay-theme-tasks that allows for es2015 transpilation and AMD module configuration.

## Install

Hook modules must be added as a dependency of a Liferay theme.

```
npm i --save liferay-theme-es2015-hook
```

After npm is done installing the dependency you must add the hook to the `liferayTheme.hookModules` property in your theme's `package.json` file.

```json
{
  "name": "my-liferay-theme",
  "version": "1.0.0",
  "main": "package.json",
  "keywords": [
    "liferay-theme"
  ],
  "liferayTheme": {
    "baseTheme": "styled",
    "hookModules": ["liferay-theme-es2015-hook"],
    "rubySass": false,
    "templateLanguage": "ftl",
    "version": "7.0"
  },
  "devDependencies": {
    "gulp": "^3.8.10",
    "liferay-theme-tasks": "*",
    "liferay-theme-deps-7.0": "*"
  },
  "dependencies": {
    "liferay-theme-es2015-hook": "^1.0.0"
  }
}

```

## Build

Now that the hook is installed, it will run with every `gulp build` and `gulp:deploy`.

To flag a file for es2015 transpilation and amd configuration you must simply use `.es.js` as the file extension. Files with just `.js` won't be transpiled.

### Example

```es2015
// my-liferay-theme/src/js/my_component.es.js

class MyComponent {
	constructor() {
		console.log('Hello, World!');
	}
}

export default MyComponent;
```

After building, `my_component.es.js` will be transpiled and packaged as an AMD module. This module can be loaded and implemented in your theme's `main.js` file.

```javascript
// my-liferay-theme/src/js/main.js

require(
	'my-liferay-theme/js/my_component.es',
	function(MyComponent) {
		new MyComponent.default();
	}
);
```
