'use strict';

var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');
var path = require('path');

describe('liferay-theme:app', function () {
	before(function (done) {
		this.timeout(10000);

		helpers.run(path.join(__dirname, '../generators/app'))
			.inDir(path.join(os.tmpdir(), './temp-test'))
			.withOptions({
				'skip-install': true
			})
			.withPrompt({
				liferayVersion: '7.0',
				supportCompass: false,
				templateLanguage: 'vm',
				themeId: 'test-theme',
				themeName: 'test-theme'
			})
			.on('end', done);
	});

	it('creates files', function () {
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
