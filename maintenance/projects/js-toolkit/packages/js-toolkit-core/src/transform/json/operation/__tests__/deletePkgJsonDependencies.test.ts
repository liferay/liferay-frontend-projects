/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgJson from '../../../../schema/PkgJson';
import deletePkgJsonDependencies from '../deletePkgJsonDependencies';

describe('deletePkgJsonDependencies', () => {
	let pkgJson: PkgJson;

	beforeEach(() => {
		pkgJson = {
			dependencies: {
				react: '16.0.0',
			},
			devDependencies: {
				webpack: '4.0.0',
			},
			peerDependencies: {
				'react-dom': '16.0.0',
			},
			name: 'a-project',
			version: '1.0.0',
		};
	});

	it('deletes dependencies', async () => {
		const pkgJson2 = await deletePkgJsonDependencies('react')(pkgJson);

		expect(pkgJson2).toStrictEqual({
			devDependencies: {
				webpack: '4.0.0',
			},
			peerDependencies: {
				'react-dom': '16.0.0',
			},
			name: 'a-project',
			version: '1.0.0',
		});
	});

	it('deletes devDependencies', async () => {
		const pkgJson2 = await deletePkgJsonDependencies('webpack')(pkgJson);

		expect(pkgJson2).toStrictEqual({
			dependencies: {
				react: '16.0.0',
			},
			peerDependencies: {
				'react-dom': '16.0.0',
			},
			name: 'a-project',
			version: '1.0.0',
		});
	});

	it('deletes peerDependencies', async () => {
		const pkgJson2 = await deletePkgJsonDependencies('react-dom')(pkgJson);

		expect(pkgJson2).toStrictEqual({
			dependencies: {
				react: '16.0.0',
			},
			devDependencies: {
				webpack: '4.0.0',
			},
			name: 'a-project',
			version: '1.0.0',
		});
	});

	it('deletes from all dependency types at once', async () => {
		const pkgJson2 = await deletePkgJsonDependencies(
			'react',
			'webpack',
			'react-dom'
		)(pkgJson);

		expect(pkgJson2).toStrictEqual({
			name: 'a-project',
			version: '1.0.0',
		});
	});
});
