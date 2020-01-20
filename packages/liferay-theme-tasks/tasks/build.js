/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const chalk = require('chalk');
const del = require('del');
const fs = require('fs-extra');
const gulpLoadPlugins = require('gulp-load-plugins');
const replace = require('gulp-replace-task');
const _ = require('lodash');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');

const getBaseThemeDependencies = require('../lib/getBaseThemeDependencies');
const lfrThemeConfig = require('../lib/liferay_theme_config');
const lookAndFeelUtil = require('../lib/look_and_feel_util');
const normalize = require('../lib/normalize');
const themeUtil = require('../lib/util');

const plugins = gulpLoadPlugins();

const themeConfig = lfrThemeConfig.getConfig();

/**
 * Add JS-injection placeholders (HTML comments of the form
 * `<!-- inject:js -->`/`<!-- endinject -->`) to templates
 * in the base theme dependencies.
 */
function injectJS() {
	const targetRegExp = new RegExp(
		'/liferay-frontend-theme-unstyled/templates/portal_normal\\.(ftl|vm)$'
	);

	return through.obj(function(file, encoding, callback) {
		if (!file.path.match(targetRegExp) || file.isNull()) {
			// Nothing to do.
		} else if (file.isStream()) {
			file.contents = file.contents.pipe(() => {
				let output = '';
				return through(
					function transform(chunk, encoding, callback) {
						output += chunk.toString();
						callback(null);
					},
					function flush(callback) {
						this.push(normalize(output));
						callback(null);
					}
				);
			});
		} else if (file.isBuffer()) {
			file.contents = Buffer.from(
				normalize(file.contents.toString('utf8'))
			);
		} else {
			return this.emit(
				'error',
				new PluginError('injectJS', 'Unsupported file type')
			);
		}

		return callback(null, file);
	});
}

module.exports = function(options) {
	const {gulp, pathBuild, pathSrc} = options;

	const runSequence = require('run-sequence').use(gulp);

	gulp.task('build', cb => {
		runSequence(
			'build:clean',
			'build:base',
			'build:src',
			'build:web-inf',
			'build:liferay-look-and-feel',
			'build:hook',
			'build:themelets',
			'build:rename-css-dir',
			'build:compile-css',
			'build:fix-url-functions',
			'build:move-compiled-css',
			'build:remove-old-css-dir',
			'build:fix-at-directives',
			'build:r2',
			'build:copy:fontAwesome',
			'build:war',
			cb
		);
	});

	gulp.task('build:clean', cb => {
		del([pathBuild]).then(() => cb());
	});

	gulp.task('build:base', () => {
		const sourceFiles = getBaseThemeDependencies();

		return gulp
			.src(sourceFiles)
			.pipe(injectJS())
			.pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:src', () => {
		return gulp
			.src(path.join(pathSrc, '**/*'), {
				base: pathSrc,
			})
			.pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:web-inf', () => {
		return gulp
			.src(pathBuild + '/WEB-INF/src/**/*', {
				base: pathBuild + '/WEB-INF/src',
			})
			.pipe(gulp.dest(pathBuild + '/WEB-INF/classes'));
	});

	gulp.task('build:liferay-look-and-feel', cb => {
		const themePath = process.cwd();

		lookAndFeelUtil.mergeLookAndFeelJSON(themePath, {}, lookAndFeelJSON => {
			if (!lookAndFeelJSON) {
				return cb();
			}

			const themeName = lookAndFeelUtil.getNameFromPluginPackageProperties(
				themePath
			);

			lookAndFeelUtil.correctJSONIdentifiers(lookAndFeelJSON, themeName);

			let doctypeElement = lookAndFeelUtil.getLookAndFeelDoctype(
				themePath
			);

			if (!doctypeElement) {
				doctypeElement = lookAndFeelUtil.getLookAndFeelDoctypeByVersion(
					themeConfig.version
				);
			}

			const xml = lookAndFeelUtil.buildXML(
				lookAndFeelJSON,
				doctypeElement
			);

			fs.writeFile(
				path.join(
					themePath,
					pathBuild,
					'WEB-INF/liferay-look-and-feel.xml'
				),
				xml,
				err => {
					if (err) {
						throw err;
					}

					cb();
				}
			);
		});
	});

	gulp.task('build:hook', () => {
		const languageProperties = themeUtil.getLanguageProperties(pathSrc);

		return gulp
			.src(path.join(pathBuild, 'WEB-INF/liferay-hook.xml'))
			.pipe(
				replace({
					patterns: [
						{
							match: /<language-properties>content\/Language\*\.properties<\/language-properties>/,
							replacement() {
								let retVal = '';

								if (languageProperties) {
									retVal = languageProperties.join('\n\t');
								}

								return retVal;
							},
						},
					],
				})
			)
			.pipe(plugins.rename('liferay-hook.xml'))
			.pipe(gulp.dest(path.join(pathBuild, 'WEB-INF')));
	});

	gulp.task('build:rename-css-dir', cb => {
		fs.rename(pathBuild + '/css', pathBuild + '/_css', cb);
	});

	// Temp fix for libSass compilation issue with empty url() functions
	gulp.task('build:fix-url-functions', cb => {
		gulp.src(pathBuild + '/_css/**/*.css')
			.pipe(
				replace({
					patterns: [
						{
							match: /url\(url\(\)/g,
							replacement: 'url()',
						},
					],
				})
			)
			.pipe(
				gulp.dest(pathBuild + '/_css', {
					overwrite: true,
				})
			)
			.on('end', cb);
	});

	gulp.task('build:move-compiled-css', () => {
		return gulp
			.src(pathBuild + '/_css/**/*')
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	gulp.task('build:remove-old-css-dir', cb => {
		del([pathBuild + '/_css']).then(() => cb());
	});

	gulp.task('build:fix-at-directives', () => {
		return gulp
			.src(pathBuild + '/css/*.css')
			.pipe(
				replace({
					patterns: getFixAtDirectivesPatterns(),
				})
			)
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	gulp.task('build:r2', () => {
		const r2 = require('../lib/r2')();

		return gulp
			.src(pathBuild + '/css/*.css')
			.pipe(
				plugins.rename({
					suffix: '_rtl',
				})
			)
			.pipe(r2)
			.pipe(gulp.dest(pathBuild + '/css'))
			.on('end', () => {
				if (r2.hasCssParseErrors) {
					// eslint-disable-next-line no-console
					console.log(
						chalk.yellow.bold(
							'\n' +
								'Some CSS files had incorrect SASS or CSS code. The build will finish but\n' +
								'the RTL CSS will not be generated correctly.\n' +
								'\n' +
								'Please address the issues in your source code to see this error go away.\n'
						)
					);
				}
			});
	});

	gulp.task('build:copy:fontAwesome', done => {
		const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'))
			.liferayTheme;

		if (!packageJSON.fontAwesome) {
			return done();
		}

		const liferayFontAwesome = themeUtil.resolveDependency(
			'liferay-font-awesome'
		);

		fs.copy(
			path.join(liferayFontAwesome, 'font'),
			path.join(pathBuild, 'font'),
			done
		);
	});

	gulp.task('build:war', done => {
		runSequence.apply(this, ['plugin:version', 'plugin:war', done]);
	});
};

function getFixAtDirectivesPatterns() {
	const keyframeRulesReplace = function(match, m1, m2) {
		return (
			_.map(m1.split(','), item => {
				return item.replace(/.*?(from|to|[0-9.]+%)/g, '$1');
			}).join(',') + m2
		);
	};

	return [
		{
			match: /(@font-face|@page|@-ms-viewport)\s*({\n\s*)(.*)\s*({)/g,
			replacement(match, m1, m2, m3, m4) {
				return m3 + m2 + m1 + ' ' + m4;
			},
		},
		{
			match: /(@-ms-keyframes.*{)([\s\S]+?)(}\s})/g,
			replacement(match, m1, m2, m3) {
				m2 = m2.replace(/(.+?)(\s?{)/g, keyframeRulesReplace);

				return m1 + m2 + m3;
			},
		},
		{
			match: /@import\s+url\s*\(\s*['"]?(.+\.css)['"]?/g,
			replacement(match, m1) {
				return '@import url(' + m1 + '?t=' + Date.now();
			},
		},
	];
}
