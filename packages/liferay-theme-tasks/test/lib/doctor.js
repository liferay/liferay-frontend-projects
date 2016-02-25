'use strict';

var chai = require('chai');
var doctor = require('../../lib/doctor.js');
var fs = require('fs-extra');
var os = require('os');
var path = require('path');

var assert = chai.assert;

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', 'doctor-fixtures');

describe('Doctor', function() {
	before(function(done) {
		this.timeout(10000);

		var instance = this;

		instance._initCwd = process.cwd();

		fs.copy(path.join(__dirname, '../fixtures/json/_package_outdated_settings.json'), path.join(tempPath, 'package.json'), function(err) {
			if (err) throw err;

			process.chdir(tempPath);

			instance._tempPath = tempPath;

			done();
		});
	});

	after(function() {
		fs.removeSync(tempPath);

		process.chdir(this._initCwd);
	});

	it('should throw appropriate error message', function(done) {
		var pkg = require(path.join(__dirname, '../fixtures/json/_package.json'));

		assert.throw(function() {
			doctor(pkg, true);
		}, 'Missing 2 theme dependencies');

		done();
	});

	it('should look for dependencies regardless if devDependency or not', function(done) {
		var pkg = require(path.join(__dirname, '../fixtures/json/_package_mixed_dependencies.json'));

		assert.doesNotThrow(function() {
			doctor(pkg, true);
		});

		done();
	});

	it('should replace supportCompass with rubySass', function(done) {
		var pkgPath = path.join(tempPath, 'package.json');

		var pkg = require(pkgPath);

		doctor(pkg, true);

		var updatedPkg = JSON.parse(fs.readFileSync(pkgPath));

		var liferayTheme = updatedPkg.liferayTheme;

		assert.equal(liferayTheme.baseTheme, 'styled');
		assert.equal(liferayTheme.rubySass, false);
		assert.equal(liferayTheme.version, '7.0');
		assert.isUndefined(liferayTheme.supportCompass);

		done();
	});
});
