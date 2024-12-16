/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import ConfigurationJson from '../../../../schema/ConfigurationJson';
import addConfigurationJsonField from '../addConfigurationJsonField';

describe('addConfigurationJsonField', () => {
	let configurationJson: ConfigurationJson;

	beforeEach(() => {
		configurationJson = {
			portletInstance: {
				fields: {},
			},
			system: {
				category: 'Sample',
				fields: {},
				name: 'My Configuration',
			},
		};
	});

	it('adds system field', async () => {
		const configurationJson2 = await addConfigurationJsonField(
			'system',
			'drink',
			{
				name: 'Drink',
				type: 'string',
			}
		)(configurationJson);

		expect(configurationJson2).toStrictEqual({
			portletInstance: {
				fields: {},
			},
			system: {
				category: 'Sample',
				fields: {
					drink: {
						name: 'Drink',
						type: 'string',
					},
				},
				name: 'My Configuration',
			},
		});
	});

	it('adds portletInstance field', async () => {
		const configurationJson2 = await addConfigurationJsonField(
			'portletInstance',
			'food',
			{
				name: 'Food',
				type: 'number',
			}
		)(configurationJson);

		expect(configurationJson2).toStrictEqual({
			portletInstance: {
				fields: {
					food: {
						name: 'Food',
						type: 'number',
					},
				},
			},
			system: {
				category: 'Sample',
				fields: {},
				name: 'My Configuration',
			},
		});
	});
});
