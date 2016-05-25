'use strict';

var _ = require('lodash');
var chai = require('chai');
var fs = require('fs-extra');
var Gulp = require('gulp').Gulp;
var os = require('os');
var parseString = require('xml2js').parseString;
var path = require('path');
var runSequence;

var gulp;

var assert = chai.assert;
chai.use(require('chai-fs'));

var SASS_COMPILE_TIMEOUT = 20000;

function createBuildTests(version, rubySass) {
	return function() {
		var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', version, 'base-theme');

		var customCSSFileName = getCssFileName(version);

		gulp = new Gulp();

		before(function(done) {
			this.timeout(10000);

			var instance = this;

			instance._initCwd = process.cwd();

			fs.copy(path.join(__dirname, '../fixtures/themes', version, 'base-theme'), tempPath, function(err) {
				if (err) throw err;

				process.chdir(tempPath);

				var lfrThemeConfig = require('../../lib/liferay_theme_config.js');

				lfrThemeConfig.setConfig({
					rubySass: rubySass
				});

				instance._buildPath = path.join(tempPath, 'custom_build_path');
				instance._tempPath = tempPath;

				deleteJsFromCache();

				var registerTasks = require('../../index.js').registerTasks;

				registerTasks({
					distName: lfrThemeConfig.getConfig(true).name,
					gulp: gulp,
					pathBuild: './custom_build_path',
					pathSrc: './custom_src_path',
					rubySass: rubySass
				});

				runSequence = require('run-sequence').use(gulp);

				console.log('Creating temp theme in', tempPath);

				done();
			});
		});

		after(function() {
			fs.removeSync(tempPath);

			deleteJsFromCache();

			process.chdir(this._initCwd);
		});

		it('should clean build directory', function(done) {
			this.timeout(6000);

			var instance = this;

			runSequence('build:base', function(err) {
				if (err) throw err;

				assert.isDirectory(instance._buildPath);

				runSequence('build:clean', function(err) {
					if (err) throw err;

					if (fs.existsSync(instance._buildPath)) {
						throw new Error('Build path should not exist');
					}

					done();
				});
			});
		});

		it('should build files from Styled theme to /build', function(done) {
			this.timeout(6000);

			var instance = this;

			runSequence('build:base', function(err) {
				if (err) throw err;

				assert.isDirectory(instance._buildPath);

				done();
			});
		});

		it('should build custom.css file from /src to /build', function(done) {
			var instance = this;

			runSequence('build:src', function(err) {
				if (err) throw err;

				var customCSSPath = path.join(instance._buildPath, 'css', customCSSFileName);

				assert.fileContent(customCSSPath, '/* inject:imports */\n/* endinject */\n\n/* ' + customCSSFileName + ' */');

				assert.isFile(path.join(instance._buildPath, 'css/base/_text.scss'));
				assert.isFile(path.join(instance._buildPath, 'js/main.js'));

				done();
			});
		});

		it('should build /WEB-INF', function(done) {
			var instance = this;

			runSequence('build:web-inf', function(err) {
				if (err) throw err;

				var pathWebInf = path.join(instance._buildPath, 'WEB-INF');

				assert.isDirectory(pathWebInf);

				assert.isFile(path.join(pathWebInf, 'liferay-plugin-package.properties'));

				done();
			});
		});

		it('should build process liferay-hook.xml', function(done) {
			var instance = this;

			runSequence('build:hook', function(err) {
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

			runSequence('build:themelets', function(err) {
				if (err) throw err;

				assert.isFile(path.join(instance._buildPath, 'themelets/test-themelet/css/_custom.scss'));
				assert.isFile(path.join(instance._buildPath, 'themelets/test-themelet/images/icon.png'));
				assert.isFile(path.join(instance._buildPath, 'themelets/test-themelet/js/main.js'));
				assert.isFile(path.join(instance._buildPath, 'themelets/test-themelet/templates/freemarker.ftl'));
				assert.isFile(path.join(instance._buildPath, 'themelets/test-themelet/templates/velocity.vm'));

				assert.fileContentMatch(path.join(instance._buildPath, 'css', customCSSFileName), /@import "\.\.\/themelets\/test-themelet\/css\/_custom\.scss";/);

				// TODO: add inject tags to both 6.2 and 7.0 themes when in development
				if (version != '6.2') {
					assert.fileContentMatch(path.join(instance._buildPath, 'templates/portal_normal.ftl'), /<script src="\${theme_display\.getPathThemeRoot\(\)}\/themelets\/test-themelet\/js\/main\.js"><\/script>/);
				}

				done();
			});
		});

		it('should rename css/ directory to _css/', function(done) {
			var instance = this;

			runSequence('build:rename-css-dir', function(err) {
				if (err) throw err;

				assert.isDirectory(path.join(instance._buildPath, '_css'));

				done();
			});
		});

		it('should compile sass to css', function(done) {
			var instance = this;

			this.timeout(SASS_COMPILE_TIMEOUT);

			runSequence('build:compile-css', function(err) {
				if (err) throw err;

				done();
			});
		});

		it('should move all compiled css to css/ directory', function(done) {
			var instance = this;

			runSequence('build:move-compiled-css', function(err) {
				if (err) throw err;

				assert.isDirectory(path.join(instance._buildPath, 'css'));

				done();
			});
		});

		it('should remove _css/ directory', function(done) {
			var instance = this;

			runSequence('build:remove-old-css-dir', function(err) {
				if (err) throw err;

				if (fs.existsSync(path.join(instance._buildPath, '_css'))) {
					throw new Error('_css directory should not exist');
				}

				done();
			});
		});

		it('should build .war file that matches name of the project', function(done) {
			var instance = this;

			runSequence('plugin:war', function(err) {
				if (err) throw err;

				assert.isFile(path.join(instance._tempPath, 'dist/base-theme.war'));

				done();
			});
		});
	}
}

function getCssFileName(version) {
	var fileName = '_custom.scss';

	if (version == '6.2') {
		fileName = 'custom.css';
	}

	return fileName;
}

function deleteDirJsFromCache(relativePath) {
	var files = fs.readdirSync(path.join(__dirname, relativePath));

	_.forEach(files, function(item, index) {
		if (_.endsWith(item, '.js')) {
			var taskPath = require.resolve(path.join(__dirname, relativePath, item));

			delete require.cache[taskPath];
		}
	});
}

function deleteJsFromCache() {
	var taskFiles = fs.readdirSync(path.join(__dirname, '../../tasks'));
	deleteDirJsFromCache('../../tasks');
	deleteDirJsFromCache('../../lib');
	deleteDirJsFromCache('../../lib/upgrade/6.2');

	var registerTasksPath = require.resolve('../../index.js');

	delete require.cache[registerTasksPath];
}

describe('Build Tasks: 6.2/libSass', createBuildTests('6.2', false));
describe('Build Tasks: 6.2/rubySass', createBuildTests('6.2', true));

describe('Build Tasks: 7.0/libSass', createBuildTests('7.0', false));
describe('Build Tasks: 7.0/rubySass', createBuildTests('7.0', true));
