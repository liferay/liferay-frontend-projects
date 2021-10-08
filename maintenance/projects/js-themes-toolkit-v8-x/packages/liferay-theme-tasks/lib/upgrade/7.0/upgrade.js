/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const colors = require('ansi-colors');
const spawn = require('cross-spawn');
const del = require('del');
const fs = require('fs-extra');
const loadPlugins = require('gulp-load-plugins');
const replace = require('gulp-replace-task');
const _ = require('lodash');
const path = require('path');
const vinylPaths = require('vinyl-paths');

const lfrThemeConfig = require('../../liferay_theme_config');
const bootstrapVars = require('./bootstrap_vars');
const lexiconMixins = require('./lexicon_mixins');
const lexiconVars = require('./lexicon_vars');

const plugins = loadPlugins();

const CWD = process.cwd();

const DIR_SRC_CSS = 'src/css';

const lexiconUpgrade = {
	removedMixinsUsage: {},
	removedVarsUsage: {},
};

const logBuffers = {
	bootstrap: [getLogHeader('Bootstrap Upgrade (3 to 4)')],
	lexicon: [getLogHeader('Lexicon Upgrade (1.0 to 2.0)')],
	liferay: [getLogHeader('Liferay Upgrade (7.0 to 7.1)')],
};

module.exports = function (options) {
	const gulp = options.gulp;

	const runSequence = require('run-sequence').use(gulp);

	const cssSrcPath = path.join(CWD, 'src/css/**/*.+(css|scss)');

	const pathSrc = options.pathSrc;

	gulp.task('upgrade:dependencies', (cb) => {
		lfrThemeConfig.removeDependencies(['liferay-theme-deps-7.0']);
		lfrThemeConfig.setDependencies(
			{
				'liferay-theme-deps-7.1': '8.2.4',
				'liferay-theme-tasks': '8.2.4',
			},
			true
		);

		const npmInstall = spawn('npm', ['install']);

		npmInstall.stderr.pipe(process.stderr);
		npmInstall.stdout.pipe(process.stdout);

		npmInstall.on('close', cb);
	});

	gulp.task('upgrade:config', () => {
		const lfrThemeConfig = require('../../liferay_theme_config');

		lfrThemeConfig.setConfig({
			version: '7.1',
		});

		return gulp
			.src(
				'src/WEB-INF/+(liferay-plugin-package.properties|liferay-look-and-feel.xml)'
			)
			.pipe(
				replace({
					patterns: [
						{
							match: /(DTD Look and Feel )\d(?:\.\d+)+(\/\/EN)/g,
							replacement: '$17.0.0$2',
						},
						{
							match: /(liferay-look-and-feel_)\d(?:_\d+)+(\.dtd)/g,
							replacement: '$17_0_0$2',
						},
						{
							match: /(<version>).+(<\/version>)/g,
							replacement: '$17.1.0+$2',
						},
						{
							match: /(liferay-versions=)\d(?:\.\d+)+\+?/g,
							replacement: '$17.1.0+',
						},
					],
				})
			)
			.pipe(gulp.dest('src/WEB-INF'));
	});

	gulp.task('upgrade:ftl-templates', () => {
		const ftlRules = [
			{
				message:
					'Warning: List items inside a .list-inline now require the .list-inline-item class, see https://getbootstrap.com/docs/4.0/migration/#typography for more information.',
				regex: /<ul class="list-inline"[^<li]/g,
			},
			{
				message:
					'Warning: .container-fluid-1280 has been deprecated. Please use .container-fluid.container-fluid-max-xl instead.',
				regex: /<div class="container-fluid-1280">/g,
			},
			{
				message:
					'Responsive navbar behaviors are now applied to the .navbar class via the required .navbar-expand-{breakpoint}, see https://getbootstrap.com/docs/4.0/migration/#navbar for more information.',
				regex: /<nav class="navbar">/g,
			},
			{
				message:
					'Warning: .navbar-toggle is now .navbar-toggler and has differnt inner markup, see https://getbootstrap.com/docs/4.0/migration/#navbar for more information.',
				regex: /navbar-toggle[\s|"]>/g,
			},
			{
				message:
					'Warning: .navbar-header has been removed. This container should be removed in most cases. Please, use your own container if necessary.',
				regex: /navbar-header/g,
			},
		];

		const portletFtlRules = [
			{
				message:
					'Warning: Several Applications in Liferay Portal 7.1 rely on a portlet_header_${portletId} extension point to show additional controls. When overwriting portlet.ftl, please, make sure you add a `<@liferay_util["dynamic-include"] key="portlet_header_${portlet_display_root_portlet_id}" />`.',
				negativeMatch: true,
				regex: /<@liferay_util["dynamic-include"] key="portlet_header_${portlet_display_root_portlet_id}" \/>/g,
			},
		];

		return gulp.src('src/templates/**/*.ftl').pipe(
			vinylPaths((path, done) => {
				checkFile(
					path,
					path.includes('portlet.ftl')
						? ftlRules.concat(portletFtlRules)
						: ftlRules,
					'liferay'
				);

				done();
			})
		);
	});

	gulp.task('upgrade:log-changes', (cb) => {
		logBuffer(logBuffers.lexicon);
		logBuffer(logBuffers.liferay);

		cb();
	});

	gulp.task('upgrade:rename-core-files', (cb) => {
		const auiScssPath = path.join(CWD, DIR_SRC_CSS, 'aui.scss');

		gulp.src(auiScssPath)
			.pipe(
				plugins.rename((path) => {
					path.basename = 'clay';
				})
			)
			.pipe(gulp.dest(DIR_SRC_CSS))
			.on('end', () => {
				logBuffers.liferay.push(`Renamed aui.scss to clay.scss \n`);

				del(auiScssPath, cb);
			});
	});

	gulp.task('upgrade:rename-core-imports', () => {
		return gulp
			.src(cssSrcPath)
			.pipe(
				replace({
					patterns: [
						{
							match: /(@import ")aui\/lexicon(.*)/g,
							replacement: '$1clay$2',
						},
						{
							match: /@import "aui\/lexicon\/bootstrap\/mixins";/g,
							replacement: '',
						},
						{
							match: /@import "aui\/lexicon\/lexicon-base\/mixins";/g,
							replacement: '',
						},
						{
							match: /@import "aui\/lexicon\/atlas-theme\/mixins";/g,
							replacement: '',
						},
						{
							match: /@import "aui\/alloy-font-awesome\/scss\/mixins-alloy";/g,
							replacement: '',
						},
						{
							match: /@import "aui\/alloy-font-awesome\/scss\/variables";/g,
							replacement: '',
						},
					],
				})
			)
			.pipe(
				replace({
					patterns: [
						{
							match: /lexicon-base(.*)/g,
							replacement: 'base$1',
						},
					],
				})
			)
			.pipe(gulp.dest(DIR_SRC_CSS));
	});

	gulp.task('upgrade:collect-removed-bootstrap-vars', () => {
		return gulp
			.src(cssSrcPath)
			.pipe(
				vinylPaths((path, done) => {
					checkFile(path, bootstrapVars.rules, 'bootstrap');

					done();
				})
			)
			.pipe(gulp.dest(DIR_SRC_CSS));
	});

	gulp.task('upgrade:collect-removed-lexicon-mixins', () => {
		return gulp
			.src(cssSrcPath)
			.pipe(
				vinylPaths((path, done) => {
					const usedLexiconMixins = checkFile(
						path,
						lexiconMixins.rules,
						'lexicon'
					).map(({name}) => name);

					lexiconUpgrade.removedMixinsUsage[path] = usedLexiconMixins;

					done();
				})
			)
			.pipe(gulp.dest(DIR_SRC_CSS));
	});

	gulp.task('upgrade:collect-removed-lexicon-vars', () => {
		return gulp
			.src(cssSrcPath)
			.pipe(
				vinylPaths((path, done) => {
					const usedLexiconVars = checkFile(
						path,
						lexiconVars.rules,
						'lexicon'
					).map(({name}) => name);

					lexiconUpgrade.removedVarsUsage[path] = usedLexiconVars;

					done();
				})
			)
			.pipe(gulp.dest(DIR_SRC_CSS));
	});

	gulp.task('upgrade:create-removed-lexicon-mixins-file', (cb) => {
		const removedMixinsUsage = Object.keys(
			lexiconUpgrade.removedMixinsUsage
		)
			.map((file) => lexiconUpgrade.removedMixinsUsage[file])
			.reduce((acc, value) => acc.concat(value));

		if (removedMixinsUsage.length) {
			const removedMixinsFileContent = [
				...new Set(removedMixinsUsage),
			].map((mixinName) => {
				return fs.readFileSync(
					path.normalize(
						`${__dirname}/theme_data/mixins/${lexiconMixins.removed[mixinName]}.scss`
					)
				);
			});

			const deprecatedMixinsFilePath = path.join(
				process.cwd(),
				pathSrc,
				'css',
				'_mixins_deprecated.scss'
			);

			fs.writeFileSync(
				deprecatedMixinsFilePath,
				removedMixinsFileContent
			);
		}

		cb();
	});

	gulp.task('upgrade:create-removed-lexicon-vars-file', (cb) => {
		const removedVarsUsage = Object.keys(lexiconUpgrade.removedVarsUsage)
			.map((file) => lexiconUpgrade.removedVarsUsage[file])
			.reduce((acc, value) => acc.concat(value));

		if (removedVarsUsage.length) {
			const removedVarsFileContent = fs.readFileSync(
				path.normalize(`${__dirname}/theme_data/vars/removed.scss`)
			);

			const deprecatedVarsFilePath = path.join(
				process.cwd(),
				pathSrc,
				'css',
				'_variables_deprecated.scss'
			);

			fs.writeFileSync(deprecatedVarsFilePath, removedVarsFileContent);
		}

		cb();
	});

	gulp.task('upgrade:import-removed-bootstrap-mixins', () => {
		const importsFilePath = path.join(
			process.cwd(),
			pathSrc,
			'css',
			'_imports.scss'
		);

		return gulp
			.src(importsFilePath)
			.pipe(
				plugins.insert.append(
					'\n// Adds mixins removed by Bootstrap4\n@import "compat/mixins";'
				)
			)
			.pipe(gulp.dest(DIR_SRC_CSS));
	});

	gulp.task('upgrade:import-removed-lexicon-mixins', () => {
		const removedMixinsUsage = Object.keys(
			lexiconUpgrade.removedMixinsUsage
		).filter((file) => lexiconUpgrade.removedMixinsUsage[file].length);

		if (removedMixinsUsage.length) {
			const importsFilePath = path.join(
				process.cwd(),
				pathSrc,
				'css',
				'_imports.scss'
			);

			return gulp
				.src(importsFilePath)
				.pipe(plugins.insert.append('@import "mixins_deprecated";\n\n'))
				.pipe(gulp.dest(DIR_SRC_CSS));
		}
	});

	gulp.task('upgrade:import-removed-lexicon-vars', () => {
		const removedVarsUsage = Object.keys(
			lexiconUpgrade.removedVarsUsage
		).filter((file) => lexiconUpgrade.removedVarsUsage[file].length);

		if (removedVarsUsage.length) {
			const importsFilePath = path.join(
				process.cwd(),
				pathSrc,
				'css',
				'_imports.scss'
			);

			return gulp
				.src(importsFilePath)
				.pipe(
					plugins.insert.append('@import "variables_deprecated";\n\n')
				)
				.pipe(gulp.dest(DIR_SRC_CSS));
		}
	});

	gulp.task('upgrade:unsupported-vm-templates', () => {
		return gulp.src('src/templates/**/*.vm').pipe(
			vinylPaths((filePath, done) => {
				const fileName = colors.white(
					'File: ' + colors.underline(path.basename(filePath)) + '\n'
				);

				logBuffers.liferay.push(fileName);
				logBuffers.liferay.push(
					'    ' +
						colors.red(
							'Velocity templates for themes were deprecated in 7.0 and are unsupported in 7.0. '
						) +
						colors.white(
							' Please move your templates to Freemarker.' + '\n'
						)
				);

				done();
			})
		);
	});

	return function (cb) {
		runSequence(
			'upgrade:config',
			'upgrade:rename-core-files',
			'upgrade:rename-core-imports',
			'upgrade:collect-removed-bootstrap-vars',
			'upgrade:collect-removed-lexicon-mixins',
			'upgrade:create-removed-lexicon-mixins-file',
			'upgrade:import-removed-bootstrap-mixins',
			'upgrade:import-removed-lexicon-mixins',
			'upgrade:collect-removed-lexicon-vars',
			'upgrade:create-removed-lexicon-vars-file',
			'upgrade:import-removed-lexicon-vars',
			'upgrade:ftl-templates',
			'upgrade:unsupported-vm-templates',
			'upgrade:dependencies',
			'upgrade:log-changes',
			cb
		);
	};
};

function checkFile(filePath, rules, logBuffer) {
	const results = [];

	const config = {
		encoding: 'utf8',
	};

	if (fs.existsSync(filePath)) {
		const logs = [];

		const fileContents = fs.readFileSync(filePath, config);

		_.forEach(rules, (item) => {
			if (item.fileName && item.fileName !== path.basename(filePath)) {
				return;
			}

			const match = item.negativeMatch
				? !item.regex.test(fileContents)
				: item.regex.test(fileContents);

			if (match) {
				results.push(item);

				logs.push('    ' + colors.yellow(item.message) + '\n');
			}
		});

		if (logs.length) {
			const fileName = colors.white(
				'File: ' + colors.underline(path.basename(filePath)) + '\n'
			);

			logBuffers[logBuffer].push(fileName);

			logBuffers[logBuffer] = logBuffers[logBuffer].concat(logs);
		}
	}

	return results;
}

function getLogHeader(header) {
	const line = new Array(65).join('-');

	return colors.bold('\n' + line + '\n ' + header + '\n' + line + '\n\n');
}

function logBuffer(buffer) {
	process.stdout.write(colors.bgBlack(buffer.join('')));
}
