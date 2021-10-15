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

import ensureOutputFile from '../../util/ensureOutputFile';

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

		print(info`  Adding build directories to {.gitignore}`);

		const gitignoreFile = ensureOutputFile(options, '.gitignore');

		await transformTextFile(
			gitignoreFile,
			gitignoreFile,
			appendLines('/build', '/dist')
		);

		print(info`  Configuring npm build scripts`);

		const pkgJsonFile = ensureOutputFile(options, 'package.json');

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
