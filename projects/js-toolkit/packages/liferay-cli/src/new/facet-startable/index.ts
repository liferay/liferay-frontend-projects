/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	TRANSFORM_OPERATIONS,
	format,
	transformJsonFile,
} from '@liferay/js-toolkit-core';

import ensureOutputFile from '../../util/ensureOutputFile';

import type {Facet, Options} from '../index';

const {
	PkgJson: {addScripts},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return options;
	},

	async render(options: Options): Promise<void> {
		print(info`Configuring live development...`);

		print(info`  Configuring npm build scripts`);

		const pkgJsonFile = ensureOutputFile(options, 'package.json');

		await transformJsonFile(
			pkgJsonFile,
			pkgJsonFile,
			addScripts({
				start: 'liferay start',
			})
		);
	},
};

export default facet;
