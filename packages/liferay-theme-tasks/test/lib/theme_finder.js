'use strict';

var _ = require('lodash');
var chai = require('chai');
var path = require('path');

var assert = chai.assert;

describe('themeFinder', function() {
	var originalCWD;
	var themeFinder;

	after(function() {
		process.chdir(originalCWD);
	});

	before(function() {
		originalCWD = process.cwd();

		delete require.cache[path.join(__dirname, '../../lib/theme_finder.js')];

		process.chdir(path.join(__dirname, '../fixtures/themes/7.0/base-theme'));

		themeFinder = require('../../lib/theme_finder.js');
	});

	describe('getLiferayThemeModule', function() {
		it('should retrieve package.json file from npm', function(done) {
			var pkgName = 'lfr-product-menu-animation-themelet';

			themeFinder.getLiferayThemeModule(pkgName, function(err, pkg) {
				assert(_.isNull(err), 'error is null');
				assert(_.isObject(pkg.liferayTheme), 'liferayTheme object is present');
				assert(pkg.keywords.indexOf('liferay-theme') > -1, 'package has liferay-theme keyword');
				assert.equal(pkg.name, pkgName, 'package has correct name');

				done();
			});
		});

		it('should return error because module does not exist', function(done) {
			themeFinder.getLiferayThemeModule('fake-themelet-123', function(err, pkg) {
				assert(_.isUndefined(pkg), 'pkg is undefined');
				assert.equal(err.message, 'Package or version doesn\'t exist', 'it has appropriate error message');

				done();
			});
		});

		it('should return error because module is not a liferay theme module', function(done) {
			themeFinder.getLiferayThemeModule('generator-liferay-theme', function(err, pkg) {
				assert(_.isNull(pkg), 'pkg is null');
				assert.equal(err.message, 'Package is not a Liferay theme or themelet module', 'it has appropriate error message');

				done();
			});
		});
	});

	describe('getLiferayThemeModules', function() {
		it('should return an object when searching for global modules', function(done) {
			themeFinder.getLiferayThemeModules(function(themeResults) {
				assert(_.isObject(themeResults));

				done();
			});
		});

		it('should return an object when searching for npm modules', function(done) {
			themeFinder.getLiferayThemeModules({
				globalModules: false,
				themelet: true
			}, function(themeResults) {
				_.forEach(themeResults, function(item, index) {
					assert(_.isObject(item));
					assert(_.isObject(item.liferayTheme), 'liferayTheme object is present');
					assert(item.keywords.indexOf('liferay-theme') > -1, 'package has liferay-theme keyword');
				});

				assert(_.isObject(themeResults));

				done();
			});
		});
	});
});
