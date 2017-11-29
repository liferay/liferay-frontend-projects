'use strict';

let _ = require('lodash');
let del = require('del');
let divert = require('../../lib/divert');
let fs = require('fs-extra');
let os = require('os');
let path = require('path');
let test = require('ava');

let initCwd = process.cwd();
let tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', 'doctor-fixtures');

test.cb.before(function(t) {
	fs.copy(
		path.join(
			__dirname,
			'../fixtures/json/_package_outdated_settings.json'
		),
		path.join(tempPath, 'package.json'),
		function(err) {
			if (err) throw err;

			process.chdir(tempPath);

			t.end();
		}
	);
});

test.after(function() {
	process.chdir(initCwd);

	del.sync(path.join(tempPath, '**'), {
		force: true,
	});
});

test('should throw appropriate error message', function(t) {
	let pkg = require(path.join(__dirname, '../fixtures/json/_package.json'));

	t.throws(function() {
		divert('doctor').doctor(pkg, true);
	}, 'Missing 2 theme dependencies');
});

test('should look for dependencies regardless if devDependency or not', function(
	t
) {
	let pkg = require(path.join(
		__dirname,
		'../fixtures/json/_package_mixed_dependencies.json'
	));

	t.notThrows(function() {
		divert('doctor').doctor(pkg, true);
	});
});

test('should replace supportCompass with rubySass', function(t) {
	let pkgPath = path.join(tempPath, 'package.json');

	let pkg = require(pkgPath);

	divert('doctor').doctor(pkg, true);

	let updatedPkg = JSON.parse(fs.readFileSync(pkgPath));

	let liferayTheme = updatedPkg.liferayTheme;

	t.is(liferayTheme.baseTheme, 'styled');
	t.is(liferayTheme.rubySass, false);
	t.is(liferayTheme.version, '7.0');
	t.true(_.isUndefined(liferayTheme.supportCompass));
});
