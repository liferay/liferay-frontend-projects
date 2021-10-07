/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	TRANSFORM_OPERATIONS,
	format,
	transformJsonFile,
	transformTextFile,
} from '@liferay/js-toolkit-core';

import type {Facet, Options} from '../index';

const {
	PkgJson: {addScripts},
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return options;
	},

	async render(options: Options): Promise<void> {
		print(info`Configuring build...`);

		// Add gitignores

		const gitignoreFile = options.outputPath.join('.gitignore');

		print(info`  Adding build directories to .gitignore`);

		await transformTextFile(
			gitignoreFile,
			gitignoreFile,
			appendLines('/build', '/dist')
		);

		// Add build scripts

		const pkgJsonFile = options.outputPath.join('package.json');

		print(info`  Configuring npm build scripts`);

		await transformJsonFile(
			pkgJsonFile,
			pkgJsonFile,
			addScripts({
				build: 'liferay build',
				clean: 'liferay clean',
				deploy: 'liferay deploy',
			})
		);
	},
};

export default facet;
