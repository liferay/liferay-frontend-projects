const fs = require('fs');
const chai = require('chai');
const _ = require('lodash');
const os = require('os');
const path = require('path');
const helpers = require('yeoman-generator').test;

const liferayThemeThemelet = require('../index');

chai.use(require('chai-fs'));
const assert = chai.assert;

const tempDir = path.join(os.tmpdir(), 'temp-test');
const defaults = {
	liferayVersion: '7.1',
	themeId: 'test-themelet',
	themeName: 'Test Themelet',
};
const tempThemeletDir = path.join(tempDir, defaults.themeId);

describe('liferay-theme:themelet unit tests', function() {
	describe('_isLiferayVersion', function() {
		it('should check for valid Liferay versions', function() {
			_.forEach(['All', '7.1', '7.0'], function(version) {
				assert.isTrue(
					liferayThemeThemelet.prototype._isLiferayVersion(version),
					0,
					'Valid Liferay version'
				);
			});

			assert.isFalse(
				liferayThemeThemelet.prototype._isLiferayVersion('0.1'),
				-1,
				'Invalid Liferay version'
			);
		});
	});
});

// TODO: fix functional tests
// describe('liferay-theme:themelet functional tests', function() {
// 	it('creates files', function(done) {
// 		runGenerator(null, function() {
// 			assert.file(['package.json', 'src/css/_custom.scss']);
//
// 			done();
// 		});
// 	});
//
// 	it('populates 7.1 package.json correctly', function(done) {
// 		runGenerator(
// 			{
// 				liferayVersion: '7.1',
// 			},
// 			function() {
// 				var pkg = getPackage();
//
// 				assert.equal(pkg.liferayTheme.version, '7.1');
// 				assert.equal(pkg.version, '1.0.0');
//
// 				done();
// 			}
// 		);
// 	});
//
// 	it('populates 7.0 package.json correctly', function(done) {
// 		runGenerator(
// 			{
// 				liferayVersion: '7.0',
// 			},
// 			function() {
// 				var pkg = getPackage();
//
// 				assert.equal(pkg.liferayTheme.version, '7.0');
// 				assert.equal(pkg.version, '1.0.0');
//
// 				done();
// 			}
// 		);
// 	});
//
// 	it('populates "All" version package.json correctly', function(done) {
// 		runGenerator(
// 			{
// 				liferayVersion: 'All',
// 			},
// 			function() {
// 				var pkg = getPackage();
//
// 				assert.equal(pkg.liferayTheme.version, '*');
// 				assert.equal(pkg.version, '1.0.0');
//
// 				done();
// 			}
// 		);
// 	});
//
// 	it('tests themeDirName configuration', function(done) {
// 		runGenerator(null, function() {
// 			var pkg = getPackage();
//
// 			assert.equal(pkg.name, defaults.themeId);
//
// 			done();
// 		});
// 	});
// });
//
// function getPackage() {
// 	var fileContents = fs.readFileSync(
// 		path.join(tempThemeletDir, 'package.json')
// 	);
//
// 	return JSON.parse(fileContents);
// }
//
// function runGenerator(options, end) {
// 	options = options || {};
//
// 	options = _.defaults(options, defaults);
//
// 	delete require.cache[path.join(__dirname, '../../generators/app/index.js')];
//
// 	helpers
// 		.run(path.join(__dirname, '../../generators/themelet'))
// 		.withPrompt(options)
// 		.inDir(tempDir)
// 		.on('end', end);
// }
