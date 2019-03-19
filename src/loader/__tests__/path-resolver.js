/**
 * © 2014 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PathResolver from '../path-resolver';

describe('PathResolver', () => {
	let pathResolver;

	beforeEach(() => {
		pathResolver = new PathResolver();
	});

	it('should resolve modules without paths', () => {
		let result;

		result = pathResolver.resolvePath('c1', 'c');
		expect(result).toBe('c');

		result = pathResolver.resolvePath('c1', './c');
		expect(result).toBe('c');
	});

	it('should resolve relative paths', () => {
		let result;

		result = pathResolver.resolvePath('test/test123', '../dep');
		expect(result).toBe('dep');

		result = pathResolver.resolvePath('a/b/c/c1', '../../../c');
		expect(result).toBe('c');

		result = pathResolver.resolvePath('a/b/c/c1', '../../c');
		expect(result).toBe('a/c');

		result = pathResolver.resolvePath('a/b/c/c1', './c');
		expect(result).toBe('a/b/c/c');

		result = pathResolver.resolvePath('a/b/c/c1', './../c');
		expect(result).toBe('a/b/c');

		result = pathResolver.resolvePath('a/b/c/c1', './d/../c');
		expect(result).toBe('a/b/c/c');

		result = pathResolver.resolvePath('a/b/c/c1', './d/c');
		expect(result).toBe('a/b/c/d/c');

		result = pathResolver.resolvePath('a/b/c/c1', './../../../../c');
		expect(result).toBe('../c');
	});

	it('should ignore "require" path', () => {
		const result = pathResolver.resolvePath('a/b/c/c1', 'require');

		expect(result).toBe('require');
	});

	it('should ignore "exports" path', () => {
		const result = pathResolver.resolvePath('a/b/c/c1', 'exports');

		expect(result).toBe('exports');
	});

	it('should ignore "module" path', () => {
		const result = pathResolver.resolvePath('a/b/c/c1', 'module');

		expect(result).toBe('module');
	});
});
