'use strict';

var _ = require('lodash');
var chai = require('chai');

var assert = chai.assert;

var liferayThemeThemelet = require('../../generators/themelet/index');

describe('liferay-theme:themelet unit tests', function() {
	describe('_isLiferayVersion', function() {
		it('should check for valid Liferay versions', function() {
			_.forEach(['All', '7.1', '7.0'], function(version) {
				assert.isTrue(liferayThemeThemelet.prototype._isLiferayVersion(version), 0, 'Valid Liferay version');
			});

			assert.isFalse(liferayThemeThemelet.prototype._isLiferayVersion('0.1'), -1, 'Invalid Liferay version');
		});
	});
});
