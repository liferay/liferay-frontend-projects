'use strict';

const inquirer = require('inquirer');
const _ = require('lodash');

const divert = require('../../divert');
const GlobalModulePrompt = require('../../prompts/global_module_prompt');
const NPMModulePrompt = require('../../prompts/npm_module_prompt');
const themeUtil = require('../../util');

const choices = [
	{
		name: 'Search globally installed npm modules',
		value: 'global',
	},
	{
		name: 'Search npm registry (published modules)',
		value: 'npm',
	},
	new inquirer.Separator(),
	{
		name: 'Classic',
		value: 'classic',
	},
];

function _afterPromptThemeSource(answers, promptInstance) {
	const config = {
		themelet: false,
	};

	const themeSource = answers.themeSource;

	if (themeSource === 'npm') {
		NPMModulePrompt.prompt(
			config,
			_.bind(promptInstance._afterPromptModule, promptInstance)
		);
	} else if (themeSource === 'global') {
		GlobalModulePrompt.prompt(
			config,
			_.bind(promptInstance._afterPromptModule, promptInstance)
		);
	} else if (themeSource === 'classic') {
		let classicPath = themeUtil.resolveDependency(
			divert('dependencies').getDependencyName('classic'),
			promptInstance.themeConfig.version
		);

		promptInstance.done({
			modulePath: classicPath,
		});
	}
}

module.exports = {
	choices,
	_afterPromptThemeSource,
};
