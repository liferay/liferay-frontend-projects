'use strict';

const _ = require('lodash');
const del = require('del');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const test = require('ava');

const {doctor} = require('../../lib/doctor');

const initCwd = process.cwd();
const tempPath = path.join(
	os.tmpdir(),
	'liferay-theme-tasks',
	'doctor-fixtures'
);

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
		doctor({themeConfig: pkg, haltOnMissingDeps: true, tasks: []});
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
		doctor({themeConfig: pkg, haltOnMissingDeps: true, tasks: []});
	});
});

test('should replace supportCompass with rubySass', function(t) {
	let pkgPath = path.join(tempPath, 'package.json');

	let pkg = require(pkgPath);

	doctor({themeConfig: pkg, haltOnMissingDeps: true, tasks: []});

	let updatedPkg = JSON.parse(fs.readFileSync(pkgPath));

	let liferayTheme = updatedPkg.liferayTheme;

	t.is(liferayTheme.baseTheme, 'styled');
	t.is(liferayTheme.rubySass, false);
	t.is(liferayTheme.version, '7.0');
	t.true(_.isUndefined(liferayTheme.supportCompass));
});
