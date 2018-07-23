'use strict';

var _ = require('lodash');
var chai = require('chai');
var chalk = require('chalk');
var path = require('path');
var sinon = require('sinon');

var assert = chai.assert;
var sinonAssert = sinon.assert;

var liferayThemeImport = require('../../generators/import/index');

describe('liferay-theme:import unit tests', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(liferayThemeImport.prototype);
	});

	describe('_getSettingFromConfigFile', function() {
		it('should output a specific string if certain conditions are met', function() {
			var config = {};
			var expectedOutput = chalk.yellow('   Warning ') + '%s not found';

			config.filePath = 'path';

			prototype.importTheme = 'theme';
			prototype.log = sinon.spy();

			prototype._getSettingFromConfigFile(config);

			sinonAssert.calledWith(prototype.log.getCall(0), expectedOutput);
		});
	});

	describe('_validatePath', function() {
		it('should pass', function() {
			var retVal = prototype._validatePath('/does/not/exist');

			assert.equal(retVal, '"/does/not/exist" does not exist');

			retVal = prototype._validatePath(
				path.join(
					__dirname,
					'../fixtures/sdk-theme/docroot/WEB-INF/liferay-look-and-feel.xml'
				)
			);

			assert.match(
				retVal,
				/liferay-look-and-feel\.xml" is not a directory/,
				'return value should match'
			);

			retVal = prototype._validatePath(
				path.join(__dirname, '../fixtures/sdk-theme/docroot')
			);

			assert.match(
				retVal,
				/sdk-theme\/docroot" doesn't appear to be a theme in the SDK/,
				'return value should match'
			);

			retVal = prototype._validatePath(
				path.join(__dirname, '../fixtures/sdk-theme')
			);

			assert(retVal, 'returns true');
		});
	});
});
