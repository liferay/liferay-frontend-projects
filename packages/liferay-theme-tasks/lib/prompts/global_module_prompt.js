'use strict';

const _ = require('lodash');
const colors = require('ansi-colors');
const log = require('fancy-log');

const ModulePrompt = require('./module_prompt');
const themeFinder = require('../theme_finder');

function GlobalModulePrompt() {
	this.init.apply(this, arguments);
}

GlobalModulePrompt.prototype = {
	init: function(config, cb) {
		let instance = this;

		this.done = cb;
		this.selectedModules = config.selectedModules;
		this.themelet = config.themelet;

		this._getGlobalModules(function(modules) {
			instance.modules = modules;

			ModulePrompt.prompt(
				instance,
				_.bind(instance._afterPrompt, instance)
			);
		});
	},

	_afterPrompt: function(answers) {
		let type = this.themelet ? 'themelet' : 'theme';

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
	},

	_getGlobalModules: function(cb) {
		themeFinder.getLiferayThemeModules(
			{
				globalModules: true,
				themelet: this.themelet,
			},
			cb
		);
	},
};

GlobalModulePrompt.prompt = function(config, cb) {
	return new GlobalModulePrompt(config, cb);
};

module.exports = GlobalModulePrompt;
