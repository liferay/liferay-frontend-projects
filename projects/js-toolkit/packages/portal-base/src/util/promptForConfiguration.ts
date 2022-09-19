/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import inquirer from 'inquirer';

interface Answers {
	[key: string]: Value;
}

interface Prompt {
	choices?: Value[];
	default: Value;
	message: string;
	name: string;
	type: string;
	validate?: ValidateFunction;
}

interface ValidateFunction {
	(value: Value): true | string;
}

type Value = boolean | number | string;

export default async function promptForConfiguration(
	prompts: Prompt[]
): Promise<Answers> {
	const initialValues = prompts.reduce((values, prompt) => {
		values[prompt.name] = prompt.default;
		return values;
	}, {});

	const answers = await inquirer.prompt(prompts);

	for (const key of Object.keys(initialValues)) {
		if (initialValues[key] === answers[key]) {
			delete answers[key];
		}
	}

	return answers;
}
