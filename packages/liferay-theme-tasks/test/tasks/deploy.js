'use strict';

var chai = require('chai');
var del = require('del');
var fs = require('fs-extra');
var Gulp = require('gulp').Gulp;
var os = require('os');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var registerTasks;
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

			registerTasks = require('../../index.js').registerTasks;

			var gulp = new Gulp();

			registerTasks({
				distName: 'base-theme',
				pathBuild: './custom_build_path',
				gulp: gulp,
				pathSrc: './custom_src_path',
				rubySass: false
			});

			runSequence = require('run-sequence').use(gulp);

			var store = gulp.storage;

			store.set('deployPath', deployPath);

			fs.mkdirsSync(deployPath);

			done();
		});
	});

	after(function(done) {
		var instance = this;

		del([path.join(tempPath, '**'), path.join(deployPath, '**')], {
			force: true
		}, function() {
			process.chdir(instance._initCwd);

			done();
		});
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
