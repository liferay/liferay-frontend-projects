/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const {Gulp} = require('gulp');
const path = require('path');

const project = require('../../../lib/project');
const {cleanTempTheme, setupTempTheme} = require('../../../lib/test/util');
const {registerTasks} = require('../../index');

let deployPath;
let tempTheme;

beforeAll(() => {
	process.env.LIFERAY_THEME_STYLED_PATH = path.dirname(
		require.resolve('liferay-frontend-theme-styled/package.json')
	);
	process.env.LIFERAY_THEME_UNSTYLED_PATH = path.dirname(
		require.resolve('liferay-frontend-theme-unstyled/package.json')
	);
});

afterAll(() => {
	delete process.env.LIFERAY_THEME_STYLED_PATH;
	delete process.env.LIFERAY_THEME_UNSTYLED_PATH;
});

beforeEach(() => {
	tempTheme = setupTempTheme({
		init: () =>
			registerTasks({
				distName: 'base-theme',
				gulp: new Gulp(),
			}),
		namespace: 'deploy_task',
		themeName: 'base-theme-7-2',
		version: '7.2',
	});

	deployPath = path.join(tempTheme.tempPath, '..', 'appserver', 'deploy');

	const {store} = project;

	store.deployPath = deployPath;
	store.webBundleDir = undefined;

	fs.emptyDirSync(deployPath);
});

afterEach(() => {
	cleanTempTheme(tempTheme);
	fs.removeSync(deployPath);
});

it('deploys to deploy server', done => {
	project.gulp.runSequence('deploy', err => {
		if (err) throw err;

		expect(fs.existsSync(path.join(deployPath, 'base-theme.war'))).toBe(
			true
		);

		done();
	});
});
