/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import normalizeImportsConfig from '../normalizeImportsConfig';

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
