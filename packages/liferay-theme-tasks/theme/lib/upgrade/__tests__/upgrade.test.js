/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {Gulp} = require('gulp');
const path = require('path');

const project = require('../../../../lib/project');
const {cleanTempTheme, setupTempTheme} = require('../../../../lib/test/util');
const {registerTasks} = require('../../../../theme');

let tempTheme;

beforeEach(() => {
	tempTheme = setupTempTheme({
		init: () =>
			registerTasks({
				gulp: new Gulp(),
			}),
		namespace: 'upgrade_task_config',
		themeName: 'base-theme',
	});
});

afterEach(() => {
	cleanTempTheme(tempTheme);
});

it('upgrade:config', done => {
	project.gulp.runSequence('upgrade:config', err => {
		if (err) throw err;

		const themeConfig = project.themeConfig.config;

		expect(themeConfig.version).toBe('7.2');

		const lookAndFeelPath = path.join(
			tempTheme.tempPath,
			'src',
			'WEB-INF',
			'liferay-look-and-feel.xml'
		);
		const pluginPackagePropertiesPath = path.join(
			tempTheme.tempPath,
			'src',
			'WEB-INF',
			'liferay-plugin-package.properties'
		);

		expect(lookAndFeelPath).toBeFileMatching(/7\.2\.0/);
		expect(lookAndFeelPath).toBeFileMatching(/7_2_0/);
		expect(pluginPackagePropertiesPath).toBeFileMatching(/7\.2\.0\+/);

		expect(lookAndFeelPath).not.toBeFileMatching(/7\.1\.0/);
		expect(lookAndFeelPath).not.toBeFileMatching(/7_1_0/);
		expect(pluginPackagePropertiesPath).not.toBeFileMatching(/7\.1\.0/);

		done();
	});
});
