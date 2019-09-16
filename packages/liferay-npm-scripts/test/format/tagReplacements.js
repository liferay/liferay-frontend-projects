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
		const expected = '/*ʅʅʅʅʅʅ*/';

		expect(getCloseTagReplacement(original)).toBe(expected);
	});

	it('replaces a short tag with the shortest possible placeholder', () => {
		const original = '</a:b>';
		const expected = '/*ʅʅ*/';

		expect(getCloseTagReplacement(original)).toBe(expected);
	});

	it('throws if passed an impossibly short tag', () => {
		// Not long enough to produce a reversible replacement,
		// and not a valid JSP tag anyway.
		expect(() => getCloseTagReplacement('</a>')).toThrow(
			'Invalid (underlength) tag: </a>'
		);
	});
});

describe('getOpenTagReplacement()', () => {
	it('replaces a long tag with an equal-length placeholder', () => {
		const original = '<foo:bar>';
		const expected = '/*ʃʃʃʃʃ*/';

		expect(getOpenTagReplacement(original)).toBe(expected);
	});

	it('replaces a short tag with the shortest possible placeholder', () => {
		const original = '<a:b>';
		const expected = '/*ʃ*/';

		expect(getOpenTagReplacement(original)).toBe(expected);
	});

	it('replaces a multi-line tag', () => {
		const original = '<foo-bar:tag\n' + '\tattr="word"\n' + '>';
		const expected = '/*ʃʃʃʃʃʃʃʃʃ\n' + '\tʃʃʃʃʃʃʃʃʃʃʃ\n' + '*/';

		expect(getOpenTagReplacement(original)).toBe(expected);
	});

	it('throws if passed an impossibly short tag', () => {
		// Not long enough to produce a reversible replacement,
		// and not a valid JSP tag anyway.
		expect(() => getOpenTagReplacement('<ab>')).toThrow(
			'Invalid (underlength) tag: <ab>'
		);
	});
});

describe('getSelfClosingTagReplacement()', () => {
	it('replaces a long tag with an equal-length placeholder', () => {
		const original = '<foo:bar/>';
		const expected = '/*╳╳╳╳╳╳*/';

		expect(getSelfClosingTagReplacement(original)).toBe(expected);
	});

	it('replaces a multi-line tag with a same-shaped placeholder', () => {
		const original = '<foo:bar\n' + '\tattr="1"\n' + '/>';
		const expected = '/*╳╳╳╳╳╳\n' + '\t╳╳╳╳╳╳╳╳\n' + '*/';

		expect(getSelfClosingTagReplacement(original)).toBe(expected);
	});

	it('replaces a short tag with the shortest possible placeholder', () => {
		const original = '<a:b/>';
		const expected = '/*╳╳*/';

		expect(getSelfClosingTagReplacement(original)).toBe(expected);
	});

	it('throws if passed an impossibly short tag', () => {
		// Not long enough to produce a reversible replacement,
		// and not a valid JSP tag anyway.
		expect(() => getSelfClosingTagReplacement('<a/>')).toThrow(
			'Invalid (underlength) tag: <a/>'
		);
	});
});
