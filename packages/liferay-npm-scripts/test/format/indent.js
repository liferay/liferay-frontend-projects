/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const indent = require('../../src/format/indent');

describe('indent()', () => {
	it('indents one tab by default', () => {
		expect(indent('{\n\tfoo\n}')).toBe('\t{\n\t\tfoo\n\t}');
	});

	it('indents by a custom width', () => {
		expect(indent('{\n\t\tfoo\n}', 2)).toBe('\t\t{\n\t\t\t\tfoo\n\t\t}');
	});

	it('indents with a custom whitespace string', () => {
		expect(indent('{\n  foo\n}', 2, ' ')).toBe('  {\n    foo\n  }');
	});

	it('leaves empty lines untouched', () => {
		expect(indent('const a = 1;\n\nconst b = 2;')).toBe(
			'\tconst a = 1;\n\n\tconst b = 2;'
		);
	});
});
