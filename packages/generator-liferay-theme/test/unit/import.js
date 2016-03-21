'use strict';

var _ = require('lodash');
var chai = require('chai');
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');

var assert = chai.assert;

var liferayThemeImport = require('../../generators/import/index');

describe('liferay-theme:import unit tests', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(liferayThemeImport.prototype);
	});

	describe('_validatePath', function() {
		it('should pass', function() {
			var retVal = prototype._validatePath('/does/not/exist');

			assert.equal(retVal, '"/does/not/exist" does not exist');

			retVal = prototype._validatePath(path.join(__dirname, '../fixtures/sdk-theme/docroot/WEB-INF/liferay-look-and-feel.xml'));

			assert.match(retVal, /liferay-look-and-feel\.xml" is not a directory/, 'return value should match');

			retVal = prototype._validatePath(path.join(__dirname, '../fixtures/sdk-theme/docroot'));

			assert.match(retVal, /sdk-theme\/docroot" doesn't appear to be a theme in the SDK/, 'return value should match');

			retVal = prototype._validatePath(path.join(__dirname, '../fixtures/sdk-theme'));

			assert(retVal, 'returns true');
		});
	});
});
