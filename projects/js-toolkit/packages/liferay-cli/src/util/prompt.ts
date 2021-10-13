/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';
import inquirer from 'inquirer';

const {info, print} = format;

interface ReduceablePrompt {
	default: boolean | number | string;
	defaultDescription?: string;
	message: string;
	name: string;
}

export default async function prompt<T extends object>(
	useDefaults: boolean,
	options: T,
	prompts: inquirer.QuestionCollection
): Promise<T> {
	if (useDefaults) {
		return (prompts as ReduceablePrompt[]).reduce((options, prompt) => {
			if (options[prompt.name] === undefined) {
				options[prompt.name] = prompt.default;

				if (prompt.defaultDescription) {
					print(info`${prompt.defaultDescription}`);
				}
			}

			return options;
		}, options);
	}

	const answers = await inquirer.prompt(prompts);

	return {
		...options,
		...answers,
	};
}
