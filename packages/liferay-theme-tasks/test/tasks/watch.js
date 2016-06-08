'use strict';

var chai = require('chai');
var del = require('del');
var fs = require('fs-extra');
var Gulp = require('gulp').Gulp;
var path = require('path');

var testUtil = require('../util');

var registerTasks;
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

			testUtil.deleteJsFromCache();

			registerTasks = require('../../index.js').registerTasks;

			registerTasks({
				gulp: gulp,
				gogoShellConfig: {
					host: '0.0.0.0',
					port: 1337
				},
				pathBuild: './custom_build_path',
				pathSrc: './custom_src_path',
				rubySass: false
			});

			runSequence = require('run-sequence').use(gulp);

			var appServerPathPlugin = path.join(tempPath, '../appserver/webapps/base-theme');

			instance._appServerPathPlugin = appServerPathPlugin;

			gulp.storage.set({
				appServerPathPlugin: appServerPathPlugin,
				deployed: true
			});

			console.log('Creating temp theme in', tempPath);

			done();
		});
	});

	beforeEach(function(done) {
		del([this._appServerPathPlugin], {
			force: true
		}, done);
	});

	after(function() {
		del.sync(path.join(tempPath, '**'), {
			force: true
		});

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
			var appServerPathPlugin = instance._appServerPathPlugin;
			var cssDir = path.join(appServerPathPlugin, 'css');

			assert.isFile(path.join(cssDir, 'main.css'));
			assert.isFile(path.join(cssDir, 'aui.css'));

			var regex = /\/\* this is the change \*\//;

			assert.fileContentMatch(path.join(cssDir, 'main.css'), regex);

			expect(function() {
				fs.statSync(path.join(appServerPathPlugin, 'js'));
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
			var appServerPathPlugin = instance._appServerPathPlugin;
			var jsDir = path.join(appServerPathPlugin, 'js');

			var deployedFilePath = path.join(jsDir, 'main.js');

			assert.isFile(deployedFilePath);

			var regex = /console\.log\(\'main\.js\'\);/;

			assert.fileContentMatch(deployedFilePath, regex);

			expect(function() {
				fs.statSync(path.join(appServerPathPlugin, 'css'));
			}).to.throw(/no such file or directory/);

			done();
		});
	});

	it('should deploy template files corrently on change', function(done) {
		this.timeout(6000);

		var instance = this;

		var filePath = path.join(tempPath, 'custom_src_path/templates/portal_normal.ftl');

		setChangedFile(filePath);

		var appServerPathPlugin = instance._appServerPathPlugin;
		var templatesDir = path.join(appServerPathPlugin, 'templates');

		var deployedFilePath = path.join(templatesDir, 'portal_normal.ftl');

		runTemplateWatchSequence(function() {
			assert.isFile(deployedFilePath);

			var deployedFileContent = fs.readFileSync(deployedFilePath, {
				encoding: 'utf8'
			});

			assert(/<script src="\${theme_display.getPathThemeRoot\(\)}\/themelets\/test-themelet\/js\/main\.js"><\/script>/.test(deployedFileContent), 'themelet js got injected');

			done();
		});
	});

	it('should start watch socket', function(done) {
		this.timeout(6000);

		var GogoShellHelper = require('gogo-shell-helper');

		var helper = GogoShellHelper.start({
			host: '0.0.0.0',
			port: 1337,
			commands: [
				{
					command: 'install webbundledir:',
					response: 'Bundle ID: 321'
				},
				{
					command: 'start'
				},
				{
					command: 'stop'
				},
				{
					command: 'uninstall'
				},
				{
					command: 'lb -u | grep',
					response: '123|Active|1|install webbundle:file///path/to/base-theme.war'
				}
			]
		});

		var watch = gulp.watch;

		gulp.watch = function() {
			assert.equal(arguments[0], 'custom_src_path/**/*');

			var watchCallback = arguments[1];

			var webBundleBuild = path.join(tempPath, '.web_bundle_build');

			assert.notIsEmptyDirectory(webBundleBuild);
			assert.notIsEmptyDirectory(webBundleBuild, 'css');
			assert.notIsEmptyDirectory(webBundleBuild, 'images');
			assert.notIsEmptyDirectory(webBundleBuild, 'js');
			assert.notIsEmptyDirectory(webBundleBuild, 'templates');
			assert.notIsEmptyDirectory(webBundleBuild, 'themelets');
			assert.notIsEmptyDirectory(webBundleBuild, 'WEB-INF');

			gulp.watch = watch;

			try {
				helper.close(function() {
					done();
				});
			}
			catch (e) {
				done();
			}
		};

		runSequence('watch', function() {
			console.log('watching');
		});
	});
});

function runCssWatchSequence(cb) {
	var taskArray = [
		'build:clean',
		'build:base',
		'build:src',
		'build:themelet-src',
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

function runTemplateWatchSequence(cb) {
	var taskArray = ['build:src', 'build:themelet-src', 'build:themelet-js-inject', 'deploy:folder'];

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
