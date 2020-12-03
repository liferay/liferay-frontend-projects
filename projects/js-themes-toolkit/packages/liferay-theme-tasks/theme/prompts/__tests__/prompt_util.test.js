/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const _ = require('lodash');

const promptUtil = require('../util');

const liferayVersion = '7.0';
const liferayThemeThemletMetaData = {
	themelet: true,
	version: liferayVersion,
};
const themeletDependencies = {
	'themelet-1': {
		__realPath__: 'path/to/themelet-1',
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-1',
		version: liferayVersion,
	},
	'themelet-2': {
		__realPath__: 'path/to/themelet-2',
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-2',
		version: liferayVersion,
	},
	'themelet-3': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-3',
		version: liferayVersion,
	},
};

it('formatThemeletSelection should format themelet selection retrieved from getModuleChoices', () => {
	const data = {
		'themelet-1': true,
		'themelet-2': true,
		'themelet-3': false,
	};

	let formatted = promptUtil.formatThemeletSelection(data);

	expect(!formatted.keptThemelets).toBe(true);
	expect(!formatted.removedThemelets).toBe(true);
	expect(formatted.addedThemelets).toEqual(['themelet-1', 'themelet-2']);

	formatted = promptUtil.formatThemeletSelection(data, [
		'themelet-3',
		'themelet-2',
	]);

	expect(formatted.addedThemelets).toEqual(['themelet-1']);
	expect(formatted.keptThemelets).toEqual(['themelet-2']);
	expect(formatted.removedThemelets).toEqual(['themelet-3']);
});

it('getListType should get listType based on environment', () => {
	const listType = promptUtil.getListType();

	expect(listType == 'list' || listType == 'rawlist').toBe(true);
});

it('getModuleChoices should get module choices that are appropriate for extend type', () => {
	let choices = promptUtil.getModuleChoices(themeletDependencies, {});

	_.forEach(choices, (item, index) => {
		const number = index + 1;
		const name = 'themelet-' + number;

		expect(item.name).toBe(name);
		expect(item.value).toBe(name);
	});

	choices = promptUtil.getModuleChoices(themeletDependencies, {
		selectedModules: ['themelet-1'],
	});

	_.forEach(choices, (item, index) => {
		const number = index + 1;
		const name = 'themelet-' + number;

		if (number == 1) {
			expect(item.name).toBe(name + ' (selected)');
		}

		expect(item.value).toBe(name);
	});

	choices = promptUtil.getModuleChoices(themeletDependencies, {
		themelet: true,
	});

	_.forEach(choices, (item, index) => {
		const number = index + 1;
		const name = 'themelet-' + number;

		expect(!item.checked).toBe(true);
		expect(item.name).toBe(name);
	});

	choices = promptUtil.getModuleChoices(themeletDependencies, {
		selectedModules: ['themelet-1'],
		themelet: true,
	});

	_.forEach(choices, (item, index) => {
		const number = index + 1;
		const name = 'themelet-' + number;

		if (number == 1) {
			expect(item.checked).toBe(true);
		} else {
			expect(!item.checked).toBe(true);
		}

		expect(item.name).toBe(name);
	});
});
