/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const _ = require('lodash');

const GlobalModulePrompt = require('../prompts/global_module_prompt');
const NPMModulePrompt = require('../prompts/npm_module_prompt');

function afterPromptThemeSource(_version) {
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
		}
	};
}

function choices(_version) {
	return [
		{
			name: 'Search globally installed npm modules',
			value: 'global',
		},
		{
			name: 'Search npm registry (published modules)',
			value: 'npm',
		},
	];
}

module.exports = {
	afterPromptThemeSource,
	choices,
};
