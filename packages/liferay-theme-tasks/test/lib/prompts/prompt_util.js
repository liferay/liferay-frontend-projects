'use strict';

var _ = require('lodash');
var test = require('ava');

var promptUtil = require('../../../lib/prompts/prompt_util.js');

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

test('formatThemeletSelection should format themelet selection retrieved from getModuleChoices', function(t) {
	var data = {
		'themelet-1': true,
		'themelet-2': true,
		'themelet-3': false
	};

	var formatted = promptUtil.formatThemeletSelection(data);

	t.true(!formatted.keptThemelets);
	t.true(!formatted.removedThemelets);
	t.deepEqual(formatted.addedThemelets, ['themelet-1', 'themelet-2']);

	formatted = promptUtil.formatThemeletSelection(data, ['themelet-3', 'themelet-2']);

	t.deepEqual(formatted.addedThemelets, ['themelet-1']);
	t.deepEqual(formatted.keptThemelets, ['themelet-2']);
	t.deepEqual(formatted.removedThemelets, ['themelet-3']);
});

test('getListType should get listType based on environment', function(t) {
	var listType = promptUtil.getListType();

	t.true(listType == 'list' || listType == 'rawlist');
});

test('getModuleChoices should get module choices that are appropriate for extend type', function(t) {
	var choices = promptUtil.getModuleChoices(themeletDependencies, {});

	_.forEach(choices, function(item, index) {
		var number = index + 1;

		var name = 'themelet-' + number;

		t.is(item.name, name);
		t.is(item.value, name);
	});

	choices = promptUtil.getModuleChoices(themeletDependencies, {
		selectedModules: ['themelet-1']
	});

	_.forEach(choices, function(item, index) {
		var number = index + 1;

		var name = 'themelet-' + number;

		if (number == 1) {
			t.is(item.name, name + ' (selected)');
		}

		t.is(item.value, name);
	});

	choices = promptUtil.getModuleChoices(themeletDependencies, {
		themelet: true
	});

	_.forEach(choices, function(item, index) {
		var number = index + 1;

		var name = 'themelet-' + number;

		t.true(!item.checked);
		t.is(item.name, name);
	});

	choices = promptUtil.getModuleChoices(themeletDependencies, {
		selectedModules: ['themelet-1'],
		themelet: true
	});

	_.forEach(choices, function(item, index) {
		var number = index + 1;

		var name = 'themelet-' + number;

		if (number == 1) {
			t.true(item.checked);
		}
		else {
			t.true(!item.checked);
		}

		t.is(item.name, name);
	});
});
