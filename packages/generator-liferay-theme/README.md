# Liferay Theme Generator [![Build Status](https://travis-ci.org/liferay/generator-liferay-theme.svg?branch=master)](https://travis-ci.org/liferay/generator-liferay-theme) [![Coverage Status](https://coveralls.io/repos/github/liferay/generator-liferay-theme/badge.svg?branch=master)](https://coveralls.io/github/liferay/generator-liferay-theme?branch=master)

**Note: the Liferay theme generator is still in development and is not guaranteed to work on all platforms/environments.**

> Liferay theme generator allows you to generate new themes to be used with Liferay Portal, and supplies you with the necessary tools to deploy and make quick modifications to your theme.

## Dependencies

1. Install [Node.JS](http://nodejs.org/), if you don't have it yet.
2. Run `<sudo> npm install -g yo` to install global dependencies.

## Generator use

1. Install generator: `<sudo> npm install -g generator-liferay-theme`
2. Run `yo liferay-theme` to start theme generator and follow prompts to name and configure your theme.

Note: the generator will create a new folder in your current directory that will house your theme.

### Usage on Windows

Some additional steps may be required when using the generator on Windows. We use [node-sass](https://www.npmjs.com/package/node-sass), which requires node-gyp to run, and node-gyp requires Python to be installed. You can read more at the following link:<br>
[node-gyp Installation](https://github.com/nodejs/node-gyp#installation)<br>

## Generators

Available generators:

-   [liferay-theme](#create)
-   [liferay-theme:layout](#layout)
-   [liferay-theme:themelet](#themelet)

### Create

```
yo liferay-theme
```

The default `liferay-theme` generator creates a new theme that inherits styles from [liferay-theme-styled](https://www.npmjs.com/package/liferay-theme-styled) or [liferay-theme-unstyled](https://www.npmjs.com/package/liferay-theme-unstyled).

### Layout

```
yo liferay-theme:layout
```

The `liferay-theme:layout` generator creates a layout template.

If you run the generator from the root directory of a theme (created with `yo liferay-theme`) it will add the layout template as a part of the theme in `src/layouttpl`.

### Themelet

```
yo liferay-theme:themelet
```

The `liferay-theme:themelet` generator enables you to create theme fragments called `themelets`.

The advantage of themelets is that reused code/components that often exist in multiple themes can be abstracted and easily reused in all of your themes.

## Gulp tasks

Once the generator is done creating your theme, there are multiple gulp tasks available to expedite theme development. See [liferay-theme-tasks](https://github.com/liferay/liferay-theme-tasks) for more detail.

## Development

To test an unpublished change to the generator:

```sh
# Test the main theme generator:
yo ./packages/generator-liferay-theme

# Test the layout generator:
yo ./packages/generator-liferay-theme/generators/layout/index.js

# Test the themelet generator:
yo ./packages/generator-liferay-theme/generators/themelet/index.js
```

MIT
