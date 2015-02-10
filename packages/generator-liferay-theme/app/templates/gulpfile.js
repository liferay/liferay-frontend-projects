var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var async = require('async');
var fs = require('fs-extra');
var gulp = require('gulp');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
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
						var appServerPath = answers.appServerPath;

						var baseName = path.basename(appServerPath);

						if (baseName != 'webapps') {
							appServerPath = path.join(appServerPath, 'webapps');
						}

						var themeName = path.basename(__dirname);

						appServerPath = path.join(appServerPath, themeName);

						answers = _.assign(
							answers,
							{
								appServerPath: appServerPath,
								deployed: false,
								themeName: themeName
							}
						);

						store.store(answers);
					}
				)
			);
	}
);

gulp.task('watch', function() {
	gulp.watch('src/**', ['deploy-lazily']);
	//gulp.watch(paths.partialsSource, ['updateEntryPointCSS']);
});

gulp.task(
	'build',
	function(cb) {
		runSequence(
			'build-clean',
			'build-unstyled',
			'build-styled',
			'build-src',
			'rename-css-dir',
			'compile-scss',
			'remove-old-css-dir',
			// 'deploy-lazily',
			cb
		);
	}
);

var pathBuild = './build';

gulp.task(
	'build-clean',
	function() {
		return gulp.src(pathBuild)
			// .pipe(plugins.debug())
			.pipe(plugins.clean({read: false}));
	}
);

gulp.task(
	'build-unstyled',
	function() {
		return gulp.src('./node_modules/liferay-theme-unstyled/src/**/*').pipe(gulp.dest(pathBuild));
	}
);

gulp.task(
	'build-styled',
	function() {
		return gulp.src('./node_modules/liferay-theme-styled/src/**/*').pipe(gulp.dest(pathBuild));
	}
);

gulp.task(
	'build-base',
	function() {
		return gulp.src(
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
		return gulp.src('./src/**/*')
			.pipe(plugins.changed(pathBuild))
			.pipe(gulp.dest(pathBuild));
	}
);

gulp.task(
	'rename-css-dir',
	function(cb) {
		fs.remove(
			pathBuild + '/_css',
			function(err) {
				fs.rename(
					pathBuild + '/css',
					pathBuild + '/_css',
					cb
				);
			}
		)
	}
);

gulp.task(
	'remove-old-css-dir',
	function() {
		return gulp.src(pathBuild + '/_css')
			// .pipe(plugins.debug())
			.pipe(plugins.clean({read: false}))
	}
);

gulp.task(
	'compile-scss',
	function(cb) {
		var includePaths = [
			'./node_modules/liferay-theme-mixins/src',
			'./node_modules/liferay-theme-mixins/src/liferay'
		];

		var sourcemap = false;

		<% if (supportCompass) { %>
		var config = {
			compass: true,
			loadPath: includePaths,
			sourcemap: sourcemap
		};

		var sass = plugins.rubySass;

		<% } else { %>
		var bourbon = require('node-bourbon');

		includePaths = includePaths.concat(bourbon.includePaths);

		var config = {
			includePaths: includePaths,
			sourceMap: sourcemap
		};

		var sass = plugins.sass;
		<% } %>

		var cssBuild = pathBuild + '/_css';

		return gulp.src(cssBuild + '/**/*.+(css|scss)')
			.pipe(
				plugins.rename(
					{
						extname: '.scss'
					}
				)
			)
			.pipe(plugins.plumber())
			.pipe(sass(config))
			// .pipe(plugins.plumber.stop())
			// .pipe(plugins.debug())
			.pipe(plugins.addSrc(cssBuild + '/**/*.!(css|scss)'))
			.pipe(gulp.dest(pathBuild + '/css'));
	}
);

gulp.task(
	'deploy-app-server',
	function() {
		var dest = store.get('appServerPath');

		return gulp.src(pathBuild + '/**/*')
			.pipe(plugins.changed(dest))
			.pipe(gulp.dest(dest));
	}
);

gulp.task(
	'deploy-lazily',
	function(cb) {
		if (!argv.full && store.get('deployed')) {
			runSequence(
				'build-src',
				'rename-css-dir',
				'compile-scss',
				'remove-old-css-dir',
				'deploy-app-server',
				cb
			);
		}
		else {
			runSequence(
				'deploy',
				cb
			);
		}
	}
);

gulp.task(
	'deploy',
	function () {
		var themeName = path.basename(__dirname);

		var stream = gulp.src(pathBuild + '/**/*')
			.pipe(
				plugins.war(
					{
						displayName: themeName
					}
				)
			)
			.pipe(plugins.zip(themeName + '.war'))
			.pipe(gulp.dest(store.get('deployPath')));

		if (!store.get('deployed')) {
			stream.on(
				'end',
				function() {
					store.set('deployed', true);
				}
			);
		}

		return stream;
	}
);

// require('gulp-storage')(gulp);