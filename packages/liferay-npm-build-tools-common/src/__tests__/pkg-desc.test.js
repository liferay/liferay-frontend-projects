import PkgDesc from '../pkg-desc';

it('constructs root package descriptors correctly', () => {
	const pkg = new PkgDesc('a-package', '1.0.0');

	expect(pkg.id).toBe(PkgDesc.ROOT_ID);
	expect(pkg.name).toBe('a-package');
	expect(pkg.version).toBe('1.0.0');
	expect(pkg.dir).toBe('.');
	expect(pkg.isRoot).toBe(true);
});

it('constructs forced root package descriptors correctly', () => {
	const pkg = new PkgDesc('a-package', '1.0.0', '/tmp', true);

	expect(pkg.id).toBe(PkgDesc.ROOT_ID);
	expect(pkg.name).toBe('a-package');
	expect(pkg.version).toBe('1.0.0');
	expect(pkg.dir).toBe('/tmp');
	expect(pkg.isRoot).toBe(true);
});

it('constructs non-root package descriptors correctly', () => {
	const pkg = new PkgDesc('a-package', '1.0.0', '/tmp');

	expect(pkg.id).toBe('a-package@1.0.0');
	expect(pkg.name).toBe('a-package');
	expect(pkg.version).toBe('1.0.0');
	expect(pkg.dir).toBe('/tmp');
	expect(pkg.isRoot).toBe(false);
});

it('clone works', () => {
	let pkg = new PkgDesc('a-package', '1.0.0', '/tmp');

	pkg = pkg.clone({dir: '/var/log'});

	expect(pkg.id).toBe('a-package@1.0.0');
	expect(pkg.name).toBe('a-package');
	expect(pkg.version).toBe('1.0.0');
	expect(pkg.dir).toBe('/var/log');
	expect(pkg.isRoot).toBe(false);
});

it('isRoot works', () => {
	let pkg;

	pkg = new PkgDesc('a-package', '1.0.0');

	expect(pkg.isRoot).toBe(true);

	pkg = new PkgDesc('a-package', '1.0.0', '/tmp');

	expect(pkg.isRoot).toBe(false);
});
