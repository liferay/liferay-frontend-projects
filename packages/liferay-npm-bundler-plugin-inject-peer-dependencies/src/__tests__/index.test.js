import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import plugin from '../index';

const fixturesDir =
	`${process.cwd()}/packages/` +
	`liferay-npm-bundler-plugin-inject-peer-dependencies/` +
	`src/__tests__`;

describe('when using regular packages', () => {
	it('injects peer dependencies as needed', () => {
		const config = {};
		const log = new PluginLogger();
		const rootPkgJson = require(`${fixturesDir}/project/package.json`);
		const pkg = new PkgDesc(
			'pkg-with-peer-deps',
			'1.0.0',
			`${fixturesDir}/project/node_modules/pkg-with-peer-deps`,
			true
		);
		const source = {
			pkg,
		};
		const pkgJson = require(fixturesDir +
			'/project/node_modules/pkg-with-peer-deps/package.json');

		plugin({config, log, rootPkgJson, pkg, source}, {pkgJson});

		expect(pkgJson.dependencies).toEqual({
			'number-is-nan': '1.0.0',
		});
	});
});

describe('when using scoped packages', () => {
	it('injects peer dependencies for regular packages', () => {
		const config = {};
		const log = new PluginLogger();
		const rootPkgJson = require(`${fixturesDir}/project/package.json`);
		const pkg = new PkgDesc(
			'@scope/pkg-with-peer-deps',
			'1.0.0',
			`${fixturesDir}/project/node_modules/@scope/pkg-with-peer-deps`,
			true
		);
		const source = {
			pkg,
		};
		const pkgJson = require(fixturesDir +
			'/project/node_modules/@scope/pkg-with-peer-deps/package.json');

		plugin({config, log, rootPkgJson, pkg, source}, {pkgJson});

		expect(pkgJson.dependencies).toEqual({
			'@scope/number-is-nan': '1.0.0',
		});
	});

	it('injects peer dependencies for namespaced packages', () => {
		const config = {};
		const log = new PluginLogger();
		const rootPkgJson = require(`${fixturesDir}/project/package.json`);
		const pkg = new PkgDesc(
			'@project$1.0.0$scope/pkg-with-peer-deps',
			'1.0.0',
			fixturesDir +
				'/project/node_modules/@project$1.0.0$scope/pkg-with-peer-deps',
			true
		);
		const source = {
			pkg,
		};
		const pkgJson = require(fixturesDir +
			'/project/node_modules/@project$1.0.0$scope/pkg-with-peer-deps' +
			'/package.json');

		plugin({config, log, rootPkgJson, pkg, source}, {pkgJson});

		expect(pkgJson.dependencies).toEqual({
			'@project$1.0.0$scope/number-is-nan': '1.0.0',
		});
	});
});

it('logs results correctly', () => {
	const config = {};
	const log = new PluginLogger();
	const rootPkgJson = require(`${fixturesDir}/project/package.json`);
	const pkg = new PkgDesc(
		'pkg-for-logs',
		'1.0.0',
		`${fixturesDir}/project/node_modules/pkg-for-logs`,
		true
	);
	const source = {
		pkg,
	};
	const pkgJson = require(fixturesDir +
		'/project/node_modules/pkg-for-logs/package.json');

	plugin({config, log, rootPkgJson, pkg, source}, {pkgJson});

	expect(log.messages).toMatchSnapshot();
});
