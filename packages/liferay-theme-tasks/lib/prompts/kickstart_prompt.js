'use strict';

let {exec} = require('child_process');
let inquirer = require('inquirer');
let _ = require('lodash');
let path = require('path');

let promptUtil = require('./prompt_util');
let divert = require('../divert');

function KickstartPrompt() {
	this.init.apply(this, arguments);
}

KickstartPrompt.prototype = {
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
		divert('kickstart_prompt_helpers')._afterPromptThemeSource(
			answers,
			this
		);
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
					choices: divert('kickstart_prompt_helpers').choices,
					message: 'Where would you like to search?',
					name: 'themeSource',
					type: listType,
				},
			],
			_.bind(instance._afterPromptThemeSource, instance)
		);
	},
};

KickstartPrompt.prompt = function(config, cb) {
	return new KickstartPrompt(config, cb);
};

module.exports = KickstartPrompt;
