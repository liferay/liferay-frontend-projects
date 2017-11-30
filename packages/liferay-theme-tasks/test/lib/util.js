'use strict';

let os = require('os');
let path = require('path');
let test = require('ava');

let testUtil = require('../util.js');
let util;

let cssBuild = 'build/_css';

let changedFile;
let tempPath;
let utilConfig;

let initCwd = process.cwd();

let themeName = 'explicit-dependency-theme';

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'util',
			themeName: themeName,
		},
		function(config) {
			tempPath = config.tempPath;

			util = require('../../lib/util');

			changedFile = {
				path: path.join(tempPath, 'src/css/_custom.scss'),
				type: 'changed',
			};

			utilConfig = {
				changedFile: changedFile,
				deployed: true,
				version: '7.0',
			};

			t.end();
		}
	);
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme(themeName, '7.0', 'util');
});

test('isCssFile should only return true if css file', function(t) {
	t.true(util.isCssFile('custom.css'));
	t.true(!util.isCssFile('main.js'));
});

test('isSassPartial should return true for partial scss file names', function(
	t
) {
	t.true(util.isSassPartial('_partial.scss'));
	t.true(!util.isSassPartial('main.scss'));
});

test('requireDependency should return dependency', function(t) {
	let unstyled = util.requireDependency(
		'liferay-frontend-theme-unstyled',
		'7.0'
	);

	t.truthy(unstyled);
});

test('resolveDependency should return resolved path of dependency', function(
	t
) {
	let unstyledPath = util.resolveDependency(
		'liferay-frontend-theme-unstyled',
		'7.0'
	);

	t.truthy(unstyledPath);

	let styledPath = util.resolveDependency(
		'liferay-frontend-theme-styled',
		'7.0'
	);

	t.truthy(styledPath);
	t.truthy(!/liferay-theme-deps-7\.0/.test(styledPath));
});

test('_getCustomDependencyPath should return custom dependency paths set in node env variables', function(
	t
) {
	let CUSTOM_STYLED_PATH = path.join(
		process.cwd(),
		'node_modules/liferay-frontend-theme-styled'
	);
	let STYLED = 'liferay-frontend-theme-styled';
	let UNSTYLED = 'liferay-frontend-theme-unstyled';

	let customDependencyPath = util._getCustomDependencyPath(UNSTYLED);

	t.true(!customDependencyPath);

	process.env['LIFERAY_THEME_STYLED_PATH'] = CUSTOM_STYLED_PATH;

	customDependencyPath = util._getCustomDependencyPath(STYLED);

	t.is(customDependencyPath, CUSTOM_STYLED_PATH);

	process.env['LIFERAY_THEME_STYLED_PATH'] = 'does/not/exist';

	t.throws(function() {
		util._getCustomDependencyPath(STYLED);
	});
});

test('_getDepsPath should return preset path or cwd of theme if dependency is explicitly defined in dependencies', function(
	t
) {
	let depsPath = util._getDepsPath(
		{
			dependencies: {},
		},
		'liferay-frontend-theme-styled',
		'7.0'
	);

	t.is(path.basename(depsPath), 'liferay-theme-deps-7.0');

	depsPath = util._getDepsPath(
		{
			dependencies: {
				'liferay-frontend-theme-styled': '2.0.1',
			},
		},
		'liferay-frontend-theme-styled',
		'7.0'
	);

	t.is(path.basename(depsPath), themeName);
});

test('_hasDependency should return truthy value if dependency is defined in either dependencies or devDependencies', function(
	t
) {
	let dependency = util._hasDependency({}, 'test-package');

	t.true(!dependency);

	dependency = util._hasDependency(
		{
			dependencies: {
				'test-package': '*',
			},
		},
		'test-package'
	);

	t.truthy(dependency);

	dependency = util._hasDependency(
		{
			devDependencies: {
				'test-package': '*',
			},
		},
		'test-package'
	);

	t.truthy(dependency);
});

test('_validateCustomDependencyPath should throw error if customPath does not exist or is not a directory', function(
	t
) {
	t.notThrows(function() {
		util._validateCustomDependencyPath(process.cwd());
	});

	t.throws(function() {
		util._validateCustomDependencyPath(
			path.join(process.cwd(), 'package.json')
		);
	}, /is not a directory/);

	t.throws(function() {
		util._validateCustomDependencyPath('does/not/exist');
	}, /no such file or directory/);
});
