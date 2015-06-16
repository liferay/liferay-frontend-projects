'use strict';

var argv = require('minimist')(process.argv.slice(2));
var CheckSourceFormattingCLI = require('../node_modules/check-source-formatting/lib/cli').constructor;
var del = require('del');
var fs = require('fs-extra');
var glob = require('glob');
var path = require('path');
var plugins = require('gulp-load-plugins')();

module.exports = function(options) {
	var gulp = options.gulp;

	plugins.storage(gulp);

	var store = gulp.storage;

	store.create('LiferayTheme', 'liferay-theme.json');

	var fullDeploy = (argv.full || argv.f);

	var pathBuild = './build';

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

			var bourbon = require('node-bourbon');

			includePaths = includePaths.concat(bourbon.includePaths);

			var config = {
				includePaths: includePaths,
				sourceMap: sourcemap
			};

			var sass = plugins.sass;

			var cssBuild = pathBuild + '/_css';

			return gulp.src(getSrcPath(cssBuild + '/**/*.+(css|scss)', isCssFile))
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

	function getSrcPath(srcPath, validator) {
		var changedFile = store.get('changedFile');

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
}