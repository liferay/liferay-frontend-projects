/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {
	getCloseTagReplacement,
	getOpenTagReplacement,
	getSelfClosingTagReplacement
} = require('../../src/format/tagReplacements');

describe('getCloseTagReplacement()', () => {
	it('replaces a long tag with an equal-length placeholder', () => {
		const original = '</foo:bar>';
		const expected = '}/*ʅʅʅʅʅ*/';

		expect(getCloseTagReplacement(original)).toBe(expected);
	});

	it('replaces a short tag with the shortest possible placeholder', () => {
		const original = '</a:b>';
		const expected = '}/*ʅ*/';

		expect(getCloseTagReplacement(original)).toBe(expected);
	});

	it('throws if passed an impossibly short tag', () => {
		expect(() => getCloseTagReplacement('.....')).toThrow(
			'Invalid (underlength) tag: .....'
		);
	});
});

describe('getOpenTagReplacement()', () => {
	it('replaces a long tag with an equal-length placeholder', () => {
		const original = '<foo:bar>';
		const expected = 'if (ʃʃ) {';

		expect(getOpenTagReplacement(original)).toBe(expected);
	});

	it('replaces a short tag with the shortest possible placeholder', () => {
		const original = '<a:b>';
		const expected = 'if (ʃ) {';

		expect(getOpenTagReplacement(original)).toBe(expected);
	});

	it('throws if passed an impossibly short tag', () => {
		expect(() => getOpenTagReplacement('....')).toThrow(
			'Invalid (underlength) tag: ....'
		);
	});
});

describe('getSelfClosingTagReplacement()', () => {
	it('replaces a long tag with an equal-length placeholder', () => {
		const original = '<foo:bar/>';
		const expected = '/*╳╳╳╳╳╳*/';

		expect(getSelfClosingTagReplacement(original)).toBe(expected);
	});

	it('replaces a short tag with the shortest possible placeholder', () => {
		const original = '<a:b/>';
		const expected = '/*╳╳*/';

		expect(getSelfClosingTagReplacement(original)).toBe(expected);
	});

	it('throws if passed an impossibly short tag', () => {
		expect(() => getSelfClosingTagReplacement('.....')).toThrow(
			'Invalid (underlength) tag: .....'
		);
	});
});
