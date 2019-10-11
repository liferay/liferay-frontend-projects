# liferay-npm-bundler-plugin-replace-browser-modules

> Rewrite aliased modules (those under `browser` section or any other
> configured alias field of `package.json` files) to that they reexport their
> targets.

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
and redirects aliased modules to their configured target or empties them when
set to `false`.

This plugin only does one part of the whole implementation of the aliases.
Aliases implementation have two parts:

1.  They redirect existing modules or provide virtual ones when seen from
    the outside, from another package.

2.  They make local requires divert to a different target.

This plugin does only the 1st part. The second one is performed by
[babel-plugin-alias-modules](https://github.com/liferay/liferay-js-toolkit/tree/master/packages/babel-plugin-alias-modules).

Please read the
[`browser` field specification](https://github.com/defunctzombie/package-browser-field-spec)
for more information.
