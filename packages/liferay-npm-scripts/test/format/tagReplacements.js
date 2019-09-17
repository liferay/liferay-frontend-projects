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

	it('degrades gracefully if passed an impossibly short tag', () => {
		// Not a valid JSP tag anyway, but no matter what, we always produce a
		// reversible replacement.
		expect(getCloseTagReplacement('</a>')).toBe('/*ʅ*/');
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
		const expected = '/*ʃʃʃʃʃʃʃʃʃʃ\n' + 'Ƭʃʃʃʃʃʃʃʃʃʃʃ\n' + '*/';

		expect(getOpenTagReplacement(original)).toBe(expected);
	});

	it('degrades gracefully if passed an impossibly short tag', () => {
		// Not a valid JSP tag anyway, but no matter what, we always produce a
		// reversible replacement.
		expect(getOpenTagReplacement('<ab>')).toBe('/*ʃ*/');
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
		const expected = '/*╳╳╳╳╳╳\n' + 'Ƭ╳╳╳╳╳╳╳╳\n' + '*/';

		expect(getSelfClosingTagReplacement(original)).toBe(expected);
	});

	it('replaces a short tag with the shortest possible placeholder', () => {
		const original = '<a:b/>';
		const expected = '/*╳╳*/';

		expect(getSelfClosingTagReplacement(original)).toBe(expected);
	});

	it('degrades gracefully if passed an impossibly short tag', () => {
		// Not a valid JSP tag anyway, but no matter what, we always produce a
		// reversible replacement.
		expect(getSelfClosingTagReplacement('<a/>')).toBe('/*╳*/');
	});
});
