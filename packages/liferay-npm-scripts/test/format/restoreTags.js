/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const restoreTags = require('../../src/format/restoreTags');
const substituteTags = require('../../src/format/substituteTags');

describe('restoreTags()', () => {
	it('puts previously extracted tags back in their place (round-trip)', () => {
		const source = `
			text
			#{expr}
			more <%= getStuff() %> here

			<%
				/* comment */
			%>
		`;

		const [text, tags] = substituteTags(source);

		// Some fake formatting that moves and changes text.
		const formattedText = '\n\t\t\t// Prefix' + text.toUpperCase();

		const result = restoreTags(formattedText, tags);

		const expected = `
			// Prefix
			TEXT
			#{expr}
			MORE <%= getStuff() %> HERE

			<%
				/* comment */
			%>
		`;

		expect(result).toEqual(expected);
	});

	it('throws when passed the wrong number of tags', () => {
		expect(() => {
			restoreTags('some text', ['<%= "a tag" %>']);
		}).toThrow('Expected replacement count 0, but got 1');
	});
});
