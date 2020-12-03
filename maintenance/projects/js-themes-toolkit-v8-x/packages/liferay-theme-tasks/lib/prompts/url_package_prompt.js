/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const inquirer = require('inquirer');
const {URL} = require('url');

const themeFinder = require('../theme_finder');

class URLPackagePrompt {
	constructor(...args) {
		this.init(...args);
	}

	init(config, cb) {
		this.done = cb;
		this.themelet = config.themelet;

		this._prompt();
	}

	_validatePackageURL(packageURL, _answers) {
		try {
			new URL(packageURL);
		}
		catch (err) {
			return `"${packageURL}" is not a valid URL`;
		}

		return true;
	}

	_afterPrompt(answers) {
		const config = themeFinder.getLiferayThemeModuleFromURL(
			answers.packageURL
		);

		answers.modules = {
			[config.name]: { ...config, __packageURL__: answers.packageURL,},
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
		}
		else {
			answers.module = config.name;
		}

		this.done(answers);
	}

	_prompt() {
		inquirer.prompt(
			[
				{
					message: 'Enter the URL for the package:',
					name: 'packageURL',
					type: 'input',
					validate: this._validatePackageURL,
				},
			],
			this._afterPrompt.bind(this)
		);
	}
}

URLPackagePrompt.prompt = (config, cb) => new URLPackagePrompt(config, cb);

module.exports = URLPackagePrompt;
