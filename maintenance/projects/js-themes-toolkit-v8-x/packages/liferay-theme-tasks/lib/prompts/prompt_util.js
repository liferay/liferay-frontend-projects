/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const _ = require('lodash');
const os = require('os');

function formatThemeletSelection(modules, selectedModules) {
	const formattedSelection = {};

	if (selectedModules) {
		formattedSelection.removedThemelets = _.reduce(
			modules,
			(result, selected, name) => {
				if (selectedModules.indexOf(name) > -1 && !selected) {
					result.push(name);
				}

				return result;
			},
			[]
		);

		formattedSelection.keptThemelets = _.reduce(
			modules,
			(result, selected, name) => {
				if (selected && selectedModules.indexOf(name) > -1) {
					result.push(name);
				}

				return result;
			},
			[]
		);
	}

	selectedModules = selectedModules || [];

	formattedSelection.addedThemelets = _.reduce(
		modules,
		(result, selected, name) => {
			if (selected && selectedModules.indexOf(name) < 0) {
				result.push(name);
			}

			return result;
		},
		[]
	);

	return formattedSelection;
}

function getListType() {
	let listType = 'list';

	if (process.version > 'v0.12.7' && os.type() === 'Windows_NT') {
		listType = 'rawlist';
	}

	return listType;
}

function getModuleChoices(modules, config) {
	const selectedModules = config.selectedModules;

	if (config.themelet) {
		return _.map(modules, (module, name) => {
			return {
				checked: selectedModules && selectedModules.indexOf(name) > -1,
				name,
			};
		});
	}

	return _.map(modules, (module, name) => {
		return {
			name:
				selectedModules && selectedModules.indexOf(name) > -1
					? name + ' (selected)'
					: name,
			value: name,
		};
	});
}

module.exports = {formatThemeletSelection, getListType, getModuleChoices};
