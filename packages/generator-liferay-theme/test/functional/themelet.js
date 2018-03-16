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

var defaults = {
  liferayVersion: '7.1',
  themeId: 'test-themelet',
  themeName: 'Test Themelet'
};
var tempThemeletDir = path.join(tempDir, defaults.themeId);

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

	it('populates 7.1 package.json correctly', function(done) {
		runGenerator({
            liferayVersion: '7.1'
        }, function() {
			var pkg = getPackage();

			assert.equal(pkg.liferayTheme.version, '7.1');
			assert.equal(pkg.version, '1.0.0');

			done();
		});
	});

	it('populates 7.0 package.json correctly', function(done) {
		runGenerator({
			liferayVersion: '7.0'
		}, function() {
			var pkg = getPackage();

			assert.equal(pkg.liferayTheme.version, '7.0');
			assert.equal(pkg.version, '1.0.0');

			done();
		});
	});

	it('populates "All" version package.json correctly', function(done) {
		runGenerator({
			liferayVersion: 'All'
		}, function() {
			var pkg = getPackage();

			assert.equal(pkg.liferayTheme.version, '*');
			assert.equal(pkg.version, '1.0.0');

			done();
		});
	});

	it('tests themeDirName configuration', function(done) {
		runGenerator(null, function() {
			var pkg = getPackage();

			chaiAssert.equal(pkg.name, defaults.themeId);

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

	options = _.defaults(options, defaults);

	delete require.cache[path.join(__dirname, '../../generators/app/index.js')];

	helpers.run(path.join(__dirname, '../../generators/themelet'))
		.withPrompt(options)
		.inDir(tempDir)
		.on('end', end);
}
