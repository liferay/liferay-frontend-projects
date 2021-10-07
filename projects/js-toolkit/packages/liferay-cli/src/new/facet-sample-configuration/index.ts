/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TRANSFORM_OPERATIONS,
	format,
	transformJsonFile,
	transformTextFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs';

import type {Facet, Options} from '../index';

const {
	ConfigurationJson: {addField},
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return options;
	},

	async render(options: Options): Promise<void> {

		// Add configuration fields

		const configurationFile: FilePath = options.outputPath.join(
			'features/configuration.json'
		);

		if (fs.existsSync(configurationFile.asNative)) {
			print(
				info`  Adding System Settings Configuration schema`,
				info`  Adding Portlet Instance Configuration schema`
			);

			await transformJsonFile(
				configurationFile,
				configurationFile,
				addField('system', 'fruit', {
					default: 'orange',
					description: 'fruit-help',
					name: 'fruit',
					options: {
						apple: 'an-apple',
						orange: 'an-orange',
						pear: 'a-pear',
					},
					required: false,
					type: 'string',
				}),
				addField('portletInstance', 'drink', {
					default: 'water',
					description: 'drink-help',
					name: 'drink',
					options: {
						coffee: 'coffee',
						tea: 'tea',
						water: 'water',
					},
					required: false,
					type: 'string',
				})
			);
		}

		// Add language keys

		const languageFile: FilePath = options.outputPath.join(
			'features/localization/Language.properties'
		);

		if (fs.existsSync(languageFile.asNative)) {
			print(info`  Adding Configuration strings for English language`);

			await transformTextFile(
				languageFile,
				languageFile,
				appendLines(
					'fruit=Favorite fruit',
					'fruit-help=Choose the fruit you like the most',
					'an-orange=An orange',
					'a-pear=A pear',
					'an-apple=An apple',
					'drink=Favorite drink',
					'drink-help=Choose the drink you like the most',
					'coffee=Coffee',
					'tea=Tea',
					'water=Water'
				)
			);
		}
	},
};

export default facet;
