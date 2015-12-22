'use strict';

var chai = require('chai');
var fs = require('fs-extra');
var gulp = require('gulp');
var os = require('os');
var path = require('path');
var registerTasks = require('../../index.js').registerTasks;

var assert = chai.assert;
chai.use(require('chai-fs'));

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', 'base-theme');

describe('Build Tasks', function() {
	before(function(done) {
		this.timeout(10000);

		var instance = this;

		instance._initCwd = process.cwd();

		fs.copy(path.join(__dirname, '../assets/base-theme'), tempPath, function(err) {
			if (err) throw err;

			process.chdir(tempPath);

			instance._buildPath = path.join(tempPath, 'custom_build_path');
			instance._tempPath = tempPath;

			registerTasks({
				gulp: gulp,
				pathBuild: './custom_build_path',
				pathSrc: './custom_src_path',
				supportCompass: false
			});

			gulp.storage.set('deployed', true);

			console.log('Creating temp theme in', tempPath);

			done();
		});
	});

	after(function() {
		fs.removeSync(tempPath);

		process.chdir(this._initCwd);
	});

	it('should clean build directory', function(done) {
		var instance = this;

		var filePath = path.join(tempPath, 'custom_src_path/css/_custom.scss');
		var appServerPathTheme = path.join(tempPath, '../appserver/deploy/base-theme');

		gulp.storage.set({
			appServerPathTheme: appServerPathTheme,
			changedFile: {
				path: filePath,
				type: 'changed'
			},
			deployed: true
		});

		var fileContents = fs.readFileSync(filePath, 'utf8') + '\n\n/* this is the change */';

		fs.writeFileSync(filePath, fileContents, 'utf8');

		gulp.start('build:clean', function(err) {
			if (err) throw err;

			// TODO: assertions

			done();
		});
	});

	it('should build base files', function(done) {
		var instance = this;

		gulp.start('build:base', function(err) {
			if (err) throw err;

			// TODO: assertions

			done();
		});
	});

	it('should build src files', function(done) {
		var instance = this;

		gulp.start('build:src', function(err) {
			if (err) throw err;

			// TODO: assertions

			done();
		});
	});

	it('should build WEB-INF files', function(done) {
		var instance = this;

		gulp.start('build:web-inf', function(err) {
			if (err) throw err;

			// TODO: assertions

			done();
		});
	});

	it('should inject themelets', function(done) {
		var instance = this;

		gulp.start('build:themelets', function(err) {
			if (err) throw err;

			// TODO: assertions

			done();
		});
	});

	it('should rename css dir', function(done) {
		var instance = this;

		gulp.start('build:rename-css-dir', function(err) {
			if (err) throw err;

			// TODO: assertions

			done();
		});
	});

	it('should compile css files', function(done) {
		var instance = this;

		gulp.start('build:compile-css', function(err) {
			if (err) throw err;

			// TODO: assertions

			done();
		});
	});

	it('should move compiled css', function(done) {
		var instance = this;

		gulp.start('build:move-compiled-css', function(err) {
			if (err) throw err;

			// TODO: assertions

			done();
		});
	});

	it('should remove temp css directory', function(done) {
		var instance = this;

		gulp.start('build:remove-old-css-dir', function(err) {
			if (err) throw err;

			// TODO: assertions

			done();
		});
	});

	it('should deploy changed files', function(done) {
		var instance = this;

		gulp.start('deploy:fast', function(err) {
			if (err) throw err;

			// TODO: assertions

			done();
		});
	});
});
