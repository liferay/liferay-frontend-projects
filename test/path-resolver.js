'use strict';

var assert = require('assert');

require('./fixture/common.js');

describe('PathResolver', function() {
	it('should resolve modules without paths', function() {
		var pathResolver = new global.PathResolver();

		var result;

		result = pathResolver.resolvePath('c1', 'c');
		assert.strictEqual('c', result);

		result = pathResolver.resolvePath('c1', './c');
		assert.strictEqual('c', result);
	});

	it('should resolve relative paths', function() {
		var pathResolver = new global.PathResolver();

		var result;

		result = pathResolver.resolvePath('test/test123', '../dep');
		assert.strictEqual('dep', result);

		result = pathResolver.resolvePath('a/b/c/c1', '../../../c');
		assert.strictEqual('c', result);

		result = pathResolver.resolvePath('a/b/c/c1', '../../c');
		assert.strictEqual('a/c', result);

		result = pathResolver.resolvePath('a/b/c/c1', './c');
		assert.strictEqual('a/b/c/c', result);

		result = pathResolver.resolvePath('a/b/c/c1', './../c');
		assert.strictEqual('a/b/c', result);

		result = pathResolver.resolvePath('a/b/c/c1', './d/../c');
		assert.strictEqual('a/b/c/c', result);

		result = pathResolver.resolvePath('a/b/c/c1', './d/c');
		assert.strictEqual('a/b/c/d/c', result);

		result = pathResolver.resolvePath('a/b/c/c1', './../../../../c');
		assert.strictEqual('../c', result);
	});

	it('should ignore "require" path', function() {
		var pathResolver = new global.PathResolver();

		// Require should be ignored and not resolved at all
		var result = pathResolver.resolvePath('a/b/c/c1', 'require');
		assert.strictEqual('require', result);
	});

	it('should ignore "exports" path', function() {
		var pathResolver = new global.PathResolver();

		// Exports should be ignored and not resolved at all
		var result = pathResolver.resolvePath('a/b/c/c1', 'exports');
		assert.strictEqual('exports', result);
	});

	it('should ignore "module" path', function() {
		var pathResolver = new global.PathResolver();

		// Module should be ignored and not resolved at all
		var result = pathResolver.resolvePath('a/b/c/c1', 'module');
		assert.strictEqual('module', result);
	});
});
