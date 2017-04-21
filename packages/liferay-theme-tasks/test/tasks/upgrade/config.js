'use strict';

var chai = require('chai');
var del = require('del');
var path = require('path');
var test = require('ava');

var assert = chai.assert;
chai.use(require('chai-fs'));

var lfrThemeConfig = require('../../../lib/liferay_theme_config.js');
var testUtil = require('../../util');

var runSequence;
var tempPath;

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'upgrade_task_config',
		themeName: 'upgrade-theme',
		version: '6.2',
		registerTasksOptions: {
			pathSrc: 'src',
			rubySass: true
		}
	}, function(config) {
		runSequence = config.runSequence;
		tempPath = config.tempPath;

		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('upgrade-theme', '6.2', 'upgrade_task_config');

	del.sync(path.join(initCwd, 'tmp', '**'));
});

test.cb('upgrade:config', function(t) {
	runSequence('upgrade:config', function(err) {
		if (err) throw err;

		var themeConfig = lfrThemeConfig.getConfig();

		t.is(themeConfig.version, '7.0');
		t.is(themeConfig.rubySass, false);

		var lookAndFeelPath = path.join(tempPath, 'src/WEB-INF/liferay-look-and-feel.xml');
		var pluginPackagePropertiesPath = path.join(tempPath, 'src/WEB-INF/liferay-plugin-package.properties');

		assert.fileContentMatch(lookAndFeelPath, /7\.0\.0/);
		assert.fileContentMatch(lookAndFeelPath, /7_0_0/);
		assert.fileContentMatch(pluginPackagePropertiesPath, /7\.0\.0\+/);

		assert.notFileContentMatch(lookAndFeelPath, /6\.2\.0/);
		assert.notFileContentMatch(lookAndFeelPath, /6_2_0/);
		assert.notFileContentMatch(pluginPackagePropertiesPath, /6\.2\.0/);

		t.end();
	});
});