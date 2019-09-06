/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const indent = require('../../src/format/indent');

describe('indent()', () => {
	it('indents two spaces by default', () => {
		expect(indent('{\n  foo\n}')).toBe('  {\n    foo\n  }');
	});

	it('indents by a custom width', () => {
		expect(indent('{\n  foo\n}', 4)).toBe('    {\n      foo\n    }');
	});
});
