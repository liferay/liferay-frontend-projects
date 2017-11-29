'use strict';

let _ = require('lodash');
let exec = require('child_process').exec;
let inquirer = require('inquirer');
let path = require('path');

let GlobalModulePrompt = require('./global_module_prompt');
let NPMModulePrompt = require('./npm_module_prompt');
let promptUtil = require('./prompt_util');
let themeUtil = require('../util');
let divert = require('../divert');

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
		let done = this.done;

		let module = answers.module;

		let pkg = answers.modules[module];

		if (pkg && pkg.realPath) {
			answers.modulePath = path.join(pkg.realPath, 'src');

			done(answers);
		} else if (pkg) {
			this._installTempModule(module, function() {
				done(answers);
			});
		} else {
			done(answers);
		}
	},

	_afterPromptThemeSource: function(answers) {
		let config = {
			themelet: false,
		};

		let themeSource = answers.themeSource;

		if (themeSource === 'npm') {
			NPMModulePrompt.prompt(
				config,
				_.bind(this._afterPromptModule, this)
			);
		} else if (themeSource === 'global') {
			GlobalModulePrompt.prompt(
				config,
				_.bind(this._afterPromptModule, this)
			);
		} else if (themeSource === 'classic') {
			let classicPath = themeUtil.resolveDependency(
				'liferay-frontend-theme-classic-web',
				this.themeConfig.version
			);

			this.done({
				modulePath: classicPath,
			});
		}
	},

	_installTempModule: function(moduleName, cb) {
		let tempNodeModulesPath = path.join(
			process.cwd(),
			'.temp_node_modules'
		);

		let child = exec(
			'npm install --prefix ' + tempNodeModulesPath + ' ' + moduleName,
			cb
		);

		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stdout);
	},

	_promptThemeSource: function() {
		let instance = this;

		let listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: divert('kickstart_choices').choices,
					message: 'Where would you like to search?',
					name: 'themeSource',
					type: listType,
				},
			],
			_.bind(instance._afterPromptThemeSource, instance)
		);
	},
};

KiststartPrompt.prompt = function(config, cb) {
	return new KiststartPrompt(config, cb);
};

module.exports = KiststartPrompt;
