/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const inquirer = require('inquirer');
const _ = require('lodash');

const GlobalModulePrompt = require('../prompts/global_module_prompt');
const NPMModulePrompt = require('../prompts/npm_module_prompt');
const themeUtil = require('../util');

function afterPromptThemeSource(version) {
	return function(answers, promptInstance) {
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
		} else if (version === '7.0' && themeSource === 'classic') {
			const classicPath = themeUtil.resolveDependency(
				'liferay-frontend-theme-classic-web',
				promptInstance.themeConfig.version
			);

			promptInstance.done({
				modulePath: classicPath,
			});
		}
	};
}

function choices(version) {
	let choices = [
		{
			name: 'Search globally installed npm modules',
			value: 'global',
		},
		{
			name: 'Search npm registry (published modules)',
			value: 'npm',
		},
	];

	if (version === '7.0') {
		choices = choices.concat([
			new inquirer.Separator(),
			{
				name: 'Classic',
				value: 'classic',
			},
		]);
	}

	return choices;
}

module.exports = {
	afterPromptThemeSource,
	choices,
};
