'use strict';

var _ = require('lodash');
var os = require('os');

var promptUtil = {};

promptUtil.formatThemeletSelection = function(modules, selectedModules) {
	var formattedSelection = {};

	if (selectedModules) {
		formattedSelection.removedThemelets = _.reduce(modules, function(result, selected, name) {
			if (selectedModules.indexOf(name) > -1 && !selected) {
				result.push(name);
			}

			return result;
		}, []);

		formattedSelection.keptThemelets = _.reduce(modules, function(result, selected, name) {
			if (selected && selectedModules.indexOf(name) > -1) {
				result.push(name);
			}

			return result;
		}, []);
	}

	selectedModules = selectedModules || [];

	formattedSelection.addedThemelets = _.reduce(modules, function(result, selected, name) {
		if (selected && selectedModules.indexOf(name) < 0) {
			result.push(name);
		}

		return result;
	}, []);

	return formattedSelection;
};

promptUtil.getListType = function() {
	var listType = 'list';

	if (process.version > 'v0.12.7' && os.type() === 'Windows_NT') {
		listType = 'rawlist';
	}

	return listType;
};

promptUtil.getModuleChoices = function(modules, config) {
	var selectedModules = config.selectedModules;

	if (config.themelet) {
		return _.map(modules, function(module, name) {
			return {
				checked: selectedModules && selectedModules.indexOf(name) > -1,
				name: name
			};
		});
	}

	return _.map(modules, function(module, name) {
		return {
			name: selectedModules && selectedModules.indexOf(name) > -1 ? name + ' (selected)' : name,
			value: name
		};
	});
};

module.exports = promptUtil;
