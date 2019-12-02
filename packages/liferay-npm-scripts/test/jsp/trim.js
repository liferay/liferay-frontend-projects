/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const trim = require('../../src/jsp/trim');

describe('trim()', () => {
	it('trims leading whitespace', () => {
		const input = `
			alert();`;

		expect(trim(input)).toEqual({
			prefix: '\n',
			suffix: '',
			trimmed: '\t\t\talert();'
		});
	});

	it('trims trailing whitespace', () => {
		const input = `alert();
		`;

		expect(trim(input)).toEqual({
			prefix: '',
			suffix: '\t\t',
			trimmed: 'alert();'
		});
	});

	it('trims both leading and trailing whitespace', () => {
		const input = `
			alert();
		`;

		expect(trim(input)).toEqual({
			prefix: '\n',
			suffix: '\t\t',
			trimmed: '\t\t\talert();'
		});
	});

	it('trims nothing when there is nothing to trim', () => {
		expect(trim('alert();')).toEqual({
			prefix: '',
			suffix: '',
			trimmed: 'alert();'
		});
	});
});
