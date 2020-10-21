/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {parse} = require('../src');

describe('parse()', () => {
	it('returns an AST', async () => {
		const node = await parse('export const number = 1');

		expect(node.type).toBe('File');
	});
});
