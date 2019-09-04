/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getPaddedReplacement = require('../../src/format/getPaddedReplacement');

describe('getPaddedRelpacement()', () => {
	it('pads out the template to obtain an equal-length replacement', () => {
		const template = '_TEMPLATE_';
		const original = '<portlet:namespace   />';
		const expected = '_TEMPLATE______________';

		const replacement = getPaddedReplacement(original, template);

		expect(replacement).toBe(expected);
	});

	it('returns the full template if it is longer than the input', () => {
		const template = '_LONG_TEMPLATE_';
		const original = '<my:tag />';
		const expected = '_LONG_TEMPLATE_';

		const replacement = getPaddedReplacement(original, template);

		expect(replacement).toBe(expected);
	});
});
