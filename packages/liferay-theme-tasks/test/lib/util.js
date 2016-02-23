'use strict';

var _ = require('lodash');
var chai = require('chai');
var fs = require('fs-extra');
var os = require('os');
var path = require('path');
var util = require('../../lib/util.js');

var assert = chai.assert;
chai.use(require('chai-fs'));

var cssBuild = 'build/_css';

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', 'base-theme');

describe('Util functions', function() {
	describe('getCssSrcPath', function() {
		var changedFile = {
			path: path.join(tempPath, 'src/css/_custom.scss'),
			type: 'changed'
		};

		var config = {
			changedFile: changedFile,
			deployed: true,
			version: '7.0'
		};

		it('should return original src path if version is not equal to 6.2', function(done) {
			var originalSrcPath = path.join(cssBuild, '*.scss');

			var srcPath = util.getCssSrcPath(originalSrcPath, config);

			assert.equal(originalSrcPath, srcPath);

			done();
		});

		it('should return file specific src path if version is 6.2 and changed file is not a sass partial', function(done) {
			config.changedFile.path = path.join(tempPath, 'src/css/_aui_variables.scss');
			config.version = '6.2';

			var originalSrcPath = path.join(cssBuild, '*.scss');

			var srcPath = util.getCssSrcPath(originalSrcPath, config);

			assert.equal(originalSrcPath, srcPath);

			config.changedFile.path = path.join(tempPath, 'src/css/custom.css');

			srcPath = util.getCssSrcPath(originalSrcPath, config);

			assert.equal(srcPath, 'build/_css/custom.scss');

			done();
		});
	});

	describe('isCssFile', function() {
		it('should only return true if css file', function(done) {
			assert(util.isCssFile('custom.css'));
			assert(!util.isCssFile('main.js'));

			done();
		});
	});
});
