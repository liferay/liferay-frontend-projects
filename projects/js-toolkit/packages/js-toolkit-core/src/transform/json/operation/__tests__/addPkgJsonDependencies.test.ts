/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgJson from '../../../../schema/PkgJson';
import addPkgJsonDependencies from '../addPkgJsonDependencies';

describe('addPkgJsonDependencies', () => {
	let pkgJson: PkgJson;

	beforeEach(() => {
		pkgJson = {
			name: 'a-project',
			version: '1.0.0',
		};
	});

	it('adds dependencies', async () => {
		const pkgJson2 = await addPkgJsonDependencies({
			'react': '^16.0.0',
			'react-dom': '^16.0.0',
		})(pkgJson);

		expect(pkgJson2).toStrictEqual({
			dependencies: {
				'react': '^16.0.0',
				'react-dom': '^16.0.0',
			},
			name: 'a-project',
			version: '1.0.0',
		});
	});

	it('adds devDependencies', async () => {
		const pkgJson2 = await addPkgJsonDependencies(
			{
				'react': '^16.0.0',
				'react-dom': '^16.0.0',
			},
			'dev'
		)(pkgJson);

		expect(pkgJson2).toStrictEqual({
			devDependencies: {
				'react': '^16.0.0',
				'react-dom': '^16.0.0',
			},
			name: 'a-project',
			version: '1.0.0',
		});
	});

	it('adds peerDependencies', async () => {
		const pkgJson2 = await addPkgJsonDependencies(
			{
				'react': '^16.0.0',
				'react-dom': '^16.0.0',
			},
			'peer'
		)(pkgJson);

		expect(pkgJson2).toStrictEqual({
			name: 'a-project',
			peerDependencies: {
				'react': '^16.0.0',
				'react-dom': '^16.0.0',
			},
			version: '1.0.0',
		});
	});
});
