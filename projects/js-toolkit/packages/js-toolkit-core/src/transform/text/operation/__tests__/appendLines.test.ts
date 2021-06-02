/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import appendLines from '../appendLines';

describe('appendLines', () => {
	it('adds lines', async () => {
		const text = 'En un lugar de la Mancha';

		const text2 = await appendLines(
			'de cuyo nombre no quiero acordarme',
			'no ha mucho tiempo que vivía un hidalgo'
		)(text);

		expect(text2).toBe(
			`En un lugar de la Mancha
de cuyo nombre no quiero acordarme
no ha mucho tiempo que vivía un hidalgo`
		);
	});

	it('respect initial line feed', async () => {
		const text = '';

		const text2 = await appendLines(
			'To be, or not to be,',
			'that is the question'
		)(text);

		expect(text2).toBe(
			`To be, or not to be,
that is the question`
		);
	});
});
