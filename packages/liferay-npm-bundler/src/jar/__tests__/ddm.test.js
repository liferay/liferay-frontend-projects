/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import readJsonSync from 'read-json-sync';

import {transformPreferences} from '../ddm';

describe('transformPreferences', () => {
	it('works', () => {
		const preferencesJson = readJsonSync(
			path.join(__dirname, '__fixtures__', 'preferences.json')
		);

		const ddmJson = transformPreferences(preferencesJson);

		const expectedPreferencesJson = readJsonSync(
			path.join(__dirname, '__snapshots__', 'expected.preferences.json')
		);

		expect(ddmJson).toEqual(expectedPreferencesJson);
	});
});
