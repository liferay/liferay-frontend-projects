/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	addPkgJsonDependencies,
	addPkgJsonScripts,
	transformJsonFile,
} from '@liferay/js-toolkit-core';

import * as facetProject from '../facet-project';
import prompt from '../util/prompt';

import type {Options} from '..';

export const name = 'Liferay Platform Project';

export async function processOptions(options: Options): Promise<Options> {
	options = await facetProject.processOptions(options);

	return prompt(options, [
		{
			choices: ['portal-7.4-ga1'],
			default: 'portal-7.4-ga1',
			message: 'What will be your target platform?',
			name: 'platform',
			type: 'list',
		},
	]);
}

export async function render(options: Options): Promise<void> {
	await facetProject.render(options);

	const pkgJsonFile = options.outputPath.join('package.json');

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		addPkgJsonDependencies({
			[`@liferay/${options.platform}`]: '^1.0.0',
		}),
		addPkgJsonScripts({
			build: 'liferay build',
		})
	);
}
