/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const dedent = require('../../src/format/dedent');

describe('dedent()', () => {
	it('dedents based on the smallest existing indent (spaces)', () => {
		const [dedented] = dedent('  def foo\n    1\n  end');

		expect(dedented).toBe('def foo\n  1\nend');
	});

	it('dedents based on the smallest existing indent (tabs)', () => {
		const [dedented] = dedent('\t\tdef foo\n\t\t\t1\n\t\tend');

		expect(dedented).toBe('def foo\n\t1\nend');
	});

	it('handles mixed tabs and spaces', () => {
		// Mixed tabs and spaces are common, for example, in source with
		// multiline comments.
		const [dedented] = dedent(`
			/**
			 * This is a comment.
			 */
			function fn() {
				return arguments;
			}
		`);

		expect(dedented).toBe(
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
		const [dedented] = dedent(
			`
			function fn() {
				return;
	        	} // tab, 8 spaces, tab, a brace
		`,
			8
		);

		expect(dedented).toBe(
			// prettier-ignore
			'function fn() {\n' +
			'\treturn;\n' +
			'} // tab, 8 spaces, tab, a brace'
		);
	});

	it('exposes the minimum indent (tab count) from the last call', () => {
		let [, lastMinimum] = dedent('no indent');

		expect(lastMinimum).toBe(0);

		[, lastMinimum] = dedent('  less than one tab indent');

		expect(lastMinimum).toBe(0);

		[, lastMinimum] = dedent('\tone tab indent');

		expect(lastMinimum).toBe(1);

		[, lastMinimum] = dedent('\t  "1.5" tabs indent');

		expect(lastMinimum).toBe(1);

		[, lastMinimum] = dedent('\t\ttwo tabs indent');

		expect(lastMinimum).toBe(2);
	});
});
