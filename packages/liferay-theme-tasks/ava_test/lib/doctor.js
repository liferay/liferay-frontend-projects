'use strict';

var _ = require('lodash');
var del = require('del');
var doctor = require('../../lib/doctor.js');
var fs = require('fs-extra');
var os = require('os');
var path = require('path');
var test = require('ava');

var initCwd = process.cwd();
var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', 'doctor-fixtures');

test.cb.before(function(t) {
	fs.copy(path.join(__dirname, '../fixtures/json/_package_outdated_settings.json'), path.join(tempPath, 'package.json'), function(err) {
		if (err) throw err;

		process.chdir(tempPath);

		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);

	del.sync(path.join(tempPath, '**'), {
		force: true
	});
});

test('should throw appropriate error message', function(t) {
	var pkg = require(path.join(__dirname, '../fixtures/json/_package.json'));

	t.throws(function() {
		doctor(pkg, true);
	}, 'Missing 2 theme dependencies');
});

test('should look for dependencies regardless if devDependency or not', function(t) {
	var pkg = require(path.join(__dirname, '../fixtures/json/_package_mixed_dependencies.json'));

	t.notThrows(function() {
		doctor(pkg, true);
	});
});

test('should replace supportCompass with rubySass', function(t) {
	var pkgPath = path.join(tempPath, 'package.json');

	var pkg = require(pkgPath);

	doctor(pkg, true);

	var updatedPkg = JSON.parse(fs.readFileSync(pkgPath));

	var liferayTheme = updatedPkg.liferayTheme;

	t.is(liferayTheme.baseTheme, 'styled');
	t.is(liferayTheme.rubySass, false);
	t.is(liferayTheme.version, '7.0');
	t.true(_.isUndefined(liferayTheme.supportCompass));
});
