'use strict';

var chai = require('chai');
var doctor = require('../../lib/doctor.js');
var path = require('path');

var assert = chai.assert;

describe('Doctor', function() {
	it('should throw appropriate error message', function(done) {
		var pkg = require(path.join(__dirname, '../assets/json/_package.json'));

		assert.throw(function() {
			doctor(pkg);
		}, 'Missing 2 theme dependencies');

		done();
	});

	it('should look for dependencies regardless if devDependency or not', function(done) {
		var pkg = require(path.join(__dirname, '../assets/json/_package_mixed_dependencies.json'));

		assert.doesNotThrow(function() {
			doctor(pkg);
		});

		done();
	});
});
