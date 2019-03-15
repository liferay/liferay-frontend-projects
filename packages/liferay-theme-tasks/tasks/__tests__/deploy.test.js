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

let deployPath;
let runSequence;
let tempPath;

function getDependency(name) {
	return path.dirname(require.resolve(path.join(name, 'package.json')));
}

beforeAll(() => {
	process.env.LIFERAY_THEME_STYLED_PATH = getDependency(
		'liferay-frontend-theme-styled'
	);
	process.env.LIFERAY_THEME_UNSTYLED_PATH = getDependency(
		'liferay-frontend-theme-unstyled'
	);
});

afterAll(() => {
	delete process.env.LIFERAY_THEME_STYLED_PATH;
	delete process.env.LIFERAY_THEME_UNSTYLED_PATH;
});

beforeEach(() => {
	const config = testUtil.copyTempTheme({
		namespace: 'deploy_task',
		registerTasks: true,
		themeName: 'base-theme-7-2',
		version: '7.2',
	});

	runSequence = config.runSequence;
	tempPath = config.tempPath;

	deployPath = path.join(tempPath, '../appserver/deploy');

	const store = config.gulp.storage;

	store.set('deployPath', deployPath);
	store.set('webBundleDir');

	fs.mkdirsSync(deployPath);
});

afterEach(() => {
	testUtil.cleanTempTheme('base-theme-7-2', '7.2', 'deploy_task', initCwd);
	del.sync(path.join(deployPath, '**'), {
		force: true,
	});
});

it('should deploy to deploy server', done => {
	runSequence('deploy', err => {
		if (err) throw err;

		expect(fs.existsSync(path.join(deployPath, 'base-theme.war'))).toBe(
			true
		);

		done();
	});
});
