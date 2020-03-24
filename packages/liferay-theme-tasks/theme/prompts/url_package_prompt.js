/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const inquirer = require('inquirer');
const _ = require('lodash');
const {URL} = require('url');

const themeFinder = require('../lib/theme_finder');
const promptUtil = require('./util');

class URLPackagePrompt {
	constructor(...args) {
		this.init(...args);
	}

	init(config, cb) {
		this.done = cb;
		this.themelet = config.themelet;
		this.config = config;

		this._prompt();
	}

	_afterPrompt(answers) {
		this._handleThemeletSelection(answers);

		if (answers.packageURL) {
			const config = themeFinder.getLiferayThemeModuleFromURL(
				answers.packageURL
			);

			answers.modules = {
				[config.name]: {
					...config,
					__packageURL__: answers.packageURL,
				},
			};

			if (this.themelet) {
				answers.module = {[config.name]: true};
				answers.addedThemelets = [config.name];

				if (answers.removedThemelets) {
					const index = answers.removedThemelets.indexOf(config.name);

					if (index > -1) {
						answers.removedThemelets.splice(index, 1);
					}
				}
			} else {
				answers.module = config.name;
			}
		}

		this.done(answers);
	}

	_filterModule(input) {
		return _.mapValues(
			this.config.selectedModules,
			name => input.indexOf(name) > -1
		);
	}

	_getModuleChoices() {
		const choices = _.map(this.config.selectedModules, name => ({
			checked: true,
			name,
		}));

		return choices;
	}

	_getModuleWhen() {
		return !_.isEmpty(this.config.selectedModules);
	}

	_handleThemeletSelection(answers) {
		if (this.themelet && answers.module) {
			Object.keys(answers.module).forEach(k => {
				const moduleName = this.config.selectedModules[k];
				answers.module[moduleName] = answers.module[k];
				delete answers.module[k];
			});

			_.assign(
				answers,
				promptUtil.formatThemeletSelection(
					answers.module,
					this.config.selectedModules
				)
			);
		}
	}

	_prompt() {
		const questions = [];

		if (this.themelet) {
			questions.push({
				choices: _.bind(this._getModuleChoices, this),
				filter: _.bind(this._filterModule, this),
				message: 'Select the themelets you want to keep:',
				name: 'module',
				type: 'checkbox',
				when: _.bind(this._getModuleWhen, this),
			});
		}

		questions.push({
			message: `Enter the URL for the package:${
				this.themelet ? ' (Empty to skip)' : ''
			}`,
			name: 'packageURL',
			type: 'input',
			validate: this.themelet
				? this._validatePackageURLAllowEmpty.bind(this)
				: this._validatePackageURL.bind(this),
		});

		inquirer.prompt(questions, this._afterPrompt.bind(this));
	}

	_validatePackageURLAllowEmpty(packageURL, _answers) {
		if (!packageURL) {
			return true;
		}

		return this._validatePackageURL(packageURL, _answers);
	}

	_validatePackageURL(packageURL, _answers) {
		try {
			new URL(packageURL);
		} catch (err) {
			return `"${packageURL}" is not a valid URL`;
		}

		return true;
	}
}

URLPackagePrompt.prompt = (config, cb) => new URLPackagePrompt(config, cb);

module.exports = URLPackagePrompt;
