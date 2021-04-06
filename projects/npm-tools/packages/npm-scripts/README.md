# @liferay/npm-scripts

`@liferay/npm-scripts` is our principal abstraction for building, formatting, linting, and testing frontend code in [liferay-portal](https://github.com/liferay/liferay-portal). It provides:

-   **A simplified interface:** The `liferay-npm-scripts` command-line implements a small number of subcommands such as `build`, `checkFormat` and `test`, most of which don't require any arguments and do the right thing "out-of-the-box", automatically.
-   **Industry-standard dependencies:** `@liferay/npm-scripts` brings a set of well-tested and robust dependencies including Babel, ESLint, Jest, Prettier, and others, ensuring that people working anywhere in a Liferay project have access to a single, consistent set of tools.
-   **Reasonable default configuration:** All of the bundled tools come with configurations that have been tuned to work in a Liferay environment, and can be overridden via standard configuration files (eg. `.eslintrc.js` etc) on the rare occasions that it is necessary to do so.

While `@liferay/npm-scripts` was designed with liferay-portal in mind, it is also used in other projects such as [liferay-learn](https://github.com/liferay/liferay-learn); see [this issue](https://github.com/liferay/liferay-frontend-projects/issues/91) for context.

## Usage

```sh
npm install --save-dev @liferay/npm-scripts
```

`package.json`

```json
{
	"scripts": {
		"build": "liferay-npm-scripts build"
	}
}
```

## Scripts Available

### build

Build script that compiles all necessary JavaScript, soy, and bundles it together using `liferay-npm-bundler`.

```sh
liferay-npm-scripts build
```

Do you have soy dependencies? `build` should automatically detect them.

Do you need to use `liferay-npm-bridge-generator`? Just add a `.npmbridgerc` file and follow the configuration options [here](https://github.com/liferay/liferay-npm-build-tools/wiki/How-to-use-liferay-npm-bridge-generator).

### check

```sh
liferay-npm-scripts check
```

`check` runs [ESLint](https://eslint.org/) to catch semantic problems in JS (equivalent to running `eslint` without the `--fix` option), [stylelint](https://stylelint.io/) to catch problems in SCSS files, and [Prettier](https://prettier.io/) to catch formatting issues (equivalent to running `prettier` with the `--check` flag), for the globs specified in your `npmscripts.config.js` configuration (or, in the absence of explicit configuration, in [the default preset](./src/presets/standard/index.js#L25-L32)).

This is the task that runs in liferay-portal projects when you run `yarn checkFormat`.

### fix

```sh
liferay-npm-scripts fix
```

`fix` runs [ESLint](https://eslint.org/) and [stylelint](https://stylelint.io/) to identify and fix autofixable issues in JS and SCSS, and [Prettier](https://prettier.io/) to enforce formatting (equivalent to calling `prettier` with the `--write` flag) for the globs specified in your `npmscripts.config.js` configuration (or, in the absence of explicit configuration, in [the default preset](./src/presets/standard/index.js#L17-L24)).

This is the task that runs in liferay-portal projects when you run `yarn format` (or `gradlew formatSource -a`, or `ant format-source`).

### prettier

```sh
liferay-npm-scripts prettier
```

When @liferay/npm-scripts uses Prettier, it additionally applies some tweaks in a post-processing step to match liferay-portal coding conventions. Normally, you will want to run `liferay-npm-scripts check` or `liferay-npm-scripts fix` as described above rather than interacting with the `prettier` executable directly.

However, in order to facilitate integration with editors and editor plugins, this subcommand exposes the augmented version of `prettier`, providing this "Prettier plus post-processing" functionality, using an interface that is similar to that of the `prettier` executable. Example usage:

```sh
liferay-npm-scripts prettier --write src/someFileToFormat.js 'test/**/*.js'
```

Supported flags:

-   `--stdin-filepath=FILEPATH`
-   `--stdin`
-   `--write`

All other `prettier` flags are ignored.

#### Editor integrations

##### Vim

One way to run prettier from Vim is with [the vim-prettier plugin](https://github.com/prettier/vim-prettier). It comes with a setting, `g:prettier#exec_cmd_path`, that you can use to configure a custom `prettier` executable. For example, you could take [this sample shell script](./contrib/prettier/prettier.sh) and copy it somewhere such as `~/bin/`:

```sh
curl https://raw.githubusercontent.com/liferay/liferay-frontend-projects/master/projects/npm-tools/packages/npm-scripts/contrib/prettier/prettier.sh > ~/bin/prettier.sh
chmod +x !$
```

Then, add a line like this to your `~/.vim/vimrc`:

```
let g:prettier#exec_cmd_path = "~/bin/prettier.sh"
```

Now you can use the `:Prettier` command and others provided by the vim-prettier plugin in Vim, and it will use your script instead of the upstream version of Prettier. The script tries first to find the `@liferay/npm-scripts` version, then `prettier`, and ultimately will fall back to `npx prettier` as a last resort. When working outside of a liferay-portal clone, it doesn't try to use the version provided by `@liferay/npm-scripts`.

If you don't want to install vim-prettier, you can of course run the script directly using the `!` command:

```
!~/bin/prettier.sh --write %
```

Or, if the script is in your path:

```
!prettier.sh --write %
```

And you can always call directly into `liferay-npm-scripts` if you prefer:

```
!path/to/liferay-npm-scripts prettier --write %
```

#### Visual Studio Code

A popular choice for running prettier from VSCode is the "[Prettier - Code Formatter](https://github.com/prettier/prettier-vscode)" extension.

You can take [this sample wrapper module](./contrib/prettier/prettier.js) and configure the extension to use it instead of the standard `prettier` one. For example, to install a copy of the wrapper to `~/bin/prettier.js`, you could run the following:

```sh
curl https://raw.githubusercontent.com/liferay/liferay-frontend-projects/master/projects/npm-tools/packages/npm-scripts/contrib/prettier/prettier.js > ~/bin/prettier.js
```

If you have the script at `~/bin/prettier.js`, in the UI you would go to `Preferences` → `Settings` → `User` → `Extensions` → `Prettier` → `Prettier Path` and set it to `~/bin/prettier.js`. Alternatively, if you prefer to manipulate the VSCode `settings.json` file directly, you would set `prettier.prettierPath` to `~/bin/prettier.js`.

**Note:** You will have to restart VSCode for this change to actually take effect.

The wrapper script attempts to detect when you are working in a liferay-portal checkout and uses the customized Prettier formatting in that case; otherwise, it falls back to the standard behavior.

### test

```sh
liferay-npm-scripts test
```

Runs `jest` with a default configuration specified in [jest.json](./src/config/jest.json). You can override or add any additional configuration by following jest documentaion.

Additionally if you want to use any flags for jest, such as `--watch` you can do so.

For example

```sh
liferay-npm-scripts test --watch
```

### theme

```sh
liferay-npm-scripts theme TASK
```

Inside a theme directory, runs one of the [available Gulp tasks](https://github.com/liferay/liferay-js-themes-toolkit/tree/master/packages/liferay-theme-tasks#available-tasks), `TASK`, from [liferay-theme-tasks](https://github.com/liferay/liferay-js-themes-toolkit/tree/master/packages/liferay-theme-tasks), automatically passing settings for use inside [liferay-portal](https://github.com/liferay/liferay-portal).

For example:

```sh
liferay-npm-scripts theme build
```

Runs the "build" task, providing it with the configuration it needs to find core dependencies such as the [`liferay-frontend-theme-styled` base theme files](https://github.com/liferay/liferay-portal/tree/master/modules/apps/frontend-theme/frontend-theme-styled/src/main/resources/META-INF/resources/_styled).

### types

```sh
liferay-npm-scripts types
```

Freshens all TypeScript type definition files in a `liferay-portal` checkout. Normally, these artifacts (`.d.ts` and `tsconfig.tsbuildinfo` files) would be committed along with changes to the corresponding module, but this command exists as a convenience for doing a global refresh across the entire repo (which would otherwise be tedious to do by hand because the projects must be built in dependency order).

## Config

> Note: as of v2.x the config file was renamed from `.liferaynpmscriptsrc` to `npmscripts.config.js`

If you need to add additional configuration you can do so by creating a `npmscripts.config.js` file at the root of your project. The default configuration of this file can be seen [here](./src/config/npmscripts.config.js).

### `preset`

`npmscripts.config.js` allows for a `preset` option which is a pre-defined configuration. By default `@liferay/npm-scripts` uses its own bundled ["preset-standard"](src/presets/standard/index). If you want to create your own preset, you need to create an npm package or a local dependency. You can also extend from a preset by creating a `npmscripts.config.js` that looks something like...

```js
module.exports = {
	preset: 'path/to/some/dependency',
};

// or npm package (this needs to also be specified in your package.json)

module.exports = {
	preset: 'my-cool-preset',
};
```

If you want to extend from the standard preset and then add an additional dependency, you will have to do something like...

```js
const standardPreset = require('@liferay/npm-scripts/src/presets/standard/index');

module.exports = {
	preset: '@liferay/npm-scripts/src/presets/standard/index',
	build: {
		dependencies: [...standardPreset.build.dependencies, 'asset-taglib'],
	},
};
```

If you just set dependencies to be `['my-new-dependency']`, it will override the existing dependencies from the `standard` preset.

### Other Config

If you need more flexibility over Babel or the bundler. You can still add a `.babelrc.js` or `.npmbundlerrc` which will be merged with the default settings this tool provides. [Default Babel Config](./src/config/babel.json), [Default Bundler Config](./src/config/npm-bundler.json)

Want to use a different `NODE_ENV`? Try doing something like

```sh
NODE_ENV=development liferay-npm-scripts build
```

## Appendix: stylelint rules

The [shared stylelint configuration](./src/config/stylelint.json) lists the rules that are activated from among [the bundled rules](https://stylelint.io/user-guide/rules/list) in addition to the following custom rules that we've developed:

-   [`liferay/no-block-comments`](./test/scripts/lint/stylelint/plugins/no-block-comments.js): Disallows block-style comments (`/* ... */`).
-   [`liferay/no-import-extension`](./test/scripts/lint/stylelint/plugins/no-import-extension.js): Disallows the use of an explicit ".scss" extension in Sass `@import` statements.
-   [`liferay/single-imports`](./test/scripts/lint/stylelint/plugins/single-imports.js): Requires one `@import` statement per imported resource.
-   [`liferay/sort-imports`](./test/scripts/lint/stylelint/plugins/sort-imports.js): Requires `@import` statements to be alphabetically sorted (separate groups of imports with a blank line to force manual ordering).
-   [`liferay/trim-comments`](./test/scripts/lint/stylelint/plugins/trim-comments.js): Trims leading and trailing blank lines from comments.
