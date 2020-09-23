/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const dedent = require('../../src/jsp/dedent');

describe('dedent()', () => {
	it('dedents based on the smallest existing indent (spaces)', () => {
		const dedented = dedent('  def foo\n    1\n  end');

		expect(dedented).toBe('def foo\n  1\nend');
	});

	it('dedents based on the smallest existing indent (tabs)', () => {
		const dedented = dedent('\t\tdef foo\n\t\t\t1\n\t\tend');

		expect(dedented).toBe('def foo\n\t1\nend');
	});

	it('handles mixed tabs and spaces', () => {
		// Mixed tabs and spaces are common, for example, in source with
		// multiline comments.

		const dedented = dedent(`
			/**
			 * This is a comment.
			 */
			function fn() {
				return arguments;
			}
		`);

		// prettier-ignore

		expect(dedented).toBe(
			'/**\n' +
			' * This is a comment.\n' +
			' */\n' +
			'function fn() {\n' +
			'\treturn arguments;\n' +
			'}'
		);
	});

	it('accepts a custom tabWidth argument', () => {
		const dedented = dedent(
			`
			function fn() {
				return;
	        	} // tab, 8 spaces, tab, a brace
		`,
			8
		);

		// prettier-ignore

		expect(dedented).toBe(
			'function fn() {\n' +
			'\treturn;\n' +
			'} // tab, 8 spaces, tab, a brace'
		);
	});

	it('handles partial "for" control structures', () => {
		// It's common in JSP to have an incomplete control structure
		// that starts in one scriptlet and ends in another.

		// prettier-ignore

		const dedented = dedent(
			'<%\n' +
			'// This one was getting mangled.\n' +
			'for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {\n' +
			'\tString className = editAssetListDisplayContext.getClassName(curRendererFactory);\n' +
			'%>'
		);

		// prettier-ignore

		expect(dedented).toBe(
			'<%\n' +
			'// This one was getting mangled.\n' +
			'for (AssetRendererFactory<?> curRendererFactory : classTypesAssetRendererFactories) {\n' +
			'\tString className = editAssetListDisplayContext.getClassName(curRendererFactory);\n' +
			'%>'
		);
	});
});
