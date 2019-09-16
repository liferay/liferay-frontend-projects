/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const dedent = require('../../src/format/dedent');

describe('dedent()', () => {
	it('dedents based on the smallest existing indent (spaces)', () => {
		expect(dedent('  def foo\n    1\n  end')).toBe('def foo\n  1\nend');
	});

	it('dedents based on the smallest existing indent (tabs)', () => {
		expect(dedent('\t\tdef foo\n\t\t\t1\n\t\tend')).toBe(
			'def foo\n\t1\nend'
		);
	});

	it('handles mixed tabs and spaces', () => {
		// Common, for example, in source with multiline comments.
		expect(
			dedent(`
			/**
			 * This is a comment.
			 */
			function fn() {
				return arguments;
			}
		`)
		).toBe(
			// prettier-ignore
			'/**\n' +
			' * This is a comment.\n' +
			' */\n' +
			'function fn() {\n' +
			'\treturn arguments;\n' +
			'}'
		);
	});

	it('accepts a custom tabWidth argument', () => {
		expect(
			dedent(
				`
			function fn() {
				return;
	        	} // tab, 8 spaces, tab
		`,
				8
			)
		).toBe(
			// prettier-ignore
			'function fn() {\n' +
			'\treturn;\n' +
			'} // tab, 8 spaces, tab'
		);
	});

	it('exposes the minimum indent (tab count) from the last call', () => {
		dedent('no indent');

		expect(dedent.lastMinimum).toBe(0);

		dedent('  less than one tab indent');

		expect(dedent.lastMinimum).toBe(0);

		dedent('\tone tab indent');

		expect(dedent.lastMinimum).toBe(1);

		dedent('\t  "1.5" tabs indent');

		expect(dedent.lastMinimum).toBe(1);

		dedent('\t\ttwo tabs indent');

		expect(dedent.lastMinimum).toBe(2);
	});
});
