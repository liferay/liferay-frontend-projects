/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const colors = require('ansi-colors');
const log = require('fancy-log');
const inquirer = require('inquirer');
const _ = require('lodash');

const themeFinder = require('../lib/theme_finder');
const ModulePrompt = require('./module_prompt');

class NPMModulePrompt {
	constructor(...args) {
		this.init(...args);
	}

	init(config, cb) {
		this.done = cb;
		this.selectedModules = config.selectedModules;
		this.themelet = config.themelet;

		this._promptSearchTerms();
	}

	_afterPrompt(answers) {
		this.done(answers);
	}

	_afterPromptSearchTerms(answers) {
		const themelet = this.themelet;

		this._getNPMModules(answers.searchTerms, modules => {
			if (_.isEmpty(modules)) {
				const type = themelet ? 'themelets' : 'themes';

				log(colors.yellow('No ' + type + ' matched your search!'));

				this._promptSearchTerms();
			} else {
				this.modules = modules;

				ModulePrompt.prompt(this, _.bind(this._afterPrompt, this));
			}
		});
	}

	_getNPMModules(searchTerms, cb) {
		themeFinder.getLiferayThemeModules(
			{
				globalModules: false,
				searchTerms,
				themelet: this.themelet,
			},
			cb
		);
	}

	_promptSearchTerms() {
		const themelet = this.themelet;

		inquirer.prompt(
			[
				{
					message: themelet
						? 'Search npm for themelets:'
						: 'Search npm for themes:',
					name: 'searchTerms',
				},
			],
			_.bind(this._afterPromptSearchTerms, this)
		);
	}
}

NPMModulePrompt.prompt = (config, cb) => new NPMModulePrompt(config, cb);

module.exports = NPMModulePrompt;
