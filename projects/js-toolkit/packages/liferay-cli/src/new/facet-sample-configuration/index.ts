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

import ensureOutputFile from '../util/ensureOutputFile';

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
		if (!options.addConfigurationSupport) {
			return;
		}

		print(info`  Adding configuration schemas`);

		const configurationFile = ensureOutputFile(
			options,
			'features/configuration.json'
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

		if (options.addLocalizationSupport) {
			print(info`  Adding configuration labels for English language`);

			const languageFile = ensureOutputFile(
				options,
				'features/localization/Language.properties'
			);

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
