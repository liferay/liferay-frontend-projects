import plugin from '../index';

const fixturesDir =
	`${process.cwd()}/packages/` +
	`liferay-npm-bundler-plugin-inject-angular-dependencies/` +
	`src/__tests__/packages`;

it('injects rxjs dependency in @angular/forms if not found', () => {
	const pkg = {
		id: '@angular/forms@1.0.0',
		name: '@angular/forms',
		version: '1.0.0',
		dir: `${fixturesDir}/@angular%2Fforms@1.0.0`,
	};
	const config = {};
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
	};

	plugin({pkg, config}, {pkgJson});

	expect(pkgJson.dependencies['rxjs']).toEqual('2.3.4');
});

it('does not inject rxjs dependency in @angular/forms if found', () => {
	const pkg = {
		id: '@angular/forms@1.0.0',
		name: '@angular/forms',
		version: '1.0.0',
		dir: `${fixturesDir}/@angular%2Fforms@1.0.0`,
	};
	const config = {};
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		dependencies: {
			rxjs: '1.0.0',
		},
	};

	plugin({pkg, config}, {pkgJson});

	expect(pkgJson.dependencies['rxjs']).toEqual('1.0.0');
});

it('injects @angular/animations dependency in @angular/platform-browser if not found', () => {
	const pkg = {
		id: '@angular/platform-browser@1.0.0',
		name: '@angular/platform-browser',
		version: '1.0.0',
		dir: `${fixturesDir}/@angular%2Fplatform-browser@1.0.0`,
	};
	const config = {};
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
	};

	plugin({pkg, config}, {pkgJson});

	expect(pkgJson.dependencies['@angular/animations']).toEqual('2.3.4');
});

it('does not inject @angular/animations dependency in @platform-browser/forms if found', () => {
	const pkg = {
		id: '@angular/platform-browser@1.0.0',
		name: '@angular/platform-browser',
		version: '1.0.0',
		dir: `${fixturesDir}/@angular%2Fplatform-browser@1.0.0`,
	};
	const config = {};
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
		dependencies: {
			'@angular/animations': '1.0.0',
		},
	};

	plugin({pkg, config}, {pkgJson});

	expect(pkgJson.dependencies['@angular/animations']).toEqual('1.0.0');
});

it('uses configuration values over defaults', () => {
	const pkg = {
		id: '@angular/forms@1.0.0',
		name: '@angular/forms',
		version: '1.0.0',
		dir: `${fixturesDir}/@angular%2Fforms@1.0.0`,
	};
	const config = {
		dependenciesMap: {
			'@angular/forms': ['@angular/forms'],
		},
	};
	const pkgJson = {
		name: pkg.name,
		version: pkg.version,
	};

	plugin({pkg, config}, {pkgJson});

	expect(pkgJson.dependencies['rxjs']).toBeUndefined();
	expect(pkgJson.dependencies['@angular/forms']).toEqual('1.0.0');
});
