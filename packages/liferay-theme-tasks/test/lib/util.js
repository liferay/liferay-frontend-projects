'use strict';

var os = require('os');
var path = require('path');
var test = require('ava');

var testUtil = require('../util.js');
var util;

var cssBuild = 'build/_css';

var changedFile;
var tempPath;
var utilConfig;

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'util'
	}, function(config) {
		tempPath = config.tempPath;

		util = require('../../lib/util');

		changedFile = {
			path: path.join(tempPath, 'src/css/_custom.scss'),
			type: 'changed'
		};

		utilConfig = {
			changedFile: changedFile,
			deployed: true,
			version: '7.0'
		};

		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'util');
});

test('getCssSrcPath should return original src path if version is not equal to 6.2', function(t) {
	var originalSrcPath = path.join(cssBuild, '*.scss');

	var srcPath = util.getCssSrcPath(originalSrcPath, utilConfig);

	t.is(originalSrcPath, srcPath);
});

test('getCssSrcPath should return file specific src path if version is 6.2 and changed file is not a sass partial', function(t) {
	utilConfig.changedFile.path = path.join(tempPath, 'src/css/_aui_variables.scss');
	utilConfig.version = '6.2';

	var originalSrcPath = path.join(cssBuild, '*.scss');

	var srcPath = util.getCssSrcPath(originalSrcPath, utilConfig);

	t.is(originalSrcPath, srcPath);

	utilConfig.changedFile.path = path.join(tempPath, 'src/css/custom.css');

	srcPath = util.getCssSrcPath(originalSrcPath, utilConfig);

	t.is(srcPath, path.join('build/_css/custom.scss'));
});

test('isCssFile should only return true if css file', function(t) {
	t.true(util.isCssFile('custom.css'));
	t.true(!util.isCssFile('main.js'));
});

test('isSassPartial should return true for partial scss file names', function(t) {
	t.true(util.isSassPartial('_partial.scss'));
	t.true(!util.isSassPartial('main.scss'));
});

test('requireDependency should return dependency', function(t) {
	var unstyled = util.requireDependency('liferay-frontend-theme-unstyled', '7.0');

	t.truthy(unstyled);
});

test('resolveDependency should return resolved path of dependency', function(t) {
	var unstyledPath = util.resolveDependency('liferay-frontend-theme-unstyled', '7.0');

	t.truthy(unstyledPath);

	var styledPath = util.resolveDependency('liferay-frontend-theme-styled', '7.0');

	t.truthy(styledPath);
	t.truthy(!/liferay-theme-deps-7\.0/.test(styledPath));
});

test('_getCustomDependencyPath should return custom dependency paths set in node env variables', function(t) {
	var CUSTOM_STYLED_PATH = path.join(process.cwd(), 'node_modules/liferay-frontend-theme-styled');
	var STYLED = 'liferay-frontend-theme-styled';
	var UNSTYLED = 'liferay-frontend-theme-unstyled';

	var customDependencyPath = util._getCustomDependencyPath(UNSTYLED);

	t.true(!customDependencyPath);

	process.env['LIFERAY_THEME_STYLED_PATH'] = CUSTOM_STYLED_PATH;

	customDependencyPath = util._getCustomDependencyPath(STYLED);

	t.is(customDependencyPath, CUSTOM_STYLED_PATH);

	process.env['LIFERAY_THEME_STYLED_PATH'] = 'does/not/exist';

	t.throws(function() {
		util._getCustomDependencyPath(STYLED);
	});
});

test('_getDepsPath should return preset path or cwd of theme if dependency is explicitly defined in dependencies', function(t) {
	var depsPath = util._getDepsPath({
		dependencies: {}
	}, 'liferay-frontend-theme-styled', '7.0');

	t.is(path.basename(depsPath), 'liferay-theme-deps-7.0');

	depsPath = util._getDepsPath({
		dependencies: {
			'liferay-frontend-theme-styled': '2.0.1'
		}
	}, 'liferay-frontend-theme-styled', '7.0');

	t.is(path.basename(depsPath), 'base-theme');
});

test('_hasDependency should return truthy value if dependency is defined in either dependencies or devDependencies', function(t) {
	var dependency = util._hasDependency({}, 'test-package');

	t.true(!dependency);

	dependency = util._hasDependency({
		dependencies: {
			'test-package': '*'
		}
	}, 'test-package');

	t.truthy(dependency);

	dependency = util._hasDependency({
		devDependencies: {
			'test-package': '*'
		}
	}, 'test-package');

	t.truthy(dependency);
});

test('_validateCustomDependencyPath should throw error if customPath does not exist or is not a directory', function(t) {
	t.notThrows(function() {
		util._validateCustomDependencyPath(process.cwd());
	});

	t.throws(function() {
		util._validateCustomDependencyPath(path.join(process.cwd(), 'package.json'));
	}, /is not a directory/);

	t.throws(function() {
		util._validateCustomDependencyPath('does/not/exist');
	}, /no such file or directory/);
});
