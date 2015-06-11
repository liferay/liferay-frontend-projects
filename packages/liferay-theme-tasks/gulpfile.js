var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var async = require('async');
var CheckSourceFormattingCLI = require('./node_modules/check-source-formatting/lib/cli').constructor;
var del = require('del');
var fs = require('fs-extra');
var glob = require('glob');
var gulp = require('gulp');
var inquirer = require('inquirer');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var util = require('util');

plugins.storage(gulp);

var store = gulp.storage;

store.create('LiferayTheme', 'liferay-theme.json');

var changedFile;

var fullDeploy = (argv.full || argv.f);

var pathBuild = './build';

function getSrcPath(srcPath, validator) {
	var changed = (changedFile && (changedFile.type == 'changed'));
	var fastDeploy = (!fullDeploy && store.get('deployed'));

	if (changed && fastDeploy) {
		var changedFileName = path.basename(changedFile.path);

		if (validator && !validator(changedFileName)) {
			return srcPath;
		}

		srcPath = path.join(srcPath, '..', changedFileName);
	}

	return srcPath;
}

function getLanguageProperties() {
	var pathContent = path.join(pathBuild, 'WEB-INF/src/content');

	var languageKeys = [];

	if (fs.existsSync(pathContent) && fs.statSync(pathContent).isDirectory()) {
		var contentFiles = fs.readdirSync(pathContent);

		_.forEach(
			contentFiles,
			function(item, index) {
				if (item.match(/Language.*properties/)) {
					var xmlElement = '<language-properties>content/' + item + '</language-properties>';

					languageKeys.push(xmlElement);
				}
			}
		);
	}

	return languageKeys;
}

function isCssFile(name) {
	return name.indexOf('.css') > -1;
}

gulp.task(
	'init',
	function(cb) {
		var cwd = process.cwd();

		var appServerPathDefault = store.get('appServerPath') || path.join(path.dirname(cwd), 'tomcat');

		inquirer.prompt(
			[
				{
					default: appServerPathDefault,
					message: 'Enter the path to your app server directory:',
					name: 'appServerPath',
					type: 'input',
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
					default: function(answers) {
						return path.join(answers.appServerPath, '../deploy');
					},
					message: 'Enter in your deploy directory:',
					name: 'deployPath',
					type: 'input',
					when: function(answers) {
						var appServerPath = answers.appServerPath;
						var deployPath = path.resolve(path.join(appServerPath, '../deploy'));

						var done = this.async();

						fs.stat(
							deployPath,
							function(err, stats) {
								var ask = err || !stats.isDirectory();

								if (!ask) {
									answers.deployPath = deployPath;
								}

								done(ask);
							}
						);
					}
				},
				{
					choices: [
						{
							name: 'Styled',
							value: 'styled'
						},
						{
							name: 'Unstyled',
							value: 'unstyled'
						}
					],
					message: 'When building this theme, what theme should it inherit from?',
					name: 'baseTheme',
					type: 'list'
				}
			],
			function(answers) {
				var appServerPath = answers.appServerPath;

				var baseName = path.basename(appServerPath);

				if (baseName != 'webapps') {
					appServerPath = path.join(appServerPath, 'webapps');
				}

				var themeName = path.basename(__dirname);

				var appServerPathTheme = path.join(appServerPath, themeName);

				answers = _.assign(
					answers,
					{
						appServerPathTheme: appServerPathTheme,
						deployed: false,
						themeName: themeName
					}
				);

				store.store(answers);

				cb();
			}
		);
	}
);

gulp.task(
	'build',
	function(cb) {
		runSequence(
			'build:clean',
			'build:base',
			'build:src',
			'build:web-inf',
			'build:hook',
			'rename-css-dir',
			'compile-scss',
			'move-compiled-css',
			'remove-old-css-dir',
			'build:war',
			cb
		);
	}
);

gulp.task(
	'build:base',
	function() {
		var sourceFiles = ['./node_modules/liferay-theme-unstyled/src/**/*'];

		if (store.get('baseTheme') == 'styled') {
			sourceFiles.push('./node_modules/liferay-theme-styled/src/**/*');
		}

		return gulp.src(sourceFiles)
			// .pipe(plugins.debug())
			.pipe(gulp.dest(pathBuild));
	}
);

gulp.task(
	'build:clean',
	function(cb) {
		del([pathBuild], cb);
	}
);

gulp.task(
	'build:hook',
	function(cb) {
		var languageProperties = getLanguageProperties();

		if (languageProperties.length) {
			fs.readFile(
				path.join(pathBuild, 'WEB-INF/liferay-hook.xml'),
				{
					encoding: 'utf8'
				},
				function(err, data) {
					if (err) {
						cb();
					}

					var match = /<language-properties>content\/Language\*\.properties<\/language-properties>/;

					if (data.match(match)) {
						data = data.replace(match, languageProperties.join('\n\t'));

						fs.writeFileSync(path.join(pathBuild, 'WEB-INF/liferay-hook.xml.processed'), data);
					}

					cb();
				}
			);
		}
		else {
			cb();
		}
	}
);

gulp.task(
	'build:src',
	function() {
		return gulp.src(getSrcPath('./src/**/*'))
			// .pipe(plugins.debug())
			.pipe(gulp.dest(pathBuild));
	}
);

gulp.task(
	'build:web-inf',
	function() {
		return gulp.src(getSrcPath('./build/WEB-INF/src/**/*'))
			// .pipe(plugins.debug())
			.pipe(gulp.dest('./build/WEB-INF/classes'));
	}
);

gulp.task(
	'check_sf',
	function(cb) {
		glob(
		'src/**/*?(.css|.ftl|.js|.jsp|.scss|.vm)',
			function(err, files) {
				if (err) throw err;

				var checkSF = new CheckSourceFormattingCLI(
					{
						args: files
					}
				);

				checkSF.init();
			}
		);
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

		return gulp.src(getSrcPath(cssBuild + '/**/*.+(css|scss)', isCssFile))
			<% if (supportCompass) { %>
			.pipe(
				plugins.rename(
					{
						extname: '.scss'
					}
				)
			)
			<% } %>
			.pipe(plugins.plumber())
			.pipe(sass(config))
			// .pipe(plugins.plumber.stop())
			// .pipe(plugins.debug())
			.pipe(gulp.dest(cssBuild));
	}
);

gulp.task(
	'move-compiled-css',
	function(cb) {
		return gulp.src(pathBuild + '/_css/**/*')
			.pipe(gulp.dest(pathBuild + '/css'))
	}
);

gulp.task(
	'deploy',
	function(cb) {
		runSequence(
			'build',
			'deploy:war',
			cb
		)
	}
);

gulp.task(
	'deploy:fast',
	function() {
		var dest = store.get('appServerPathTheme');

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

		var stream = gulp.src(getSrcPath(pathBuild + '/**/*'))
			// .pipe(plugins.debug())
			.pipe(gulp.dest(dest));

		if (tempThemeDir) {
			stream.pipe(gulp.dest(path.join(tempDirPath, tempThemeDir)));
		}

		return stream;
	}
);

gulp.task(
	'deploy:war',
	function() {
		var stream = gulp.src('./dist/*.war')
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
	'build:war',
	function() {
		var themeName = store.get('themeName');

		return gulp.src(pathBuild + '/**/*')
			.pipe(
				plugins.war(
					{
						displayName: themeName
					}
				)
			)
			.pipe(plugins.zip(themeName + '.war'))
			.pipe(gulp.dest('./dist'));
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
		fs.rename(
			pathBuild + '/css',
			pathBuild + '/_css',
			cb
		);
	}
);

gulp.task(
	'watch',
	function() {
		gulp.watch(
			'src/**/*',
			function(vinyl) {
				changedFile = vinyl;

				if (!fullDeploy && store.get('deployed')) {
					runSequence(
						'build:src',
						'build:web-inf',
						'rename-css-dir',
						'compile-scss',
						'move-compiled-css',
						'remove-old-css-dir',
						'deploy:fast',
						function() {
							changedFile = null;
						}
					);
				}
				else {
					runSequence(
						'deploy',
						function() {
							changedFile = null;
						}
					);
				}
			}
		);
		//gulp.watch(paths.partialsSource, ['updateEntryPointCSS']);
	}
);