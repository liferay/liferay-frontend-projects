/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const trim = require('../../src/format/trim');

describe('trim()', () => {
	it('trims leading whitespace', () => {
		const input = `
			alert();`;

		expect(trim(input)).toEqual({
			prefix: '\n',
			suffix: '',
			trimmed: '\n\t\t\talert();'
		});
	});

	it('trims trailing whitespace', () => {
		const input = `alert();
		`;

		expect(trim(input)).toEqual({
			prefix: '',
			suffix: '\t\t',
			trimmed: 'alert();\n\t\t'
		});
	});

	it('trims both leading and trailing whitespace', () => {
		const input = `
			alert();
		`;

		expect(trim(input)).toEqual({
			prefix: '\n',
			suffix: '\t\t',
			trimmed: '\n\t\t\talert();\n\t\t'
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
