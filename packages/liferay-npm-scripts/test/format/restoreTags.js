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

			<c:if test="<%= someValue() %>">
				children
			</c:if>
		`;

		const [text, tags] = substituteTags(source);

		// Some fake formatting that moves and changes text.
		const formattedText =
			'\n\t\t\t// Prefix' + text.replace('children', 'CHILDREN');

		const result = restoreTags(formattedText, tags);

		const expected = `
			// Prefix
			text
			#{expr}
			more <%= getStuff() %> here

			<%
				/* comment */
			%>

			<c:if test="<%= someValue() %>">
				CHILDREN
			</c:if>
		`;

		expect(result).toEqual(expected);
	});

	it('restores blocks even if Prettier splits them across lines', () => {
		// Prettier could conceiveably break an "if" across lines.
		const text = `
			if (
				ʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃ
			) {
				alert('done');
			}/*ʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅʅ*/
		`;

		const tags = [
			'<my-long-namespace:this-tag>',
			'</my-long-namespace:this-tag>'
		];

		const result = restoreTags(text, tags);

		const expected = `
			<my-long-namespace:this-tag>
				alert('done');
			</my-long-namespace:this-tag>
		`;

		expect(result).toEqual(expected);
	});

	it('throws when passed the wrong number of tags', () => {
		expect(() => {
			restoreTags('some text', ['<%= "a tag" %>']);
		}).toThrow('Expected replacement count 0, but got 1');
	});
});
