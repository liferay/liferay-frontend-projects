/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const chalk = require('chalk');
const fs = require('fs-extra');
const rename = require('gulp-rename');
const replace = require('gulp-replace-task');
const _ = require('lodash');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');

const project = require('../../../lib/project');
const gulpR2 = require('../../../lib/r2');
const themeUtil = require('../../../lib/util');
const getBaseThemeDependencies = require('../../lib/getBaseThemeDependencies');
const lookAndFeelUtil = require('../../lib/look_and_feel_util');
const normalize = require('../../lib/normalize');

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

module.exports = function() {
	const {gulp, options} = project;
	const {runSequence} = gulp;
	const {pathBuild, pathSrc} = options;

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
		fs.removeSync(pathBuild.resolve().asNative);
		cb();
	});

	gulp.task('build:base', () => {
		const sourceFiles = getBaseThemeDependencies();

		return gulp
			.src(sourceFiles)
			.pipe(injectJS())
			.pipe(gulp.dest(pathBuild.asNative));
	});

	gulp.task('build:src', () => {
		return gulp
			.src(pathSrc.join('**', '*').asPosix, {
				base: pathSrc.asNative,
			})
			.pipe(gulp.dest(pathBuild.asNative));
	});

	gulp.task('build:web-inf', () => {
		return gulp
			.src(pathBuild.join('WEB-INF', 'src', '**', '*').asPosix, {
				base: pathBuild.join('WEB-INF', 'src').asNative,
			})
			.pipe(gulp.dest(pathBuild.join('WEB-INF', 'classes').asNative));
	});

	gulp.task('build:liferay-look-and-feel', cb => {
		const themePath = project.dir;

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
				const themeConfig = project.themeConfig.config;

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
					pathBuild.asNative,
					'WEB-INF',
					'liferay-look-and-feel.xml'
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
		const languageProperties = themeUtil.getLanguageProperties(
			pathSrc.asNative
		);

		return gulp
			.src(pathBuild.join('WEB-INF', 'liferay-hook.xml').asPosix, {
				allowEmpty: true,
			})
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
			.pipe(rename('liferay-hook.xml'))
			.pipe(gulp.dest(pathBuild.join('WEB-INF').asNative));
	});

	gulp.task('build:rename-css-dir', cb => {
		fs.rename(
			pathBuild.join('css').asNative,
			pathBuild.join('_css').asNative,
			cb
		);
	});

	// Temp fix for libSass compilation issue with empty url() functions
	gulp.task('build:fix-url-functions', cb => {
		gulp.src(pathBuild.join('_css', '**', '*.css').asPosix)
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
				gulp.dest(pathBuild.join('_css').asNative, {
					overwrite: true,
				})
			)
			.on('end', cb);
	});

	gulp.task('build:move-compiled-css', () => {
		return gulp
			.src(pathBuild.join('_css', '**', '*').asPosix)
			.pipe(gulp.dest(pathBuild.join('css').asNative));
	});

	gulp.task('build:remove-old-css-dir', cb => {
		fs.removeSync(pathBuild.join('_css').asNative);
		cb();
	});

	gulp.task('build:fix-at-directives', () => {
		return gulp
			.src(pathBuild.join('css', '*.css').asPosix)
			.pipe(
				replace({
					patterns: getFixAtDirectivesPatterns(),
				})
			)
			.pipe(gulp.dest(pathBuild.join('css').asNative));
	});

	gulp.task('build:r2', () => {
		const r2 = gulpR2();

		return gulp
			.src(pathBuild.join('css', '*.css').asPosix)
			.pipe(
				rename({
					suffix: '_rtl',
				})
			)
			.pipe(r2)
			.pipe(gulp.dest(pathBuild.join('css').asNative))
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
			pathBuild.join('font').asNative,
			done
		);
	});

	gulp.task('build:war', done => {
		runSequence('plugin:version', 'plugin:war', done);
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
