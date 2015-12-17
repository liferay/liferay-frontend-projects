'use strict';

var _ = require('lodash');
var chai = require('chai');
var fs = require('fs-extra');
var os = require('os');
var path = require('path');
var util = require('../../lib/util.js');

var assert = chai.assert;
chai.use(require('chai-fs'));

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', 'base-theme');

describe('Util functions', function() {
	it('should return correct src paths depending on deployed status/changed file', function(done) {
		var originalSrcPath = 'src/css/**/*';

		var srcPath = util.getSrcPath(originalSrcPath, {
			deployed: true
		});

		assert.equal(srcPath, originalSrcPath);

		var changedFile = {
			type: 'changed',
			path: path.join(tempPath, 'src/css/custom.css')
		};

		srcPath = util.getSrcPath(originalSrcPath, {
			changedFile: changedFile,
			deployed: true
		});

		assert.equal(path.join(tempPath, 'src/css/custom.css'), srcPath);

		srcPath = util.getSrcPath(originalSrcPath, {
			changedFile: changedFile,
			deployed: true
		}, function(changedFileName) {
			assert.equal(changedFileName, 'custom.css');

			return false;
		});

		assert.equal(srcPath, originalSrcPath);

		srcPath = util.getSrcPath(originalSrcPath, {
			changedFile: changedFile,
			deployed: true,
			version: '6.2'
		});

		assert.equal(srcPath, 'src/css/**/custom.scss');

		srcPath = util.getSrcPath(originalSrcPath, {
			changedFile: changedFile,
			cssExtChanged: false,
			deployed: true,
			version: '6.2'
		});

		assert.equal(srcPath, 'src/css/**/custom.css');

		changedFile.path = path.join(tempPath, 'src/css/aui/_variables.scss');

		srcPath = util.getSrcPath(originalSrcPath, {
			changedFile: changedFile,
			cssExtChanged: false,
			deployed: true,
			version: '6.2'
		});

		assert.equal(srcPath, originalSrcPath);

		srcPath = util.getSrcPath(originalSrcPath, {
			changedFile: changedFile,
			cssExtChanged: false,
			deployed: true,
			version: '7.0'
		});

		assert.equal(srcPath, changedFile.path);

		srcPath = util.getSrcPath(originalSrcPath, {
			changedFile: changedFile,
			cssExtChanged: false,
			deployed: true,
			returnAllCSS: true,
			version: '7.0'
		});

		assert.equal(srcPath, 'src/css/**/*.+(css|scss)');

		done();
	});

	it('should only return true if css file', function(done) {
		assert(util.isCssFile('custom.css'));
		assert(!util.isCssFile('main.js'));

		done();
	});
});
