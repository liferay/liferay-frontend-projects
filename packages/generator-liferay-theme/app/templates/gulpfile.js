var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var async = require('async');
var del = require('del');
var fs = require('fs-extra');
var gulp = require('gulp');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var util = require('util');

plugins.storage(gulp);

var store = gulp.storage;

store.create('LiferayTheme', 'liferay-theme.json');

var pathBuild = './build';

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
			cb
		);
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
	'build-clean',
	function(cb) {
		del([pathBuild], cb);
	}
);

gulp.task(
	'build-src',
	function() {
		return gulp.src('./src/**/*')
			//.pipe(plugins.changed(pathBuild))
			.pipe(gulp.dest(pathBuild));
	}
);

gulp.task(
	'build-styled',
	function() {
		return gulp.src('./node_modules/liferay-theme-styled/src/**/*').pipe(gulp.dest(pathBuild));
	}
);

gulp.task(
	'build-unstyled',
	function() {
		return gulp.src('./node_modules/liferay-theme-unstyled/src/**/*').pipe(gulp.dest(pathBuild));
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
	'deploy',
	function(cb) {
		if (!argv.full && store.get('deployed')) {
			runSequence(
				'build-src',
				'rename-css-dir',
				'compile-scss',
				'remove-old-css-dir',
				'deploy-fast',
				cb
			);
		}
		else {
			runSequence(
				'build',
				'deploy-full',
				cb
			);
		}
	}
);

gulp.task(
	'deploy-fast',
	function() {
		var dest = store.get('appServerPath');

		var tempDirPath = path.join(dest, '../../temp/');

		var tempThemeDir;

		if (fs.existsSync(tempDirPath) && fs.statSync(tempDirPath).isDirectory()) {
			var themeName = store.get('themeName');

			var tempDir = fs.readdirSync(tempDirPath);

			tempThemeDir = _.find(
				tempDir,
				function(fileName) {
					return fileName.indexOf(themeName) > -1;
				}
			);
		}

		var stream = gulp.src(pathBuild + '/**/*')
			.pipe(plugins.changed(dest))
			.pipe(gulp.dest(dest));

		if (tempThemeDir) {
			stream.pipe(gulp.dest(path.join(tempDirPath, tempThemeDir)));
		}

		return stream;
	}
);

gulp.task(
	'deploy-full',
	function () {
		var themeName = store.get('themeName');

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

gulp.task(
	'remove-old-css-dir',
	function(cb) {
		del([pathBuild + '/_css'], cb);
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
	'watch',
	function() {
		gulp.watch('src/**/*', ['deploy']);
		//gulp.watch(paths.partialsSource, ['updateEntryPointCSS']);
	}
);

// require('gulp-storage')(gulp);