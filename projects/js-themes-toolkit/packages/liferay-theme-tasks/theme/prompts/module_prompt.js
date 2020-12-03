/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const inquirer = require('inquirer');
const _ = require('lodash');

const promptUtil = require('./util');

class ModulePrompt {
	constructor(...args) {
		this.init(...args);
	}

	init(config, cb) {
		this.done = cb;
		this.modules = config.modules;
		this.selectedModules = config.selectedModules;
		this.themelet = config.themelet;

		this._prompt();
	}

	_afterPrompt(answers) {
		if (this.themelet) {
			_.assign(
				answers,
				promptUtil.formatThemeletSelection(
					answers.module,
					this.selectedModules
				)
			);
		}

		answers.modules = this.modules;

		this.done(answers);
	}

	_filterModule(input) {
		if (this.themelet) {
			return _.mapValues(this.modules, (theme, name) => {
				return input.indexOf(name) > -1;
			});
		}

		return input;
	}

	_getModuleChoices() {
		return promptUtil.getModuleChoices(this.modules, this);
	}

	_getModuleWhen() {
		return !_.isEmpty(this.modules);
	}

	_prompt() {
		const themelet = this.themelet;

		const listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: _.bind(this._getModuleChoices, this),
					filter: _.bind(this._filterModule, this),
					message: themelet ? 'Select a themelet' : 'Select a theme',
					name: 'module',
					type: themelet ? 'checkbox' : listType,
					when: _.bind(this._getModuleWhen, this),
				},
			],
			_.bind(this._afterPrompt, this)
		);
	}
}

ModulePrompt.prompt = (config, cb) => new ModulePrompt(config, cb);

module.exports = ModulePrompt;
