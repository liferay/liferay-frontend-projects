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

Add `--soy` to build soy templates

```sh
liferay-npm-scripts build --soy
```

Add `--bundler` for bundling

```sh
liferay-npm-scripts build --bundler
```

Add `--bridge` to use `liferay-npm-bridge-generator`

```sh
liferay-npm-scripts build --bridge
```

If you use this flag, You will need to follow the configuration options seen [here](https://github.com/liferay/liferay-npm-build-tools/wiki/How-to-use-liferay-npm-bridge-generator).

### lint

```sh
liferay-npm-scripts lint
```

Lint calls `check-source-formatting` for the globs specified in [liferay-npm-scripts](./src/config/liferay-npm-scripts.json#L14-L20).

### format

```sh
liferay-npm-scripts format
```

Format calls `check-source-formatting` with the `--inline-edit` flag for the globs specified in [liferay-npm-scripts](./src/config/liferay-npm-scripts.json#L7-L13).

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
