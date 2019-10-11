# liferay-npm-bundler-plugin-replace-browser-modules

> Replace modules listed under `browser`/`unpkg`/`jsdelivr` section of
> `package.json` files.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-plugin-replace-browser-modules
```

## Usage

Add the following to your `.npmbundlerrc` file:

```json
{
	"*": {
		"plugins": ["replace-browser-modules"]
	}
}
```

## Configuration

The plugin can be configured using
[.npmbundlerrc global config section](https://github.com/liferay/liferay-js-toolkit/wiki/.npmbundlerrc-file-reference#config)
or in the plugin configuration itself.

In both cases the structure is the same:

```json
{
	"resolve": {
		"aliasFields": ["browser"]
	}
}
```

This resembles webpack's
[resolve.aliasFields](https://webpack.js.org/configuration/resolve/#resolvealiasfields)
which serves the same purpose.

Normally global config is preferred, but you can leverage plugin configuration
when you need different alias fields for different packages.

The default value for `resolve.aliasFields` is `['browser']` as in webpack.

Note that this plugin used to look for `unpkg` and `jsdelivr` fields too, but it
caused problems (see https://github.com/liferay/liferay-js-toolkit/issues/365
for more information).

## Technical Details

This plugin scans `package.json` for fields defined in `resolve.aliasFields`
and copies browser modules on top of server modules or deletes them when set to
`false`.

Please read the
[`browser` field specification](https://github.com/defunctzombie/package-browser-field-spec)
for more information.
