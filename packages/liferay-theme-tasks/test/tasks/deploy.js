'use strict';

var chai = require('chai');
var fs = require('fs-extra');
var gulp = require('gulp');
var os = require('os');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var registerTasks = require('../../index.js').registerTasks;
var runSequence;

var assert = chai.assert;
chai.use(require('chai-fs'));

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', '7.0', 'base-theme');

var deployPath = path.join(tempPath, '../appserver/deploy');

describe('Deploy Tasks', function() {
	before(function(done) {
		this.timeout(10000);

		var instance = this;

		instance._initCwd = process.cwd();

		fs.copy(path.join(__dirname, '../fixtures/themes/7.0/base-theme'), tempPath, function (err) {
			if (err) throw err;

			process.chdir(tempPath);

			instance._buildPath = path.join(tempPath, 'build');
			instance._tempPath = tempPath;

			registerTasks({
				gulp: gulp,
				pathSrc: './custom_src_path',
				rubySass: false
			});

			runSequence = require('run-sequence').use(gulp);

			var liferayThemeJson = path.join(tempPath, 'liferay-theme.json');

			var store = gulp.storage;

			store.set('deployPath', deployPath);

			fs.mkdirsSync(deployPath);

			done();
		});
	});

	after(function() {
		fs.removeSync(deployPath);
		fs.removeSync(tempPath);

		process.chdir(this._initCwd);
	});

	it('should deploy to deploy server', function(done) {
		var instance = this;

		this.timeout(10000);

		runSequence('deploy', function(err) {
			if (err) throw err;

			assert.isFile(path.join(deployPath, 'base-theme.war'));

			done();
		});
	});
});
