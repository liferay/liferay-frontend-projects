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

## Gulp tasks

Once the generator is done creating your theme, there are multiple gulp tasks available to expedite theme development. These tasks can be used from the theme directory using the following format.

```
gulp <task>
```

Available tasks:

* [deploy](#deploy)
* [watch](#watch)

### Deploy

```
gulp deploy
```

The deploy task generates the base theme files, compiles sass into css, zips theme files into a .war file, and deploys to the defined appserver.

### Watch

```
gulp watch
```

The watch task allows you to see the changes you make to your theme without a full redeploy.

After invoking the watch task, every time you save any changes to a file in your theme it compiles (if applicable) and copies it directly to your appserver.

MIT