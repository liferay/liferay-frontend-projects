'use strict';

const del = require('del');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const plugins = require('gulp-load-plugins')();
const replace = require('gulp-replace-task');

const divert = require('../lib/divert');
const lfrThemeConfig = require('../lib/liferay_theme_config');
const lookAndFeelUtil = require('../lib/look_and_feel_util');
const themeUtil = require('../lib/util');

const themeConfig = lfrThemeConfig.getConfig();

module.exports = function(options) {
	const {gulp, pathBuild, pathSrc} = options;
	const {storage} = gulp;

	const runSequence = require('run-sequence').use(gulp);

	gulp.task('build', function(cb) {
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
			'build:war',
			cb
		);
	});

	gulp.task('build:base', function() {
		const sourceFiles = divert('dependencies').getBaseThemeDependencies(
			process.cwd()
		);

		return gulp.src(sourceFiles).pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:clean', function(cb) {
		del([pathBuild], cb);
	});

	gulp.task('build:fix-at-directives', function() {
		return gulp
			.src(pathBuild + '/css/*.css')
			.pipe(
				replace({
					patterns: getFixAtDirectivesPatterns(),
				})
			)
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	// Temp fix for libSass compilation issue with empty url() functions

	gulp.task('build:fix-url-functions', function(cb) {
		if (themeConfig.rubySass) {
			cb();
		} else {
			gulp
				.src(pathBuild + '/_css/**/*.css')
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
		}
	});

	gulp.task('build:hook', function() {
		let languageProperties = themeUtil.getLanguageProperties(pathBuild);

		return gulp
			.src(path.join(pathBuild, 'WEB-INF/liferay-hook.xml'))
			.pipe(
				replace({
					patterns: [
						{
							match: /<language-properties>content\/Language\*\.properties<\/language-properties>/,
							replacement: function() {
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
			.pipe(plugins.rename('liferay-hook.xml.processed'))
			.pipe(gulp.dest(path.join(pathBuild, 'WEB-INF')));
	});

	gulp.task('build:src', function() {
		return gulp
			.src(path.join(pathSrc, '**/*'), {
				base: pathSrc,
			})
			.pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:web-inf', function() {
		return gulp
			.src(pathBuild + '/WEB-INF/src/**/*', {
				base: pathBuild + '/WEB-INF/src',
			})
			.pipe(gulp.dest(pathBuild + '/WEB-INF/classes'));
	});

	gulp.task('build:liferay-look-and-feel', function(cb) {
		let themePath = process.cwd();

		lookAndFeelUtil.mergeLookAndFeelJSON(themePath, {}, function(
			lookAndFeelJSON
		) {
			if (!lookAndFeelJSON) {
				return cb();
			}

			let themeName = lookAndFeelUtil.getNameFromPluginPackageProperties(
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

			let xml = lookAndFeelUtil.buildXML(lookAndFeelJSON, doctypeElement);

			fs.writeFile(
				path.join(
					themePath,
					pathBuild,
					'WEB-INF/liferay-look-and-feel.xml'
				),
				xml,
				function(err) {
					if (err) {
						throw err;
					}

					cb();
				}
			);
		});
	});

	gulp.task('build:move-compiled-css', function() {
		return gulp
			.src(pathBuild + '/_css/**/*')
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	gulp.task('build:r2', function() {
		let r2 = require('gulp-liferay-r2-css');

		return gulp
			.src(pathBuild + '/css/*.css')
			.pipe(
				plugins.rename({
					suffix: '_rtl',
				})
			)
			.pipe(plugins.plumber())
			.pipe(r2())
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	gulp.task('build:remove-old-css-dir', function(cb) {
		del([pathBuild + '/_css'], cb);
	});

	gulp.task('build:rename-css-dir', function(cb) {
		fs.rename(pathBuild + '/css', pathBuild + '/_css', cb);
	});

	gulp.task('build:war', done => {
		runSequence.apply(this, ['plugin:version', 'plugin:war', done]);
	});
};

function getFixAtDirectivesPatterns() {
	let keyframeRulesReplace = function(match, m1, m2) {
		return (
			_.map(m1.split(','), function(item) {
				return item.replace(/.*?(from|to|[0-9\.]+%)/g, '$1');
			}).join(',') + m2
		);
	};

	return [
		{
			match: /(@font-face|@page|@-ms-viewport)\s*({\n\s*)(.*)\s*({)/g,
			replacement: function(match, m1, m2, m3, m4) {
				return m3 + m2 + m1 + ' ' + m4;
			},
		},
		{
			match: /(@-ms-keyframes.*{)([\s\S]+?)(}\s})/g,
			replacement: function(match, m1, m2, m3) {
				m2 = m2.replace(/(.+?)(\s?{)/g, keyframeRulesReplace);

				return m1 + m2 + m3;
			},
		},
		{
			match: /@import\s+url\s*\(\s*['\"]?(.+\.css)['\"]?/g,
			replacement: function(match, m1) {
				return '@import url(' + m1 + '?t=' + Date.now();
			},
		},
	];
}
