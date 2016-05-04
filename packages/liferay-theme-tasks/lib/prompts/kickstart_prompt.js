'use strict';

var _ = require('lodash');
var exec = require('child_process').exec;
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var path = require('path');

var GlobalModulePrompt = require('./global_module_prompt');
var NPMModulePrompt = require('./npm_module_prompt');
var promptUtil = require('./prompt_util');
var themeFinder = require('../theme_finder');

function KiststartPrompt(cb) {
	var instance = this;

	this.done = cb;

	this._promptThemeSource();
}

KiststartPrompt.prototype = {
	_afterPromptModule: function(answers) {
		var done = this.done;

		if (answers.module) {
			this._installTempModule(answers.module, function() {
				done(answers);
			});
		}
		else {
			done(answers);
		}
	},

	_afterPromptThemeSource: function(answers) {
		var config = {
			themelet: false
		};

		if (answers.themeSource == 'npm') {
			new NPMModulePrompt(config, _.bind(this._afterPromptModule, this));
		}
		else if (answers.themeSource == 'global') {
			new GlobalModulePrompt(config, _.bind(this._afterPromptModule, this));
		}
	},

	_installTempModule(moduleName, cb) {
		var tempNodeModulesPath = path.join(process.cwd(), '.temp_node_modules');

		var child = exec('npm install --prefix ' + tempNodeModulesPath + ' ' + moduleName, cb);

		child.stdout.pipe(process.stdout);
	},

	_promptThemeSource: function(options) {
		var instance = this;

		var listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: [
						{
							name: 'Search globally installed npm modules',
							value: 'global'
						},
						{
							name: 'Search npm registry (published modules)',
							value: 'npm'
						}
					],
					message: 'Where would you like to search?',
					name: 'themeSource',
					type: listType
				}
			],
			_.bind(instance._afterPromptThemeSource, instance)
		);
	}
};

module.exports = KiststartPrompt;
