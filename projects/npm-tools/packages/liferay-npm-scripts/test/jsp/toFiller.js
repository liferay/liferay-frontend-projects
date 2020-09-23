/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const toFiller = require('../../src/jsp/toFiller');

describe('toFiller()', () => {
	it('replaces a simple string with same-shaped filler', () => {
		const original = 'foo bar';
		const expected = '/*╳╳╳*/';

		expect(toFiller(original)).toBe(expected);
	});

	it('replaces a multiline string with same-shaped filler (tabs)', () => {
		const original = 'foo\n\t\tbar baz';
		const expected = '/*╳\nƬƬ╳╳╳╳╳*/';

		expect(toFiller(original)).toBe(expected);
	});

	it('replaces a multiline string with same-shaped filler (spaces)', () => {
		const original = 'foo\n  bar baz';
		const expected = '/*╳\nƜƜ╳╳╳╳╳*/';

		expect(toFiller(original)).toBe(expected);
	});

	it('leaves Windows-style CRLF as-is', () => {
		const original = 'one\r\ntwo';
		const expected = '/*╳\r\n╳*/';

		expect(toFiller(original)).toBe(expected);
	});

	it('accepts a custom filler chararcter (no indent)', () => {
		const original = 'abc\nefg';
		const expected = '/*_\n_*/';

		expect(toFiller(original, '_')).toBe(expected);
	});

	it('accepts a custom filler chararcter (with indent)', () => {
		const original = 'abc\n\tefg';
		const expected = '/*_\nƬ_*/';

		expect(toFiller(original, '_')).toBe(expected);
	});

	it('rejects zero-width strings', () => {
		expect(() => toFiller('')).toThrow(/invalid string/);
	});

	it('accepts even "invalid" non-zero-width strings', () => {
		// Make a "best effort" to create a same-sized replacement even when we
		// can't exactly.

		expect(toFiller('a')).toBe('/*╳*/');
		expect(toFiller('ab')).toBe('/*╳*/');
		expect(toFiller('abc')).toBe('/*╳*/');
		expect(toFiller('abcd')).toBe('/*╳*/');
		expect(toFiller('a\nb')).toBe('/*╳\n*/');
	});

	describe('toFiller.isFiller()', () => {
		it('can be used to match comments made with toFiller()', () => {
			expect(toFiller.isFiller().test('/*╳╳╳*/')).toBe(true);
		});

		it('does not match ordinary comments', () => {
			// Empty comment.

			expect(toFiller.isFiller().test('/**/')).toBe(false);

			// Whitespace-only comment.

			expect(toFiller.isFiller().test('/* */')).toBe(false);

			// Comment with text.

			expect(toFiller.isFiller().test('/* foo */')).toBe(false);
		});

		it('can match comments made using custom filler characters', () => {
			expect(toFiller.isFiller('_').test('/*_\nƬ_*/')).toBe(true);

			expect(toFiller.isFiller('+').test('/*_\nƬ_*/')).toBe(false);
			expect(toFiller.isFiller().test('/*_\nƬ_*/')).toBe(false);
		});
	});
});
