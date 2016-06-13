'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var chalk = gutil.colors;

var ModulePrompt = require('./module_prompt');
var promptUtil = require('./prompt_util');
var themeFinder = require('../theme_finder');

function GlobalModulePrompt() {
	this.init.apply(this, arguments);
}

GlobalModulePrompt.prototype = {
	init: function(config, cb) {
		var instance = this;

		this.done = cb;
		this.selectedModules = config.selectedModules;
		this.themelet = config.themelet;

		this._getGlobalModules(function(modules) {
			instance.modules = modules;

			new ModulePrompt(instance, _.bind(instance._afterPrompt, instance));
		});
	},

	_afterPrompt: function(answers) {
		var type = this.themelet ? 'themelet' : 'theme';

		if (_.isEmpty(this.modules)) {
			gutil.log(chalk.yellow('No globally installed ' + type + ' found. Install some with "npm i -g [name]"'));

			if (!process.env.NODE_PATH) {
				gutil.log(
					chalk.yellow('Warning:'),
					chalk.cyan('NODE_PATH'),
					'environment variable not found. If you have globally installed modules that are not being located, please set',
					chalk.cyan('NODE_PATH')
				);
			}
		}

		this.done(answers);
	},

	_getGlobalModules: function(cb) {
		themeFinder.getLiferayThemeModules({
			globalModules: true,
			themelet: this.themelet
		}, cb);
	}
};

module.exports = GlobalModulePrompt;
