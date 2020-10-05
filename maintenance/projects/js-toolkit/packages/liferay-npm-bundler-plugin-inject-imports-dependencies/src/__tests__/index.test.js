/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

import plugin from '../index';

it('injects imports', () => {
	const pkgJson = {
		name: 'package',
		version: '2.0.0',
		dependencies: {
			'root$pkg-a': '^1.0.0',
			'root$pkg-b': '^2.0.0',
			'root$pkg-c': '^3.0.0',
		},
	};

	plugin(
		{
			rootPkgJson: {
				name: 'root',
				version: '1.0.0',
			},
			globalConfig: {
				imports: {
					provider: {
						'pkg-a': '^1.0.0',
						'pkg-b': '^2.0.0',
					},
					'': {
						'pkg-c': '^3.0.0',
					},
				},
			},
			config: {},
			log: new PluginLogger(),
		},
		{pkgJson}
	);

	expect(pkgJson).toMatchSnapshot();
});

it('injects imports even when not present in package.json', () => {
	const pkgJson = {
		name: 'package',
		version: '2.0.0',
	};

	plugin(
		{
			rootPkgJson: {
				name: 'root',
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
		{pkgJson}
	);

	expect(pkgJson).toMatchSnapshot();
});

it('logs results correctly', () => {
	const pkgJson = {
		name: 'package',
		version: '2.0.0',
		dependencies: {
			'root$pkg-a': '^1.0.0',
			'root$pkg-b': '^2.0.0',
		},
	};
	const log = new PluginLogger();

	plugin(
		{
			rootPkgJson: {
				name: 'root',
				version: '1.0.0',
			},
			globalConfig: {
				imports: {
					provider: {
						'pkg-a': '^1.0.0',
						'pkg-b': '^3.0.0',
					},
					'': {
						'pkg-c': '^3.0.0',
					},
				},
			},
			config: {},
			log,
		},
		{pkgJson}
	);

	expect(log.messages).toMatchSnapshot();
});
