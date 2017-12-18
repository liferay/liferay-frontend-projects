# liferay-npm-bundler-plugin-inject-angular-dependencies

> Inject some peer dependencies which are needed to make Angular work.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-plugin-inject-angular-dependencies
```

## Usage

Add the following to your `.npmbundlerrc` file:

**Without options:**
```json
{
	"*": {
		"plugins": ["inject-angular-dependencies"]
	}
}
```

**With options:**
```json
{
	"*": {
		"plugins": [
			["inject-angular-dependencies", {
				"dependenciesMap": {
					"@angular/forms": ["rxjs"]
				}
			}]
		]
	}
}
```

> Note that the options syntax is intended to be used to bypass errors while a
> final fix is released and its use is discouraged except for temporary
> workarounds. Do not use the options syntax unless you really know what you are
> doing.

## Technical Details

This plugin injects dependencies in some Angular packages. This is needed for
Angular to work correctly under Liferay Portal npm architecture.

To determine the version of the dependencies to inject, the plugin scans the
node_modules directory of the output folder for the injected packages and
determines the needed version from that.

You can find more information about what happens with `rxjs` and
`@angular/forms` (an example of a injected dependency) in
[this issue](https://github.com/angular/angular/issues/17917).

In general, we need this plugin to honor `peerDependencies` because they are not
yet fully supported.
