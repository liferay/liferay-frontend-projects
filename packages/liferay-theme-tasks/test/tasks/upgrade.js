'use strict';

var chai = require('chai');
var del = require('del');
var fs = require('fs-extra');
var gulp = require('gulp');
var gulpBlackList = require('../../lib/upgrade/6.2/gulp_black_list.js');
var lfrThemeConfig = require('../../lib/liferay_theme_config.js');
var os = require('os');
var path = require('path');
var registerTasks = require('../../index.js').registerTasks;
var runSequence;

var assert = chai.assert;
chai.use(require('chai-fs'));

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', '6.2', 'upgrade-theme');

describe('6.2 -> 7.0 Upgrade Tasks', function() {
	before(function(done) {
		this.timeout(10000);

		var instance = this;

		instance._initCwd = process.cwd();

		fs.copy(path.join(__dirname, '../fixtures/themes/6.2/upgrade-theme'), tempPath, function(err) {
			if (err) throw err;

			process.chdir(tempPath);

			instance._tempPath = tempPath;

			var config = {
				gulp: gulp,
				rubySass: true
			};

			registerTasks(config);

			require('../../lib/upgrade/6.2/upgrade')(config);

			runSequence = require('run-sequence').use(gulp);

			console.log('Creating temp theme in', tempPath);

			done();
		});
	});

	after(function() {
		del.sync(path.join(tempPath, '**'), {
			force: true
		});

		process.chdir(this._initCwd);

		del.sync(path.join(this._initCwd, 'tmp', '**'));
	});

	it('should create backup files from source', function(done) {
		var instance = this;

		runSequence('upgrade:create-backup-files', function(err) {
			if (err) throw err;

			assert.isDirectory(path.join(tempPath, '_backup'), '_backup is a directory');
			assert.isDirectory(path.join(tempPath, '_backup/src'), '_backup/src is a directory');
			assert.isFile(path.join(tempPath, '_backup/src/css/custom.css'), '_backup/src/css/custom.css is a file');

			done();
		});
	});

	it('should create blacklist of scss mixins found in theme css files', function(done) {
		runSequence('upgrade:black-list', function(err) {
			if (err) throw err;

			gulp.src(path.join(tempPath, 'src/css/*'))
				.pipe(gulpBlackList(null, function(result) {
					assert(result.mixins);
					assert(result.mixins.indexOf('border-radius') > -1);

					done();
				}));
		});
	});

	it('should replace compass mixins with bourbon equivalents exluding anything mixins/functions on blacklist', function(done) {
		runSequence('upgrade:replace-compass', function(err) {
			if (err) throw err;

			var customCSSPath = path.join(tempPath, 'src/css/custom.css');

			assert.fileContentMatch(customCSSPath, /@import\s"bourbon";/)
			assert.notFileContentMatch(customCSSPath, /@import\s"compass";/);

			assert.fileContentMatch(customCSSPath, /@include\sborder-radius/);
			assert.notFileContentMatch(customCSSPath, /@include\sbox-shadow/);

			done();
		});
	});

	it('should run convert-bootstrap-2-to-3 module on css files', function(done) {
		runSequence('upgrade:convert-bootstrap', function(err) {
			if (err) throw err;

			var customCSSPath = path.join(tempPath, 'src/css/custom.css');

			assert.notFileContentMatch(customCSSPath, /\$grayDark/);
			assert.fileContentMatch(customCSSPath, /\$gray-dark/);
			assert.fileContentMatch(customCSSPath, /\$gray-darker/);

			done();
		});
	});

	it('upgrade:config', function(done) {
		runSequence('upgrade:config', function(err) {
			if (err) throw err;

			var themeConfig = lfrThemeConfig.getConfig();

			assert.equal(themeConfig.version, '7.0');
			assert.equal(themeConfig.rubySass, false);

			var lookAndFeelPath = path.join(tempPath, 'src/WEB-INF/liferay-look-and-feel.xml');
			var pluginPackagePropertiesPath = path.join(tempPath, 'src/WEB-INF/liferay-plugin-package.properties');

			assert.fileContentMatch(lookAndFeelPath, /7\.0\.0/);
			assert.fileContentMatch(lookAndFeelPath, /7_0_0/);
			assert.fileContentMatch(pluginPackagePropertiesPath, /7\.0\.0\+/);

			assert.notFileContentMatch(lookAndFeelPath, /6\.2\.0/);
			assert.notFileContentMatch(lookAndFeelPath, /6\.2\.0/);

			done();
		});
	});

	// TODO: upgrade:rename-core-files

	it('should create css.diff file showing what has been changed in theme css files', function(done) {
		runSequence('upgrade:create-css-diff', function(err) {
			if (err) throw err;

			var cssDiffPath = path.join(tempPath, '_backup/css.diff');

			assert.fileContentMatch(cssDiffPath, /-\$grayDark:\s#333;/);
			assert.fileContentMatch(cssDiffPath, /\+\$gray-dark:\s#333;/);

			done();
		});
	});

	it('should create deprecated mixins file', function(done) {
		var instance = this;

		runSequence('upgrade:create-deprecated-mixins', function(err) {
			if (err) throw err;

			assert.isFile(path.join(tempPath, 'src/css/_deprecated_mixins.scss'));

			done();
		});
	});

	it('should scrape templates for needed changes', function(done) {
		runSequence('upgrade:ftl-templates', 'upgrade:vm-templates', function(err) {
			if (err) throw err;

			done();
		});
	});

	it('should log changes that have been and should be made', function(done) {
		runSequence('upgrade:log-changes', function(err) {
			if (err) throw err;

			done();
		});
	});
});
