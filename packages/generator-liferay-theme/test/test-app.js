'use strict';

var _ = require('lodash');
var assert = require('yeoman-generator').assert;
var fs = require('fs');
var helpers = require('yeoman-generator').test;
var os = require('os');
var path = require('path');

var tempDir = path.join(os.tmpdir(), './temp-test');

describe('liferay-theme:app', function () {
	afterEach(function(done) {
		fs.rmdir(path.join(tempDir, 'test-theme'), function() {
			done();
		});
	});

	it('creates files', function() {
		runGenerator(null, function() {
			assert.file([
				'gulpfile.js',
				'package.json',
				'src/css/_custom.scss',
				'src/META-INF/context.xml',
				'src/WEB-INF/liferay-plugin-package.properties',
				'src/WEB-INF/src/resources-importer/readme.txt',
				'src/WEB-INF/src/resources-importer/sitemap.json'
			]);
		});
	});

	it('populates 7.0 package.json correctly', function() {
		runGenerator(null, function(done) {
			var pkgPath = path.join(os.tmpdir(), 'temp-test/test-theme/package.json');

			var pkg = require(pkgPath);

			assert.equal(pkg.liferayTheme.supportCompass, false);
			assert.equal(pkg.liferayTheme.templateLanguage, 'vm');
			assert.equal(pkg.liferayTheme.version, '7.0');
			assert.equal(pkg.name, 'test-theme');
			assert.equal(pkg.publishConfig.tag, '7_0_x');
			assert.equal(pkg.version, '1.0.0');

			done();
		});
	});

	it('populates 6.2 package.json correctly', function() {
		runGenerator({
			liferayVersion: '6.2',
			supportCompass: true,
			templateLanguage: 'ftl',
		}, function(done) {
			var pkgPath = path.join(os.tmpdir(), 'temp-test/test-theme/package.json');

			var pkg = require(pkgPath);

			assert.equal(pkg.liferayTheme.supportCompass, true);
			assert.equal(pkg.liferayTheme.templateLanguage, 'ftl');
			assert.equal(pkg.liferayTheme.version, '6.2');
			assert.equal(pkg.publishConfig.tag, '6_2_x');
			assert.equal(pkg.version, '0.0.0');

			done();
		});
	});
});

function runGenerator(options, done) {
	options = options || {};

	options = _.defaults(options, {
		liferayVersion: '7.0',
		supportCompass: false,
		templateLanguage: 'vm',
		themeId: 'test-theme',
		themeName: 'test-theme'
	});

	helpers.run(path.join(__dirname, '../generators/app'))
		.inDir(tempDir)
		.withOptions({
			'skip-install': true
		})
		.withPrompt(options)
		.on('end', done);
}
