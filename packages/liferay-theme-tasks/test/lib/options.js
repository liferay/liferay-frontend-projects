'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var chai = require('chai');
var path = require('path');
var sinon = require('sinon');

var assert = chai.assert;

describe('options', function() {
	before(function() {
		clearCache();
	});

	afterEach(function() {
		clearCache();
	});

	it('should return default options with no config passed', function() {
		var options = require('../../lib/options')();

		assert.deepEqual(options, {
			argv: argv,
			pathBuild: './build',
			pathDist: './dist',
			pathSrc: './src',
			rubySass: false,
			sassOptions: {}
		});
	});

	it('should return previously set options if no config is passed', function() {
		var options = require('../../lib/options')({
			pathBuild: './custom_build_path'
		});

		assert.deepEqual(options, {
			argv: argv,
			pathBuild: './custom_build_path',
			pathDist: './dist',
			pathSrc: './src',
			rubySass: false,
			sassOptions: {}
		});

		var secondOptions = require('../../lib/options')();

		assert.deepEqual(options, secondOptions);
	});
});

function clearCache() {
	delete require.cache[path.join(__dirname, '../../lib/options.js')];
}
