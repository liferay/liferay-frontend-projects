/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	TRANSFORM_OPERATIONS,
	format,
	transformTextFile,
} from '@liferay/js-toolkit-core';

import ensureOutputFile from '../../util/ensureOutputFile';

import type {Facet, Options} from '../index';

const {
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return options;
	},

	async render(options: Options): Promise<void> {
		print(info`  Adding sample CSS styles`);

		const stylesFile = ensureOutputFile(options, 'src/css/styles.scss');

		await transformTextFile(
			stylesFile,
			stylesFile,
			appendLines(
				'.pre {',
				'	font-family: monospace;',
				'	white-space: pre;',
				'}',
				'',
				'.tag {',
				'	font-weight: bold;',
				'	margin-right: 1em;',
				'}',
				'',
				'.value {',
				'	font-family: monospace;',
				'}'
			)
		);
	},
};

export default facet;
