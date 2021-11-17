# liferay-npm-bundler Loader Specification

Since [#303](https://github.com/liferay/liferay-js-toolkit/issues/303) the
bundler supports [webpack like loaders](https://webpack.js.org/loaders/).

Though the mechanism is inspired in `webpack`, the differences between
`webpack`'s and Liferay bundler's models makes loaders' API incompatible so you
cannot reuse `webpack` loaders with our bundler or vice versa.

## What is a loader

A loader is a npm package that has a main module which exports just a default
function with the following signature:

```javascript
function(context, options) {
}
```

The first argument `context` is an object which contains the following fields:

- `content`: a string with the contents of the processed file (it can be
  considered the main input of the loader).
- `filePath`: the project-relative path of the file to which loader is being
  applied.
- `extraArtifacts`: an object with project-relative paths as keys and strings
  as values of properties which may be used to output extra files in addition
  to the one being processed (it can be useful to generate source maps, for
  example).
- `log`: a logger to dump execution information that will be written to the
  bundler's report file (see the
  [PluginLogger class](https://github.com/liferay/liferay-frontend-projects/blob/master/maintenance/projects/js-toolkit/packages/liferay-npm-build-tools-common/src/plugin-logger.ts)
  for information on its structure and API).

The second argument is an object which is directly taken from the `options`
field of the loader's configuration (see
[How to configure rules and loaders](../manuals/liferay-npm-bundler.md#How-to-configure-rules-and-loaders.md)
).

To finish with, the function may return nothing or a modified content. If
something is returned, it will be copied on top of the `context.content` field
and used to feed the next loader or write the final output file.

That means that returning 'something' or setting `context.content =
'something'` is fully equivalent.

However, there's one exotic case in which you cannot use the return syntax and
need to explicitly assign to `context.content`. That's when you want no file to
be generated at all. In that case you need to do `context.content = undefined`
because returning `undefined` cannot be distinguished from no return at all.
This in only useful if you want to make a loader that filters files preventing
them from being generated, for example.

## A loader example

So, let's say you want to write a loader that runs `babel` on `.js` files.

Because `babel` needs configuration, you may define that you want a rule
configuration like:

```json
{
	"rules": [
		{
			"test": "\\.js$",
			"exclude": "node_modules",
			"use": [
				{
					"loader": "babel-loader",
					"options": {
						"presets": ["env", "react"]
					}
				}
			]
		}
	]
}
```

So that you can specify `babel` options in the loader configuration.

Then, your loader will need to take the input `content`, pass it through
`babel` and write the result and the source map file to the output directory.

So, your loader function may look something like this:

```javascript
export default function (context, options) {
	// Get input parameters
	const {content, filePath, log, sourceMap} = context;

	// Run babel on content
	const result = babel.transform(content, options);

	// Create an extra .map file with source map next to source .js file
	context.extraArtifacts[`${filePath}.map`] = JSON.stringify(result.map);

	// Tell the user what we have done
	log.info('babel-loader', 'Transpiled file');

	// Return the modified content
	return result.code;
}
```

Then you can write that function to an `index.js` file, put it inside a npm
package and publish it so that you can then configure its name in the `rules`
section of the `.npmbundlerrc` file.
