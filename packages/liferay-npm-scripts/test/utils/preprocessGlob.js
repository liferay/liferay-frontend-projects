/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const preprocessGlob = require('../../src/utils/preprocessGlob');

describe('preprocessGlob()', () => {
	it('returns a glob without "{...}" unchanged', () => {
		expect(preprocessGlob('a/b/c/**.js')).toEqual(['a/b/c/**.js']);
	});

	it('returns a glob for each item inside "{...}"', () => {
		expect(preprocessGlob('a/{foo}/c')).toEqual(['a/foo/c']);
		expect(preprocessGlob('a/{foo,bar}/c')).toEqual(['a/foo/c', 'a/bar/c']);
	});

	it('handles empty segments inside of "{...}"', () => {
		expect(preprocessGlob('a/{b,}')).toEqual(['a/b', 'a/']);
		expect(preprocessGlob('a/{,b}')).toEqual(['a/', 'a/b']);
	});

	it('creates permutations for patterns with multiple "{...}"', () => {
		expect(preprocessGlob('a/{b,c,d}/e/{f,g}')).toEqual([
			'a/b/e/f',
			'a/b/e/g',
			'a/c/e/f',
			'a/c/e/g',
			'a/d/e/f',
			'a/d/e/g'
		]);
	});

	it('treats totally empty braces ("{}") literally', () => {
		expect(preprocessGlob('foo{}bar')).toEqual(['foo{}bar']);
	});

	it('throws an error for unbalanced braces', () => {
		expect(() => preprocessGlob('aaa{aaa')).toThrow(/Unbalanced "{"/);
		expect(() => preprocessGlob('bbb}bbb')).toThrow(/Unbalanced "}"/);
	});

	it('throws an error for nested braces', () => {
		expect(() => preprocessGlob('aa{aa{aa')).toThrow(/Nested "{"/);
	});
});
