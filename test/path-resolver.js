'use strict';

var assert = require('assert');

require('./fixture/common.js');

describe('PathResolver', function () {
    it('should resolve modules without paths', function () {
        var pathResolver = new global.LoaderUtils.PathResolver();

        var result;

        result = pathResolver.resolvePath('c1', 'c');
        assert.strictEqual('c', result);

        result = pathResolver.resolvePath('c1', './c');
        assert.strictEqual('c', result);

        printStatus(pathResolver.resolvePath);
    });

    it('should resolve relative paths', function () {
        var pathResolver = new global.LoaderUtils.PathResolver();

        var result;

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

        printStatus(pathResolver.resolvePath);
    });

    it('should ignore exports module', function() {
        var pathResolver = new global.LoaderUtils.PathResolver();

        // Exports should be ignored and not resolved at all
        var result = pathResolver.resolvePath('a/b/c/c1', 'exports');
        assert.strictEqual('exports', result);
    });
});