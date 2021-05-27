/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';
import inquirer from 'inquirer';

import type {OptionValue, Options} from '../index';

interface DefaultFunction {
	(options: Options): OptionValue;
}

interface ReduceablePrompt {
	default: DefaultFunction | OptionValue;
	message: string;
	name: string;
}

const {print, question} = format;

export default async function prompt(
	options: Options,
	prompts: inquirer.QuestionCollection
): Promise<Options> {
	if (options.batch) {
		return (prompts as ReduceablePrompt[]).reduce((options, prompt) => {
			let answer = prompt.default;

			if (typeof answer === 'function') {
				answer = answer(options);
			}

			print(question`${prompt.message} {${answer}}`);

			options[prompt.name] = answer;

			return options;
		}, options);
	}

	return {
		...options,
		...(await inquirer.prompt(prompts)),
	};
}
