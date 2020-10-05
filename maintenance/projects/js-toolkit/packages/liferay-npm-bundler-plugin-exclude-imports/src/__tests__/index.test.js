/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

import plugin from '../index';

it('empties files when package is listed in imports', () => {
	const files = ['1.js', '2.js', '3.js'];

	plugin(
		{
			pkg: {
				name: 'pkg-a',
				version: '1.0.0',
			},
			globalConfig: {
				imports: {
					provider: {
						'pkg-a': '^1.0.0',
					},
				},
			},
			config: {},
			log: new PluginLogger(),
		},
		{
			files,
		}
	);

	expect(files).toHaveLength(0);
});

it('leaves files untouched when package is missing from imports', () => {
	const originalFiles = ['1.js', '2.js', '3.js'];
	const files = originalFiles.slice();

	plugin(
		{
			pkg: {
				name: 'pkg-a',
				version: '1.0.0',
			},
			globalConfig: {
				imports: {
					provider: {
						'other-package': '^1.0.0',
					},
				},
			},
			config: {},
			log: new PluginLogger(),
		},
		{
			files,
		}
	);

	expect(files).toEqual(originalFiles);
});
