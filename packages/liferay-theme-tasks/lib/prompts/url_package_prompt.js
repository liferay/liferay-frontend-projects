/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
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

	_validatePackageURL(packageURL, _answers) {
		try {
			new URL(packageURL);
		} catch (err) {
			return `"${packageURL}" is not a valid URL`;
		}

		return true;
	}

	_afterPrompt(answers) {
		const config = themeFinder.getLiferayThemeModuleFromURL(
			answers.packageURL
		);
		answers.module = config.name;
		answers.modules = {
			[config.name]: Object.assign({}, config, {
				__packageURL__: answers.packageURL,
			}),
		};
		this.done(answers);
	}
}

URLPackagePrompt.prompt = (config, cb) => new URLPackagePrompt(config, cb);

module.exports = URLPackagePrompt;
