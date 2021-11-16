/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const colors = require('ansi-colors');
const async = require('async');
const log = require('fancy-log');
const fs = require('fs');
const inject = require('gulp-inject');
const {
	default: FilePath,
} = require('liferay-npm-build-tools-common/lib/file-path');
const _ = require('lodash');
const path = require('path');
const vinylPaths = require('vinyl-paths');

const project = require('../../../lib/project');

const FORWARD_SLASH = '/';
const customCssFileName = '_custom.scss';
const defaultTemplateLanguage = 'ftl';

module.exports = function () {
	const {gulp, options} = project;

	const {runSequence} = gulp;
	const {pathBuild} = options;

	const themeConfig = project.themeConfig.config;

	gulp.task('build:themelets', (callback) => {
		runSequence(
			['build:themelet-src'],
			['build:themelet-css-inject', 'build:themelet-js-inject'],
			callback
		);
	});

	gulp.task('build:themelet-css-inject', (callback) => {
		const themeSrcPaths = pathBuild.join(
			'themelets',
			'**',
			'css',
			'**/*.+(css|scss)'
		);

		let injected = false;
		let themeletSources = false;

		const sources = gulp
			.src(themeSrcPaths.asPosix, {
				read: false,
			})
			.pipe(
				vinylPaths((path, vinylCallback) => {
					themeletSources = true;

					vinylCallback();
				})
			);

		const fileName = customCssFileName;

		gulp.src(pathBuild.join('css', fileName).asPosix)
			.pipe(
				inject(sources, {
					endtag: '/* endinject */',
					starttag: '/* inject:imports */',
					transform(filePath) {
						injected = true;

						const filePathArray = getThemeletFilePathArray(
							filePath
						);

						filePath =
							'..' +
							FORWARD_SLASH +
							filePathArray.join(FORWARD_SLASH);

						return '@import "' + filePath + '";';
					},
				})
			)
			.pipe(gulp.dest(pathBuild.join('css').asNative))
			.on('end', () => {
				if (
					!injected &&
					themeletSources &&
					!_.isEmpty(themeConfig.themeletDependencies)
				) {
					log(
						colors.yellow('Warning:'),
						'Failed to automatically inject themelet styles. Make sure inject tags are present in',
						colors.magenta(fileName)
					);
				}

				callback();
			});
	});

	gulp.task('build:themelet-js-inject', (callback) => {
		const themeSrcPaths = pathBuild.join(
			'themelets',
			'**',
			'js',
			'**/*.js'
		);

		let injected = false;
		let themeletSources = false;

		const sources = gulp
			.src(themeSrcPaths.asPosix, {
				read: false,
			})
			.pipe(
				vinylPaths((path, vinylCallback) => {
					themeletSources = true;

					vinylCallback();
				})
			);

		const templateLanguage =
			themeConfig.templateLanguage || defaultTemplateLanguage;

		let themeRootPath = '${theme_display.getPathThemeRoot()}';

		if (templateLanguage === 'vm') {
			themeRootPath = '$theme_display.getPathThemeRoot()';
		}

		gulp.src(
			pathBuild.join('templates', 'portal_normal.' + templateLanguage)
				.asPosix
		)
			.pipe(
				inject(sources, {
					endtag: '<!-- endinject -->',
					starttag: '<!-- inject:js -->',
					transform(filePath) {
						injected = true;

						const filePathArray = getThemeletFilePathArray(
							filePath
						);

						filePath = filePathArray.join(FORWARD_SLASH);

						return (
							'<script src="' +
							themeRootPath +
							FORWARD_SLASH +
							filePath +
							'"></script>'
						);
					},
				})
			)
			.pipe(gulp.dest(pathBuild.join('templates').asNative))
			.on('end', () => {
				if (
					!injected &&
					themeletSources &&
					!_.isEmpty(themeConfig.themeletDependencies)
				) {
					log(
						colors.yellow('Warning:'),
						'Failed to automatically inject themelet js. Make sure inject tags are present in',
						colors.magenta('portal_normal.' + templateLanguage)
					);
				}

				callback();
			});
	});

	gulp.task('build:themelet-src', (callback) => {
		runThemeletDependenciesSeries((item, index, done) => {
			gulp.src(
				new FilePath(project.dir).join(
					'node_modules',
					index,
					'src',
					'**',
					'*'
				).asPosix
			)
				.pipe(gulp.dest(pathBuild.join('themelets', index).asNative))
				.on('end', done);
		}, callback);
	});

	function runThemeletDependenciesSeries(asyncTask, callback) {
		const themeletStreamMap = _.map(getThemeletDependencies(), function (
			item,
			index
		) {
			return _.bind(asyncTask, this, item, index);
		});

		async.series(themeletStreamMap, callback);
	}
};

function getThemeletFilePathArray(filePath) {
	let filePathArray = path.join(filePath).split(path.sep);

	filePathArray = filePathArray.slice(
		filePathArray.indexOf('themelets'),
		filePathArray.length
	);

	return filePathArray;
}

function getThemeletDependencies() {
	const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));

	let themeletDependencies;

	if (
		packageJSON.liferayTheme &&
		packageJSON.liferayTheme.themeletDependencies
	) {
		themeletDependencies = packageJSON.liferayTheme.themeletDependencies;
	}

	return themeletDependencies;
}
