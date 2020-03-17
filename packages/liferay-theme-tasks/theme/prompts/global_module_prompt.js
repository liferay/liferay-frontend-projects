/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const colors = require('ansi-colors');
const log = require('fancy-log');
const _ = require('lodash');

const themeFinder = require('../lib/theme_finder');
const ModulePrompt = require('./module_prompt');

class GlobalModulePrompt {
	constructor(...args) {
		this.init(...args);
	}

	init(config, cb) {
		this.done = cb;
		this.selectedModules = config.selectedModules;
		this.themelet = config.themelet;

		this._getGlobalModules(modules => {
			this.modules = modules;

			ModulePrompt.prompt(this, _.bind(this._afterPrompt, this));
		});
	}

	_afterPrompt(answers) {
		const type = this.themelet ? 'themelet' : 'theme';

		if (_.isEmpty(this.modules)) {
			log(
				colors.yellow(
					'No globally installed ' +
						type +
						' found. Install some with "npm i -g [name]"'
				)
			);

			if (!process.env.NODE_PATH) {
				log(
					colors.yellow('Warning:'),
					colors.cyan('NODE_PATH'),
					'environment variable not found. If you have globally installed modules that are not being located, please set',
					colors.cyan('NODE_PATH')
				);
			}
		}

		this.done(answers);
	}

	_getGlobalModules(cb) {
		themeFinder.getLiferayThemeModules(
			{
				globalModules: true,
				themelet: this.themelet,
			},
			cb
		);
	}
}

GlobalModulePrompt.prompt = (config, cb) => new GlobalModulePrompt(config, cb);

module.exports = GlobalModulePrompt;
