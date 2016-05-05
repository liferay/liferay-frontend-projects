'use strict';

var _ = require('lodash');
var chai = require('chai');

var promptUtil = require('../../../lib/prompts/prompt_util.js');

var assert = chai.assert;

var liferayVersion = '7.0';

var liferayThemeThemletMetaData = {
	themelet: true,
	version: liferayVersion
};

var themeletDependencies = {
	'themelet-1': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-1',
		realPath: 'path/to/themelet-1',
		version: liferayVersion
	},
	'themelet-2': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-2',
		realPath: 'path/to/themelet-2',
		version: liferayVersion
	},
	'themelet-3': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-3',
		version: liferayVersion
	}
};

describe('promptUtil', function() {
	describe('formatThemeletSelection', function() {
		it('should format themelet selection retrieved from getModuleChoices', function() {
			var data = {
				'themelet-1': true,
				'themelet-2': true,
				'themelet-3': false
			};

			var formatted = promptUtil.formatThemeletSelection(data);

			assert(!formatted.keptThemelets);
			assert(!formatted.removedThemelets);
			assert.deepEqual(formatted.addedThemelets, ['themelet-1', 'themelet-2']);

			formatted = promptUtil.formatThemeletSelection(data, ['themelet-3', 'themelet-2']);

			assert.deepEqual(formatted.addedThemelets, ['themelet-1']);
			assert.deepEqual(formatted.keptThemelets, ['themelet-2']);
			assert.deepEqual(formatted.removedThemelets, ['themelet-3']);
		});
	});

	describe('getListType', function() {
		it('should get listType based on environment', function() {
			var listType = promptUtil.getListType();

			assert(listType == 'list' || listType == 'rawlist');
		});
	});

	describe('getModuleChoices', function() {
		it('should get module choices that are appropriate for extend type', function() {
			var choices = promptUtil.getModuleChoices(themeletDependencies, {});

			_.forEach(choices, function(item, index) {
				var number = index + 1;

				var name = 'themelet-' + number;

				assert.equal(item.name, name);
				assert.equal(item.value, name);
			});

			choices = promptUtil.getModuleChoices(themeletDependencies, {
				selectedModules: ['themelet-1']
			});

			_.forEach(choices, function(item, index) {
				var number = index + 1;

				var name = 'themelet-' + number;

				if (number == 1) {
					assert.equal(item.name, name + ' (selected)');
				}

				assert.equal(item.value, name);
			});

			choices = promptUtil.getModuleChoices(themeletDependencies, {
				themelet: true
			});

			_.forEach(choices, function(item, index) {
				var number = index + 1;

				var name = 'themelet-' + number;

				assert(!item.checked);
				assert.equal(item.name, name);
			});

			choices = promptUtil.getModuleChoices(themeletDependencies, {
				selectedModules: ['themelet-1'],
				themelet: true
			});

			_.forEach(choices, function(item, index) {
				var number = index + 1;

				var name = 'themelet-' + number;

				if (number == 1) {
					assert(item.checked);
				}
				else {
					assert(!item.checked);
				}

				assert.equal(item.name, name);
			});
		});
	});
});
