# liferay-npm-bundler-plugin-inject-angular-dependencies

> Inject some peer dependencies which are needed to make Angular work.

## Installation

```
npm install --save-dev liferay-npm-bundler-plugin-inject-angular-dependencies
```

## Usage

Add the following to your `.npmbundlerrc` file:

```
{
    "*": {
		"plugins": [
			"inject-angular-dependencies"
		]
	}
}
```

## Technical Details

This plugin injects a dependency on `rxjs` in `@angular/forms` package. This is
needed for Angular to work correctly under Liferay Portal npm architecture.

To determine the version of `rxjs` to use, the plugin scans the parent directory
of `@angular/forms` for the `rxjs` package.

You can find more information about what happens with `rxjs` and 
`@angular/forms` in 
[this issue](https://github.com/angular/angular/issues/17917).