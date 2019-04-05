# liferay-npm-scripts

## Usage

```sh
npm install --save-dev liferay-npm-scripts
```

`package.json`

```json
{
	"scripts": {
		"build": "liferay-npm-scripts build",
		"eject": "liferay-npm-scripts eject"
	}
}
```

## Scripts Available

### build

Build script that compiles all necessary javascript, soy, and bundles it together using `liferay-npm-bundler`.

```sh
liferay-npm-scripts build
```

Do you have soy dependencies? `build` should automatically detect them.

Do you need to use `liferay-npm-bridge-generator`? Just add a `.npmbridgerc` file and follow the configuration options [here](https://github.com/liferay/liferay-npm-build-tools/wiki/How-to-use-liferay-npm-bridge-generator).

### lint

```sh
liferay-npm-scripts lint
```

Lint calls `check-source-formatting` for the globs specified in [liferay-npm-scripts](./src/config/liferay-npm-scripts.json#L14-L20).

### format

```sh
liferay-npm-scripts format
```

Format calls `check-source-formatting` with the `--inline-edit` flag for the globs specified in your `.liferaynpmscriptsrc` configuration. Or defaults seen [here](./src/config/liferay-npm-scripts.json#L7-L13).

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

### eject

**Note: this is a one-way operation. Once you eject, you can't go back.**

```sh
liferay-npm-scripts eject
```

Eject will remove `liferay-npm-scripts` as a dependency and write all of the necessary configuration files and replace npm scripts. To see the before and after, check out the [example](./example/eject).

## Config

If you need to add additional configuration you can do so by creating a `.liferaynpmscriptsrc` file at the root of your project. The default configuration of this file can be seen [here](./src/config/liferay-npm-scripts.json).

### Other Config

If you need more flexibility over babel or the bundler. You can still add a `.babelrc` or `.npmbundlerrc` which will be merged with the default settings this tool provides. [Default Babel Config](./src/config/babel.json), [Default Bundler Config](./src/config/npm-bundler.json)

For more control over `lint` and `format`, follow the configuration options [here](https://github.com/liferay/liferay-frontend-source-formatter#custom-configuration)

Want to use a different `NODE_ENV`? Try doing something like

```sh
NODE_ENV=development liferay-npm-scripts build
```
