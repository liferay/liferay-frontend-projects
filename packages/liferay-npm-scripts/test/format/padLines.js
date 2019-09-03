/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const padLines = require('../../src/format/padLines');

describe('padLines()', () => {
	it('adds padding lines to make contents start at startLine', () => {
		expect(padLines('{}', 3)).toBe('\n\n\n{}');
	});

	it('uses the supplied padding string', () => {
		expect(padLines('{}', 2, 'void 0;')).toBe('void 0;\nvoid 0;\n{}');
	});
});
