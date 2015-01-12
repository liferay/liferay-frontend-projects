var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var async = require('async');
var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');

var util = require('util');

plugins.storage(gulp);

var store = gulp.storage;

store.create('LiferayTheme', 'liferay-theme.json');


gulp.task(
	'init',
	function() {
		var cwd = process.cwd();

		var appServerPathDefault = store.get('appServerPath') || path.join(path.dirname(cwd), 'tomcat');

		return gulp.src('', {read: false})
				.pipe(
					plugins.prompt.prompt(
						[
							{
								name: 'appServerPath',
								type: 'input',
								message: 'Enter the path to your app server directory:',
								default: appServerPathDefault,
								validate: function(appServerPath) {
									var retVal = false;

									if (appServerPath) {
										retVal = true;

										if (!fs.existsSync(appServerPath)) {
											retVal = '"%s" does not exist';
										}
										else if (!fs.statSync(appServerPath).isDirectory()) {
											retVal = '"%s" is not a directory';
										}
										else {
											var baseName = path.basename(appServerPath);

											if (baseName == 'webapps') {
												appServerPath = path.dirname(appServerPath);
											}

											var webappsPath = path.join(appServerPath, 'webapps');

											if (!fs.existsSync(webappsPath) || !fs.statSync(webappsPath).isDirectory()) {
												retVal = '"%s" doesnt appear to be an app server directory';
											}
										}
									}

									if (_.isString(retVal)) {
										retVal = util.format(retVal, appServerPath);
									}

									return retVal;
								}
							},
							{
								name: 'deployPath',
								type: 'input',
								message: 'Enter in your deploy directory:',
								when: function(answers) {
									var appServerPath = answers.appServerPath;
									var deployPath = path.resolve(path.join(appServerPath, '../deploy'));

									var done = this.async();

									fs.stat(deployPath, function(err, stats) {
										var ask = err || !stats.isDirectory();

										if (!ask) {
											answers.deployPath = deployPath;
										}

										done(ask);
									});
								}
							},
							{
								name: 'deployType',
								type: 'list',
								choices: [
									{
										name: 'Copy the changed files directly (faster - recommended)',
										value: 'fast'
									},
									{
										name: 'Do a full theme redeploy',
										value: 'full'
									}
								],
								message: 'When watching the files, how do you want to deploy the changes?'
							}
						],
						function(answers) {
							store.store(answers);
						}
					)
				);
	}
);

gulp.task('watch', function() {
  gulp.watch('src/**', ['build']);
  // gulp.watch(paths.partialsSource, ['updateEntryPointCSS']);
});

gulp.task('build', ['build-base', 'build-src', 'compile-scss', 'deploy-lazily']);

var pathBuild = './build';

gulp.task(
	'build-base',
	function() {
		gulp.src(
			[
				'./node_modules/liferay-theme-unstyled/src/**/*',
				'./node_modules/liferay-theme-styled/src/**/*'
			]
		).pipe(gulp.dest(pathBuild));
	}
);

gulp.task(
	'build-src',
	function() {
		gulp.src('./src/**/*').pipe(gulp.dest(pathBuild));
	}
);

gulp.task(
	'compile-scss',
	function() {
		var includePaths = [
			'./node_modules/liferay-theme-mixins/src',
			'./node_modules/liferay-theme-mixins/src/liferay'
		];

		<% if (supportCompass) { %>
		var config = {
			compass: true,
			loadPath: includePaths
		};

		var sass = plugins.rubySass;

		<% } else { %>
		var config = {
			includePaths: includePaths
		};

		var sass = plugins.sass;
		<% } %>

		gulp.src(pathBuild + '/css/**/*.*css')
		.pipe(plugins.plumber())
		.pipe(sass(config))
		.pipe(plugins.plumber.stop())
		.pipe(gulp.dest(pathBuild + '/css2'));
	}
);

gulp.task(
	'deploy-lazily',
	function() {

	}
);


// require('gulp-storage')(gulp);