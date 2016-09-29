'use strict';

var test = require('ava');

var themeFinder = require('../../index');

var pkg = {
	liferayTheme: {
		version: '7.0'
	}
};

test('_validateVersion should return true if version is supported', function(t) {
	t.true(themeFinder._validateVersion(pkg, '*'));
	t.true(themeFinder._validateVersion(pkg, '7.0'));
	t.true(themeFinder._validateVersion(pkg, ['6.2', '7.0']));

	t.false(themeFinder._validateVersion(pkg, '6.2'));
	t.false(themeFinder._validateVersion(pkg, ['6.2']));

	pkg.liferayTheme.version = ['6.2', '7.0'];

	t.true(themeFinder._validateVersion(pkg, '7.0'));
	t.true(themeFinder._validateVersion(pkg, ['7.0']));

	t.false(themeFinder._validateVersion(pkg, ['7.1']));
});
