'use strict';

var chai = require('chai');
var del = require('del');
var fs = require('fs-extra');
var Gulp = require('gulp').Gulp;
var path = require('path');
var registerTasks = require('../../index.js').registerTasks;
var runSequence;

var assert = chai.assert;
var expect = chai.expect;
chai.use(require('chai-fs'));

var gulp = new Gulp();

var tempDirPath = path.join(process.cwd(), 'test/tmp');

var tempPath = path.join(tempDirPath, 'base-theme');

describe('Watch Task', function() {
	before(function(done) {
		this.timeout(10000);

		var instance = this;

		instance._initCwd = process.cwd();

		fs.copy(path.join(__dirname, '../fixtures/themes/7.0/base-theme'), tempPath, function(err) {
			if (err) throw err;

			process.chdir(tempPath);

			instance._buildPath = path.join(tempPath, 'custom_build_path');
			instance._tempPath = tempPath;

			registerTasks({
				gulp: gulp,
				pathBuild: './custom_build_path',
				pathSrc: './custom_src_path',
				rubySass: false
			});

			runSequence = require('run-sequence').use(gulp);

			var appServerPathTheme = path.join(tempPath, '../appserver/webapps/base-theme');

			instance._appServerPathTheme = appServerPathTheme;

			gulp.storage.set({
				appServerPathTheme: appServerPathTheme,
				deployed: true
			});

			console.log('Creating temp theme in', tempPath);

			done();
		});
	});

	beforeEach(function(done) {
		del([this._appServerPathTheme], {
			force: true
		}, done);
	});

	after(function() {
		fs.removeSync(tempDirPath);

		process.chdir(this._initCwd);
	});

	it('should deploy css files correctly on change', function(done) {
		this.timeout(6000);

		var instance = this;

		var filePath = path.join(tempPath, 'custom_src_path/css/_custom.scss');

		setChangedFile(filePath);

		var fileContents = fs.readFileSync(filePath, 'utf8') + '\n\n/* this is the change */';

		fs.writeFileSync(filePath, fileContents, 'utf8');

		runCssWatchSequence(function() {
			var appServerPathTheme = instance._appServerPathTheme;
			var cssDir = path.join(appServerPathTheme, 'css');

			assert.isFile(path.join(cssDir, 'main.css'));
			assert.isFile(path.join(cssDir, 'aui.css'));

			var regex = /\/\* this is the change \*\//;

			assert.fileContentMatch(path.join(cssDir, 'main.css'), regex);

			expect(function() {
				fs.statSync(path.join(appServerPathTheme, 'js'));
			}).to.throw(/no such file or directory/);

			done();
		});
	});

	it('should deploy js files correctly on change', function(done) {
		this.timeout(6000);

		var instance = this;

		var filePath = path.join(tempPath, 'custom_src_path/js/main.js');

		setChangedFile(filePath);

		runJsWatchSequence(function() {
			var appServerPathTheme = instance._appServerPathTheme;
			var jsDir = path.join(appServerPathTheme, 'js');

			var deployedFilePath = path.join(jsDir, 'main.js');

			assert.isFile(deployedFilePath);

			var regex = /console\.log\(\'main\.js\'\);/;

			assert.fileContentMatch(deployedFilePath, regex);

			expect(function() {
				fs.statSync(path.join(appServerPathTheme, 'css'));
			}).to.throw(/no such file or directory/);

			done();
		});
	});
});

function runCssWatchSequence(cb) {
	var taskArray = [
		'build:clean',
		'build:base',
		'build:src',
		'build:themelets',
		'build:themelet-css',
		'build:themelet-css-inject',
		'build:rename-css-dir',
		'build:prep-css',
		'build:compile-css',
		'build:move-compiled-css',
		'build:remove-old-css-dir',
		'deploy:css-files'
	];

	runWatchSequence(taskArray, cb);
}

function runJsWatchSequence(cb) {
	var taskArray = ['deploy:file'];

	runWatchSequence(taskArray, cb);
}

function runWatchSequence(taskArray, cb) {
	taskArray.push(cb);

	runSequence.apply(this, taskArray);
}

function setChangedFile(filePath) {
	gulp.storage.set('changedFile', {
		path: filePath,
		type: 'changed'
	});
}
