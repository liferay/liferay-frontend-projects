'use strict';

var chai = require('chai');
var fs = require('fs-extra');
var gulp = require('gulp');
var os = require('os');
var parseString = require('xml2js').parseString;
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

		gulp.start('build:base', function(err) {
			if (err) throw err;

			assert.isDirectory(instance._buildPath);

			gulp.start('build:clean', function(err) {
				if (err) throw err;

				if (fs.existsSync(instance._buildPath)) {
					throw new Error('Build path should not exist');
				}

				done();
			});
		});
	});

	it('should build files from Styled theme to /build', function(done) {
		var instance = this;

		gulp.start('build:base', function(err) {
			if (err) throw err;

			assert.isDirectory(instance._buildPath);

			done();
		});
	});

	it('should build custom.css file from /src to /build', function(done) {
		var instance = this;

		gulp.start('build:src', function(err) {
			if (err) throw err;

			var customCSSPath = path.join(instance._buildPath, 'css/_custom.scss');

			assert.fileContent(customCSSPath, '/* inject:imports */\n/* endinject */\n\n/* _custom.scss */');

			assert.isFile(path.join(instance._buildPath, 'css/base/_text.scss'));
			assert.isFile(path.join(instance._buildPath, 'js/main.js'));

			done();
		});
	});

	it('should build /WEB-INF', function(done) {
		var instance = this;

		gulp.start('build:web-inf', function(err) {
			if (err) throw err;

			var pathWebInf = path.join(instance._buildPath, 'WEB-INF');

			assert.isDirectory(pathWebInf);

			assert.isFile(path.join(pathWebInf, 'liferay-plugin-package.properties'));

			done();
		});
	});

	it('should build process liferay-hook.xml', function(done) {
		var instance = this;

		gulp.start('build:hook', function(err) {
			if (err) throw err;

			var hookPath = path.join(instance._buildPath, 'WEB-INF', 'liferay-hook.xml.processed');

			assert.isFile(hookPath);

			var liferayHookXML = fs.readFileSync(hookPath, {
				encoding: 'utf8'
			});

			parseString(liferayHookXML, function(err, result) {
				if (err) throw err;

				assert.deepEqual(
					['content/Language_en.properties', 'content/Language_es.properties'],
					result.hook['language-properties']
				);

				done();
			});
		});
	});

	it('should copy static files to their correct themelet location and inject imports into base theme files', function(done) {
		var instance = this;

		gulp.start('build:themelets', function(err) {
			if (err) throw err;

			assert.isFile(path.join(instance._buildPath, 'css/themelets/test-themelet/_custom.scss'));
			assert.isFile(path.join(instance._buildPath, 'images/themelets/test-themelet/icon.png'));
			assert.isFile(path.join(instance._buildPath, 'js/themelets/test-themelet/main.js'));
			assert.isFile(path.join(instance._buildPath, 'templates/themelets/test-themelet/freemarker.ftl'));
			assert.isFile(path.join(instance._buildPath, 'templates/themelets/test-themelet/velocity.vm'));

			assert.fileContentMatch(path.join(instance._buildPath, 'css/_custom.scss'), /@import "themelets\/test-themelet\/_custom\.scss";/);
			assert.fileContentMatch(path.join(instance._buildPath, 'templates/portal_normal.ftl'), /<script src="\/base-theme\/js\/themelets\/test-themelet\/main.js"><\/script>/);

			done();
		});
	});

	it('should rename css/ directory to _css/', function(done) {
		var instance = this;

		gulp.start('build:rename-css-dir', function(err) {
			if (err) throw err;

			assert.isDirectory(path.join(instance._buildPath, '_css'));

			done();
		});
	});

	it('should compile sass to css', function(done) {
		var instance = this;

		this.timeout(10000);

		gulp.start('build:compile-css', function(err) {
			if (err) throw err;

			done();
		});
	});

	it('should move all compiled css to css/ directory', function(done) {
		var instance = this;

		gulp.start('build:move-compiled-css', function(err) {
			if (err) throw err;

			assert.isDirectory(path.join(instance._buildPath, 'css'));

			done();
		});
	});

	it('should remove _css/ directory', function(done) {
		var instance = this;

		gulp.start('build:remove-old-css-dir', function(err) {
			if (err) throw err;

			if (fs.existsSync(path.join(instance._buildPath, '_css'))) {
				throw new Error('_css directory should not exist');
			}

			done();
		});
	});

	it('should build .war file that matches name of the project', function(done) {
		var instance = this;

		gulp.start('build:war', function(err) {
			if (err) throw err;

			assert.isFile(path.join(instance._tempPath, 'dist/base-theme.war'));

			done();
		});
	});
});
