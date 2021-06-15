/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import inquirer from 'inquirer';

import type {OptionValue, Options} from '../index';

interface ReduceablePrompt {
	default: OptionValue;
	message: string;
	name: string;
}

export default async function prompt(
	useDefaults: boolean,
	options: Options,
	prompts: inquirer.QuestionCollection
): Promise<Options> {
	if (useDefaults) {
		return (prompts as ReduceablePrompt[]).reduce((options, prompt) => {
			options[prompt.name] = prompt.default;

			return options;
		}, options);
	}

	const answers = await inquirer.prompt(prompts);

	return {
		...options,
		...answers,
	};
}
