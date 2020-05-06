/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project} from 'liferay-js-toolkit-core/lib/project';
import path from 'path';
import readJsonSync from 'read-json-sync';

import {transformPreferences} from '../ddm';

describe('transformPreferences', () => {
	it('works without L10N', () => {
		const mockProject = {
			l10n: {
				supported: false,
			},
		} as Project;

		const preferencesJson = readJsonSync(
			path.join(__dirname, '__fixtures__', 'preferences.json')
		);

		const ddmJson = transformPreferences(mockProject, preferencesJson);

		const expectedPreferencesJson = readJsonSync(
			path.join(__dirname, '__snapshots__', 'expected.preferences.json')
		);

		expect(ddmJson).toEqual(expectedPreferencesJson);
	});

	it('works with L10N', () => {
		const labels = {
			default: {
				'a-number': 'A number',
				'a-number-help': 'A number help',
				'a-string': 'A string',
				'a-string-help': 'A string help',
				'a-string-value': 'A string value',
				'a-fruit': 'A fruit',
				'a-fruit-help': 'A fruit help',
				'an-orange': 'An orange',
				'a-pear': 'A pear',
				'an-apple': 'An apple',
			},
			// eslint-disable-next-line @typescript-eslint/camelcase
			es_ES: {
				'a-number': 'Un número',
				'a-number-help': 'Ayuda de un número',
				'a-string': 'Una cadena',
				'a-string-help': 'Ayuda de una cadena',
				'a-string-value': 'Valor de una cadena',
				'a-fruit': 'Una fruta',
				'a-fruit-help': 'Ayuda de una fruta',
				'an-orange': 'Una naranja',
				'a-pear': 'Una pera',
				'an-apple': 'Una manzana',
			},
		};

		const mockProject = {
			l10n: {
				availableLocales: ['es_ES'],
				getLabels: (locale = 'default'): object => labels[locale],
				supported: true,
			},
		} as Project;

		const preferencesJson = readJsonSync(
			path.join(__dirname, '__fixtures__', 'preferences.l10n.json')
		);

		const ddmJson = transformPreferences(mockProject, preferencesJson);

		const expectedPreferencesJson = readJsonSync(
			path.join(
				__dirname,
				'__snapshots__',
				'expected.preferences.l10n.json'
			)
		);

		expect(ddmJson).toEqual(expectedPreferencesJson);
	});
});
