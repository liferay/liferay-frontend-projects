import PathResolver from '../path-resolver';

describe('PathResolver', function() {
	it('should resolve modules without paths', function() {
		let pathResolver = new PathResolver();

		let result;

		result = pathResolver.resolvePath('c1', 'c');
		expect(result).toBe('c');

		result = pathResolver.resolvePath('c1', './c');
		expect(result).toBe('c');
	});

	it('should resolve relative paths', function() {
		let pathResolver = new PathResolver();

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

	it('should ignore "require" path', function() {
		let pathResolver = new PathResolver();

		// Require should be ignored and not resolved at all
		let result = pathResolver.resolvePath('a/b/c/c1', 'require');
		expect(result).toBe('require');
	});

	it('should ignore "exports" path', function() {
		let pathResolver = new PathResolver();

		// Exports should be ignored and not resolved at all
		let result = pathResolver.resolvePath('a/b/c/c1', 'exports');
		expect(result).toBe('exports');
	});

	it('should ignore "module" path', function() {
		let pathResolver = new PathResolver();

		// Module should be ignored and not resolved at all
		let result = pathResolver.resolvePath('a/b/c/c1', 'module');
		expect(result).toBe('module');
	});
});
