/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {normalizeImportsConfig, unrollImportsConfig} from '../imports';

describe('normalizeImportsConfig()', () => {
	it('works for empty string format normalization', () => {
		const imports = normalizeImportsConfig({
			provider1: {
				dep1: '^1.0.0',
				dep2: '^2.0.0',
			},
			provider2: {
				dep9: '^9.0.0',
				dep8: '^8.0.0',
			},
			'': {
				depA: '3.0.0',
			},
			depB: {
				'/': '4.0.0',
				depC: '5.0.0',
			},
		});

		expect(imports).toMatchSnapshot();
	});

	it('works for slash format normalization', () => {
		const imports = normalizeImportsConfig(
			{
				provider1: {
					dep1: '^1.0.0',
					dep2: '^2.0.0',
				},
				provider2: {
					dep9: '^9.0.0',
					dep8: '^8.0.0',
				},
				'': {
					depA: '3.0.0',
				},
				depB: {
					'/': '4.0.0',
					depC: '5.0.0',
				},
			},
			true
		);

		expect(imports).toMatchSnapshot();
	});
});

it('unrollImportsConfig works', () => {
	const imports = unrollImportsConfig({
		provider1: {
			dep1: '^1.0.0',
			dep2: '^2.0.0',
		},
		provider2: {
			dep9: '^9.0.0',
			dep8: '^8.0.0',
		},
	});

	expect(imports['dep1']).toMatchObject({
		name: 'provider1',
		version: '^1.0.0',
	});
	expect(imports['dep2']).toMatchObject({
		name: 'provider1',
		version: '^2.0.0',
	});
	expect(imports['dep9']).toMatchObject({
		name: 'provider2',
		version: '^9.0.0',
	});
	expect(imports['dep8']).toMatchObject({
		name: 'provider2',
		version: '^8.0.0',
	});
});

it('unrollImportsConfig throws for duplicated definitions', () => {
	expect(() =>
		unrollImportsConfig({
			provider1: {
				dep1: '^1.0.0',
			},
			provider2: {
				dep1: '^1.0.0',
			},
		})
	).toThrow();
});

describe('unrollImportsConfig handles null namespaces correctly', () => {
	it('when described the canonical way', () => {
		const imports = unrollImportsConfig({
			'': {
				dep: '^1.0.0',
			},
		});

		expect(imports['dep']).toMatchObject({name: '', version: '^1.0.0'});
	});

	it('when described the sweet way', () => {
		const imports = unrollImportsConfig({
			dep: {
				'/': '^1.0.0',
			},
		});

		expect(imports['dep']).toMatchObject({name: '', version: '^1.0.0'});
	});
});
