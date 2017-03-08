'use strict';

var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var test = require('ava');

var initCwd = process.cwd();
var themeFinder;

test.after(function() {
	process.chdir(initCwd);
});

test.before(function() {
	process.chdir(path.join(__dirname, '../fixtures/themes/7.0/base-theme'));
});

test.before(function() {
	clearCache();
});

test.afterEach(function() {
	clearCache();
});

test('options should return default options with no config passed', function(t) {
	var options = require('../../lib/options')();

	t.deepEqual(options, {
		argv: argv,
		baseTheme: {
			liferayTheme: {
				baseTheme: 'styled',
				rubySass: false,
				screenshot: '',
				templateLanguage: 'vm',
				version: '7.0'
			},
			name: 'parent-theme',
			publishConfig: {
				tag: '7_0_x'
			},
			version: '1.0.0'
		},
		pathBuild: './build',
		pathDist: './dist',
		pathSrc: './src',
		rubySass: false,
		sassOptions: {},
		templateLanguage: 'ftl',
		themeletDependencies: {
			'test-themelet': {
				liferayTheme: {
					themelet: true,
					version: '7.0'
				},
				name: 'test-themelet',
				version: '0.0.0'
			}
		},
		version: '7.0'
	});
});

test('options should return previously set options if no config is passed', function(t) {
	var options = require('../../lib/options')({
		distName: 'dist-name',
		pathBuild: './custom_build_path'
	});

	t.deepEqual(options, {
		argv: argv,
		baseTheme: {
			liferayTheme: {
				baseTheme: 'styled',
				rubySass: false,
				screenshot: '',
				templateLanguage: 'vm',
				version: '7.0'
			},
			name: 'parent-theme',
			publishConfig: {
				tag: '7_0_x'
			},
			version: '1.0.0'
		},
		distName: 'dist-name',
		pathBuild: './custom_build_path',
		pathDist: './dist',
		pathSrc: './src',
		rubySass: false,
		sassOptions: {},
		templateLanguage: 'ftl',
		themeletDependencies: {
			'test-themelet': {
				liferayTheme: {
					themelet: true,
					version: '7.0'
				},
				name: 'test-themelet',
				version: '0.0.0'
			}
		},
		version: '7.0'
	});

	var secondOptions = require('../../lib/options')();

	t.deepEqual(options, secondOptions);
});

function clearCache() {
	delete require.cache[path.join(__dirname, '../../lib/options.js')];
}
