/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getPaddedReplacement = require('../../src/format/getPaddedReplacement');

describe('getPaddedReplacement()', () => {
	it('pads out the template to obtain an equal-length replacement', () => {
		const template = 'TEMPLATE';
		const original = '<portlet:namespace   />';
		const expected = 'ʾTEMPLATE_____________ʿ';

		const replacement = getPaddedReplacement(original, template);

		expect(replacement).toBe(expected);
	});

	it('returns the full template if it is longer than the input', () => {
		const template = 'LONG_TEMPLATE';
		const original = '<my:tag />';
		const expected = 'ʾLONG_TEMPLATEʿ';

		const replacement = getPaddedReplacement(original, template);

		expect(replacement).toBe(expected);
	});
});
