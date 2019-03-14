/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const del = require('del');
const fs = require('fs-extra');
const path = require('path');

const testUtil = require('../../test/util');

const initCwd = process.cwd();

afterAll(() => {
	// Clean things on exit to avoid GulpStorage.save() errors because of left
	// over async operations when changing tests.
	[
		'watch_task_css',
		'watch_task_js',
		'watch_task_template',
		'watch_task_socket',
	].forEach(namespace =>
		testUtil.cleanTempTheme('base-theme', '7.0', namespace, initCwd)
	);
});

beforeEach(() => {
	jest.setTimeout(30000);

	testUtil.hideConsole();
});

afterEach(() => {
	testUtil.restoreConsole();
});

describe('when changing css files', () => {
	let gulp;
	let runSequence;
	let tempPath;
	let appServerPathPlugin;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'watch_task_css',
			registerTasks: true,
		});

		gulp = config.gulp;
		runSequence = config.runSequence;
		tempPath = config.tempPath;

		appServerPathPlugin = path.join(
			tempPath,
			'../appserver/webapps/base-theme'
		);

		config.gulp.storage.set({
			appServerPathPlugin,
			deployed: true,
		});
	});

	afterEach(() => {
		del.sync(appServerPathPlugin, {force: true});
	});

	it('watch task should deploy files correctly on change', done => {
		const filePath = path.join(
			tempPath,
			'custom_src_path/css/_custom.scss'
		);

		gulp.storage.set('changedFile', {
			path: filePath,
			type: 'changed',
		});

		const fileContents =
			fs.readFileSync(filePath, 'utf8') + '\n\n/* this is the change */';

		fs.writeFileSync(filePath, fileContents, 'utf8');

		runSequence(
			'build:clean',
			'build:base',
			'build:src',
			'build:themelet-src',
			'build:themelet-css-inject',
			'build:rename-css-dir',
			'build:compile-css',
			'build:move-compiled-css',
			'build:remove-old-css-dir',
			'deploy:css-files',
			() => {
				const cssDir = path.join(appServerPathPlugin, 'css');

				expect(path.join(cssDir, 'main.css')).toBeFile();
				expect(path.join(cssDir, 'aui.css')).toBeFile();

				const regex = /\/\* this is the change \*\//;

				expect(path.join(cssDir, 'main.css')).toBeFileMatching(regex);

				expect(() =>
					fs.statSync(path.join(appServerPathPlugin, 'js'))
				).toThrow();

				done();
			}
		);
	});
});

describe('when changing js files', () => {
	let gulp;
	let runSequence;
	let tempPath;
	let appServerPathPlugin;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'watch_task_js',
			registerTasks: true,
		});

		gulp = config.gulp;
		runSequence = config.runSequence;
		tempPath = config.tempPath;

		appServerPathPlugin = path.join(tempPath, '../appserver');

		config.gulp.storage.set({
			appServerPathPlugin,
			deployed: true,
		});
	});

	afterEach(() => {
		del.sync(appServerPathPlugin, {force: true});
	});

	it('watch task should deploy files correctly on change', done => {
		gulp.storage.set('changedFile', {
			path: 'custom_src_path/js/main.js',
			type: 'changed',
		});

		runSequence('deploy:file', () => {
			const jsDir = path.join(appServerPathPlugin, 'js');

			const deployedFilePath = path.join(jsDir, 'main.js');

			expect(deployedFilePath).toBeFile();

			const regex = /console\.log\('main\.js'\);/;

			expect(deployedFilePath).toBeFileMatching(regex);

			expect(() =>
				fs.statSync(path.join(appServerPathPlugin, 'css'))
			).toThrow();

			done();
		});
	});
});

describe('when changing template files', () => {
	let gulp;
	let runSequence;
	let tempPath;
	let appServerPathPlugin;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'watch_task_template',
			registerTasks: true,
		});

		gulp = config.gulp;
		runSequence = config.runSequence;
		tempPath = config.tempPath;

		appServerPathPlugin = path.join(tempPath, '../appserver');

		config.gulp.storage.set({
			appServerPathPlugin,
			deployed: true,
		});
	});

	afterEach(() => {
		del.sync(appServerPathPlugin, {force: true});
	});

	it('watch task should deploy files correctly on change', done => {
		gulp.storage.set('changedFile', {
			path: 'custom_src_path/templates/portal_normal.ftl',
			type: 'changed',
		});

		runSequence(
			'build:src',
			'build:themelet-src',
			'build:themelet-js-inject',
			'deploy:folder',
			() => {
				const templatesDir = path.join(
					appServerPathPlugin,
					'templates'
				);

				const deployedFilePath = path.join(
					templatesDir,
					'portal_normal.ftl'
				);

				expect(deployedFilePath).toBeFile();

				const regex = /<script src="\${theme_display.getPathThemeRoot\(\)}\/themelets\/test-themelet\/js\/main\.js"><\/script>/;

				expect(deployedFilePath).toBeFileMatching(regex);

				done();
			}
		);
	});
});
