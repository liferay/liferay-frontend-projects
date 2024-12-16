/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const config = require('./config');

/**
 * A function to process prompts as specified in the configuration file.
 * @param  {Generator} generator a Yeoman generator
 * @param {string} namespace the generator namespace as defined in
 * 					config.getDefaultAnswer()
 * @param  {Array} prompts a Yeoman prompts array
 * @return {object} the set of answers
 */
async function promptWithConfig(generator, namespace, prompts) {
	if (Array.isArray(namespace)) {
		prompts = namespace;
		namespace = generator.namespace;
	}

	// Tweak defaults with config values

	prompts = prompts.map((prompt) => {
		let defaultDefault = undefined;

		if (prompt.default !== undefined) {
			defaultDefault = prompt.default;
		}

		prompt.default = config.getDefaultAnswer(
			namespace,
			prompt.name,
			defaultDefault
		);

		return prompt;
	});

	// Decide whether to run in batch or interactive mode

	if (config.batchMode()) {
		return prompts.reduce((answers, prompt) => {
			let val = prompt.default;

			if (typeof val === 'function') {
				val = val(answers);
			}

			answers[prompt.name] = val;

			return answers;
		}, {});
	}
	else {
		return await generator.prompt(prompts);
	}
}

module.exports = promptWithConfig;
