/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

const testUtil = require('../../../test/util');
const lfrThemeConfig = require('../../liferay_theme_config.js');

const initCwd = process.cwd();

afterAll(() => {
	// Clean things on exit to avoid GulpStorage.save() errors because of left
	// over async operations when changing tests.
	['upgrade_task_config', 'upgrade_task_upgrade_templates'].forEach(
		namespace =>
			testUtil.cleanTempTheme('base-theme', '7.1', namespace, initCwd)
	);
});

describe('config', () => {
	let runSequence;
	let tempPath;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_config',
			themeName: 'base-theme',
			registerTasksOptions: {},
		});

		runSequence = config.runSequence;
		tempPath = config.tempPath;
	});

	it('upgrade:config', done => {
		runSequence('upgrade:config', err => {
			if (err) throw err;

			const themeConfig = lfrThemeConfig.getConfig();

			expect(themeConfig.version).toBe('7.2');

			const lookAndFeelPath = path.join(
				tempPath,
				'src/WEB-INF/liferay-look-and-feel.xml'
			);
			const pluginPackagePropertiesPath = path.join(
				tempPath,
				'src/WEB-INF/liferay-plugin-package.properties'
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
});
