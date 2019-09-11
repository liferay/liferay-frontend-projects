/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const stripIndents = require('../../src/format/stripIndents');
const substituteTags = require('../../src/format/substituteTags');

describe('stripIndents()', () => {
	it('strips indents that are inside JSP placeholders', () => {
		const [source] = substituteTags(`
			<my:tag>
				var x = 1;

				<c:if test="<% Thing() %>">
					if (condition) {
						if (other) {
							foo();
						}
					}
				</c:if>

				var y = 1;
			</my:tag>
		`);

		const expected = `
			/*ʃʃʃʃ*/
			var x = 1;

			/*ʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃ*/
			if (condition) {
				if (other) {
					foo();
				}
			}
			/*ʅʅʅ*/

			var y = 1;
			/*ʅʅʅʅʅ*/
		`;

		const stripped = stripIndents(source);

		expect(stripped).toBe(expected);
	});

	it('does nothing to indents that are not inside JSP tags', () => {
		const source = `
			if (condition) {
				if (other) {
					foo();
				}
			}
		`;

		const stripped = stripIndents(source);

		expect(stripped).toBe(source);
	});
});
