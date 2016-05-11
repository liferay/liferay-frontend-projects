# Liferay Theme Tasks [![Build Status](https://travis-ci.org/liferay/liferay-theme-tasks.svg?branch=master)](https://travis-ci.org/liferay/liferay-theme-tasks)

> The liferay-theme-tasks module is intended for use with the yeoman generator for [Liferay themes](https://github.com/natecavanaugh/generator-liferay-theme).

## Available tasks

* [build](#build)
* [deploy](#deploy)
* [extend](#extend)
* [kickstart](#kickstart)
* [status](#status)
* [watch](#watch)
* [init](#init)

### Build

```
gulp build
```
The `build` task generates the base theme files, compiles sass into css, and zips all theme files into a .war file, ready to be deployed to a Liferay server.

### Deploy

```
gulp deploy
```

The deploy initially runs the `build` task, and once the .war file has been created it deploys to the specified local appserver.

If you want to deploy to a live site, use the `--live` flag to deploy to a remote server.

```
gulp deploy --live
```

Note that the specified server must have the [server-manager-web](https://github.com/liferay/liferay-plugins/tree/master/webs/server-manager-web) plugin deployed. The `--live` flag will deploy to the remote server specified in the [init](#init) task.

If you want to deploy to a different server without changing the default server specified in [init](#init), you may use the `--url` flag.

```
gulp deploy --live --url http://some-host.com
```
You may also specify your login credentials using the `-u`/`--username` and `-p`/`--password` flags.

```
gulp deploy --live -u test@liferay.com -p test
```

### Extend

```
gulp extend
```

The `extend` task is what allows you to specify what base theme you are extending from. By default, themes created with the [theme generator](https://github.com/natecavanaugh/generator-liferay-theme) will base off the [styled theme](https://www.npmjs.com/package/liferay-frontend-theme-styled).

You first are prompted if you want to extend a Base theme or Themelet, then you will be prompted for where you would like to search for modules. `Globally installed npm modules` will search npm modules that have been installed on your computer with the `-g` flag. Selecting `npm registry` will search for published modules on npm.

Once it gives you the options and you make your selection, it will add any selected modules to your package.json under dependencies and run `npm install`.

### Kickstart

```
gulp kickstart
```

The `kickstart` task allows you to copy the css, images, js, and templates from another theme into the src directory of your own. This allows you to quickly get up and running with a production ready theme.

`kickstart` is similar to `extend`. The difference is that kickstarting from another theme is a one time inheritance, while extending from another theme is a dynamic inheritance that applies your src files on top of the base theme on every build.

### Status

```
gulp status
```
Displays what base theme/themelets your theme is extending.

### Watch

```
gulp watch
```

The watch task allows you to see the changes you make to your theme without a full redeploy.

After invoking the watch task, every time you save any changes to a file in your theme it compiles (if applicable) and copies it directly to your appserver.

### Init

```
gulp init
```
Prompts user for local and remote appserver information used for deployment purposes (see [deploy](#deploy) task).

## API

### registerTasks

To register the liferay-theme-tasks you must call the `registerTasks` method in your theme's gulpfile.js, `gulp` being the only required parameter.

```js
var gulp = require('gulp');
var liferayThemeTasks = require('liferay-theme-tasks');

liferayThemeTasks.registerTasks({
	gulp: gulp
});
```

#### Options

##### gulp

type: `gulp instance`<br>
required: `true`

A gulp instance for exposing liferay-theme-tasks.

##### hookFn

type: `function`

Allows theme developers to hook and overwrite tasks/sub tasks.

```js
var gulp = require('gulp');
var liferayThemeTasks = require('liferay-theme-tasks');

liferayThemeTasks.registerTasks({
	gulp: gulp,
	hookFn: function(gulp) {
		gulp.hook('before:build:src', function(done) {
			// Fires before build:src task
		});

		gulp.hook('after:build', function(done) {
			// Fires after build task
		});

		gulp.task('build:base', function(done) {
			// Overwrites build:base task
		});
	}
});
```
Note: `hook` callback function must invoke `done` argument OR return a stream.

##### pathBuild

type: `string`<br>
default: `./build`

Determines the destination of built files.

##### pathDist

type: `string`<br>
default: `./dist`

Determines the destination of the generated .war file.

##### pathSrc

type: `string`<br>
default: `./src`

Determines where theme source files are located. If set to anything other than default value, you must manually relocate all files in src directory to new location.

##### sassOptions

type: `object`

Whatever properties are set in sassOptions get passed to either [gulp-sass](https://www.npmjs.com/package/gulp-sass#options) or [gulp-ruby-sass](https://www.npmjs.com/package/gulp-ruby-sass#options) depending on what sass compiler is implemented.


MIT