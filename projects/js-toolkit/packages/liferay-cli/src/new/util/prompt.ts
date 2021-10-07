/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import inquirer from 'inquirer';
import {format} from '@liferay/js-toolkit-core';

const {info, print} = format;

import type {OptionValue, Options} from '../index';

interface ReduceablePrompt {
	default: OptionValue;
	defaultDescription?: string;
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
