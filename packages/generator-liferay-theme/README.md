# Liferay Theme Generator

**Note: the Liferay theme generator is still in development and is not guaranteed to work on all platforms/environments.**

> Liferay theme generator allows you to generate new themes to be used with Liferay Portal, and supplies you with the necessary tools to deploy and make quick modifications to your theme.

## Dependencies

1. Install [Node.JS](http://nodejs.org/), if you don't have it yet.

Note: the Liferay theme generator requires Node version 0.10.x or 0.12.x, due to issues with [node-sass](https://www.npmjs.com/package/node-sass) the generator will not currently work with Node 0.11.x.

2. run `<sudo> npm install -g yo gulp` to install global dependencies.

## Generator use

1. Install generator: `<sudo> npm install -g generator-liferay-theme`

2. Run `yo liferay-theme` to start theme generator and follow prompts to name and configure your theme.

Note: the generator will create a new folder in your current directory that will house your theme.

## Generators

Available generators:

* [liferay-theme](#create)
* [liferay-theme:import](#import)
* [liferay-theme:import](#themelet)

### Create

```
yo liferay-theme
```

The default `liferay-theme` generator creates a new theme that inherits styles from [liferay-theme-styled](https://www.npmjs.com/package/liferay-theme-styled) or [liferay-theme-unstyled](https://www.npmjs.com/package/liferay-theme-unstyled).


### Import

```
yo liferay-theme:import
```

The `liferay-theme:import` generator enables you to import pre-existing Liferay themes from the SDK.

### Themelet

```
yo liferay-theme:themelet
```

The `liferay-theme:themelet` generator enables you to create theme fragments called `themelets`.

The advantage of themelets is that reused code/components that often exist in multiple themes can be abstracted and easily reused in all of your themes.


## Gulp tasks

Once the generator is done creating your theme, there are multiple gulp tasks available to expedite theme development. See [liferay-theme-tasks](https://github.com/Robert-Frampton/liferay-theme-tasks) for more detail.

MIT