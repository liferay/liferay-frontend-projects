# liferay-npm-bundler-plugin-replace-browser-modules

> Replace modules listed under `browser` section of `package.json` files.

## Details

This plugin scans `package.json` for a browser entry and copies browser modules
on top of server modules or deletes them when set to `false`.

Please read the 
[`browser` field specification](https://github.com/defunctzombie/package-browser-field-spec) 
for more information.

## Installation

```
npm install --save-dev liferay-npm-bundler-plugin-replace-browser-modules
```

## Usage

Add the following to your `.npmbundlerrc` file:

```
{
    "*": {
		"plugins": [
			"replace-browser-modules"
		]
	}
}
```