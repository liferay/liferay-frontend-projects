'use strict';

var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var test = require('ava');

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
		pathBuild: './build',
		pathDist: './dist',
		pathSrc: './src',
		rubySass: false,
		sassOptions: {}
	});
});

test('options should return previously set options if no config is passed', function(t) {
	var options = require('../../lib/options')({
		pathBuild: './custom_build_path'
	});

	t.deepEqual(options, {
		argv: argv,
		pathBuild: './custom_build_path',
		pathDist: './dist',
		pathSrc: './src',
		rubySass: false,
		sassOptions: {}
	});

	var secondOptions = require('../../lib/options')();

	t.deepEqual(options, secondOptions);
});

function clearCache() {
	delete require.cache[path.join(__dirname, '../../lib/options.js')];
}
