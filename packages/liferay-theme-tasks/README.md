# Liferay Theme Tasks

> The liferay-theme-tasks module is inteded for use with the yeoman generator for [Liferay themes](https://github.com/natecavanaugh/generator-liferay-theme).

## Available tasks:

* [build](#build)
* [deploy](#deploy)
* [extend](#extend)
* [watch](#watch)

### Build

```
gulp build
```
The `build` task generates the base theme files, compiles sass into css, and zips all theme files into a .war file, ready to be deployed to a Liferay server.

### Deploy

```
gulp deploy
```

The deploy initally runs the `build` task, and once the .war file has been created it deploys to the specified appserver.

### Extend

```
gulp extend
```

The `extend` task is what allows you to specify what base theme you are extending from. By default, themes created with the [theme generator](https://github.com/natecavanaugh/generator-liferay-theme) will base off the [styled theme](https://github.com/natecavanaugh/liferay-theme-styled).

You first are prompted if you want to extend a Base theme or Themelet, then you will be prompted for where you would like to search for modules. `Globally installed npm modules` will search npm modules that have been installed on your computer with the `-g` flag. Selecting `npm registry` will search for published modules on npm.

Once it gives you the options and you make your selection, it will add any selected modules to your package.json under dependencies and run `npm install`.

### Watch

```
gulp watch
```

The watch task allows you to see the changes you make to your theme without a full redeploy.

After invoking the watch task, every time you save any changes to a file in your theme it compiles (if applicable) and copies it directly to your appserver.

MIT