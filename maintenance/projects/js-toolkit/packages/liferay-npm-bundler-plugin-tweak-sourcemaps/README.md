# liferay-npm-bundler-plugin-tweak-sourcemaps

> A liferay-npm-bundler plugin to tweak source maps after the build.

## Installation

```sh
npm install --save-dev liferay-npm-bundler-plugin-tweak-sourcemaps
```

## Usage

Add the following to your `.npmbundlerrc` file:

**Without options:**

```json
{
	"*": {
		"plugins": ["tweak-sourcemaps"]
	}
}
```

## Technical Details

This plugin rewrites the `sources` field of project's source maps (but not
those of third party dependencies) as explained in
[this issue](https://github.com/liferay/liferay-frontend-projects/issues/1010).
