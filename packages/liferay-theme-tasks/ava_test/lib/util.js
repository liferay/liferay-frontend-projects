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
