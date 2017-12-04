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

var tempThemeDir = path.join(tempDir, 'sdk-theme');

var pathSdkTheme = path.join(__dirname, '../fixtures/sdk-theme');

describe('liferay-theme:import functional tests', function () {
	it('creates files', function(done) {
		runGenerator(null, function() {
			assert.file([
				'gulpfile.js',
				'package.json',
				'src/css/custom.css',
				'src/templates/portal_normal.vm',
				'src/WEB-INF/liferay-look-and-feel.xml',
				'src/WEB-INF/liferay-plugin-package.properties',
				'src/WEB-INF/liferay-releng.properties'
			]);

			done();
		});
	});

	it('populates 6.2 package.json correctly', function(done) {
		runGenerator(null, function() {
			var pkg = getPackage();

			assert.equal(pkg.liferayTheme.rubySass, true);
			assert.equal(pkg.liferayTheme.templateLanguage, 'vm');
			assert.equal(pkg.liferayTheme.version, '6.2');
			assert.equal(pkg.version, '1.0.0');

			done();
		});
	});
});

function getPackage(themeName) {
	var fileContents = fs.readFileSync(path.join(tempThemeDir, 'package.json'));

	return JSON.parse(fileContents);
}

function runGenerator(options, end) {
	options = options || {};

	options = _.defaults(options, {
		importTheme: pathSdkTheme
	});

	delete require.cache[path.join(__dirname, '../../generators/app/index.js')];

	helpers.run(path.join(__dirname, '../../generators/import'))
		.inDir(tempDir)
		.withOptions({
			'skip-install': true
		})
		.withPrompt(options)
		.on('end', end);
}
