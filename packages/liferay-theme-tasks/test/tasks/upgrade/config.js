'use strict';

let chai = require('chai');
let del = require('del');
let path = require('path');
let test = require('ava');

let assert = chai.assert;

chai.use(require('chai-fs'));

let lfrThemeConfig = require('../../../lib/liferay_theme_config.js');
let testUtil = require('../../util');

let runSequence;
let tempPath;

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'upgrade_task_config',
			themeName: 'upgrade-theme',
			version: '6.2',
			registerTasksOptions: {
				pathSrc: 'src',
				rubySass: true,
			},
		},
		function(config) {
			runSequence = config.runSequence;
			tempPath = config.tempPath;

			t.end();
		}
	);
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('upgrade-theme', '6.2', 'upgrade_task_config');

	del.sync(path.join(initCwd, 'tmp', '**'));
});

test.cb('upgrade:config', function(t) {
	runSequence('upgrade:config', function(err) {
		if (err) throw err;

		let themeConfig = lfrThemeConfig.getConfig();

		t.is(themeConfig.version, '7.0');
		t.is(themeConfig.rubySass, false);

		let lookAndFeelPath = path.join(
			tempPath,
			'src/WEB-INF/liferay-look-and-feel.xml'
		);
		let pluginPackagePropertiesPath = path.join(
			tempPath,
			'src/WEB-INF/liferay-plugin-package.properties'
		);

		assert.fileContentMatch(lookAndFeelPath, /7\.0\.0/);
		assert.fileContentMatch(lookAndFeelPath, /7_0_0/);
		assert.fileContentMatch(pluginPackagePropertiesPath, /7\.0\.0\+/);

		assert.notFileContentMatch(lookAndFeelPath, /6\.2\.0/);
		assert.notFileContentMatch(lookAndFeelPath, /6_2_0/);
		assert.notFileContentMatch(pluginPackagePropertiesPath, /6\.2\.0/);

		t.end();
	});
});
