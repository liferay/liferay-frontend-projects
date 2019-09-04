/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const toWhitespace = require('../../src/format/toWhitespace');

describe('toWhitespace()', () => {
	it('replaces a simple string with same-shaped whitespace', () => {
		const original = 'foo bar';
		const expected = '       ';

		expect(toWhitespace(original)).toBe(expected);
	});

	it('replaces a multiline string with same-shaped whitespace', () => {
		const original = '  foo\n\t\tbar baz\n';
		const expected = '     \n\t\t       \n';

		expect(toWhitespace(original)).toBe(expected);
	});

	it('leaves Windows-style CRLF as-is', () => {
		const original = 'one\r\ntwo';
		const expected = '   \r\n   ';

		expect(toWhitespace(original)).toBe(expected);
	});
});
