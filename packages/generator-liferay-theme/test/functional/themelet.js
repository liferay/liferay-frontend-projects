'use strict';

var _ = require('lodash');
var assert = require('yeoman-generator').assert;
var chai = require('chai');
var fs = require('fs');
var helpers = require('yeoman-generator').test;
var os = require('os');
var path = require('path');

var chaiAssert = chai.assert;
chai.use(require('chai-fs'));

var tempDir = path.join(os.tmpdir(), 'temp-test');

var tempThemeletDir = path.join(tempDir, 'test-themelet');

describe('liferay-theme:themelet functional tests', function() {
	it('creates files', function(done) {
		runGenerator(null, function() {
			assert.file([
				'package.json',
				'src/css/_custom.scss'
			]);

			done();
		});
	});

	it('populates 7.0 package.json correctly', function(done) {
		runGenerator(null, function() {
			var pkg = getPackage();

			assert.equal(pkg.liferayTheme.version, '7.0');
			assert.equal(pkg.version, '1.0.0');

			done();
		});
	});

	it('populates 6.2 package.json correctly', function(done) {
		runGenerator({
			liferayVersion: '6.2'
		}, function() {
			var pkg = getPackage();

			assert.equal(pkg.liferayTheme.version, '6.2');
			assert.equal(pkg.version, '0.0.0');

			done();
		});
	});

	it('populates "All" version package.json correctly', function(done) {
		runGenerator({
			liferayVersion: 'All'
		}, function() {
			var pkg = getPackage();

			assert.equal(pkg.liferayTheme.version, '*');
			assert.equal(pkg.version, '0.0.0');

			done();
		});
	});

	it('tests themeDirName configuration', function(done) {
		runGenerator({
			themeId: 'test'
		}, function() {
			var pkg = getPackage();

			chaiAssert.equal(pkg.name, 'test-themelet');

			done();
		});
	});
});

function getPackage() {
	var fileContents = fs.readFileSync(path.join(tempThemeletDir, 'package.json'));

	return JSON.parse(fileContents);
}

function runGenerator(options, end) {
	options = options || {};

	options = _.defaults(options, {
		liferayVersion: '7.0',
		themeId: 'test-themelet',
		themeName: 'Test Themelet'
	});

	delete require.cache[path.join(__dirname, '../../generators/app/index.js')];

	helpers.run(path.join(__dirname, '../../generators/themelet'))
		.withPrompt(options)
		.inDir(tempDir)
		.on('end', end);
}
