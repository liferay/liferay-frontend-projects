'use strict';

var _ = require('lodash');
var exec = require('child_process').exec;
var inquirer = require('inquirer');
var path = require('path');

var GlobalModulePrompt = require('./global_module_prompt');
var NPMModulePrompt = require('./npm_module_prompt');
var promptUtil = require('./prompt_util');
var themeUtil = require('../util');

function KiststartPrompt() {
	this.init.apply(this, arguments);
}

KiststartPrompt.prototype = {
	init: function(config, cb) {
		this.done = cb;
		this.themeConfig = config.themeConfig;

		this._promptThemeSource();
	},

	_afterPromptModule: function(answers) {
		var done = this.done;

		var module = answers.module;

		var pkg = answers.modules[module];

		if (pkg && pkg.realPath) {
			answers.modulePath = path.join(pkg.realPath, 'src');

			done(answers);
		}
		else if (pkg) {
			this._installTempModule(module, function() {
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

		var themeSource = answers.themeSource;

		if (themeSource === 'npm') {
			new NPMModulePrompt(config, _.bind(this._afterPromptModule, this));
		}
		else if (themeSource === 'global') {
			new GlobalModulePrompt(config, _.bind(this._afterPromptModule, this));
		}
		else if (themeSource === 'classic') {
			var classicPath = themeUtil.resolveDependency('liferay-frontend-theme-classic-web', this.themeConfig.version);

			this.done({
				modulePath: classicPath
			});
		}
	},

	_installTempModule: function(moduleName, cb) {
		var tempNodeModulesPath = path.join(process.cwd(), '.temp_node_modules');

		var child = exec('npm install --prefix ' + tempNodeModulesPath + ' ' + moduleName, cb);

		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stdout);
	},

	_promptThemeSource: function() {
		var instance = this;

		var listType = promptUtil.getListType();

		var choices = [
			{
				name: 'Search globally installed npm modules',
				value: 'global'
			},
			{
				name: 'Search npm registry (published modules)',
				value: 'npm'
			}
		];

		if (this.themeConfig && this.themeConfig.version !== '6.2') {
			choices = choices.concat([
				new inquirer.Separator(),
				{
					name: 'Classic',
					value: 'classic'
				}
			]);
		}

		inquirer.prompt(
			[
				{
					choices: choices,
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
