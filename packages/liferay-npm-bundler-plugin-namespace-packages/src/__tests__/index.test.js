import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import readJsonSync from 'read-json-sync';
import plugin from '../index';

const fixturesDir =
	`${process.cwd()}/packages/` +
	`liferay-npm-bundler-plugin-namespace-packages/` +
	`src/__tests__/project`;

it('namespaces packages correctly for the root package', () => {
	const rootPkgJson = readJsonSync(`${fixturesDir}/package.json`);
	const dir = fixturesDir;
	const pkgJson = readJsonSync(`${dir}/package.json`);
	const pkg = new PkgDesc(pkgJson.name, pkgJson.version, fixturesDir, true);
	const log = new PluginLogger();

	plugin({pkg, log, rootPkgJson}, {pkgJson});

	expect(pkgJson).toMatchSnapshot();
});

it('namespaces packages correctly for non-root package', () => {
	const rootPkgJson = readJsonSync(`${fixturesDir}/package.json`);
	const dir = `${fixturesDir}/node_modules/is-finite`;
	const pkgJson = readJsonSync(`${dir}/package.json`);
	const pkg = new PkgDesc(pkgJson.name, pkgJson.version, dir);
	const log = new PluginLogger();

	plugin({pkg, log, rootPkgJson}, {pkgJson});

	expect(pkgJson).toMatchSnapshot();
});

it('logs results correctly', () => {
	const rootPkgJson = readJsonSync(`${fixturesDir}/package.json`);
	const dir = `${fixturesDir}/node_modules/is-finite`;
	const pkgJson = readJsonSync(`${dir}/package.json`);
	const pkg = new PkgDesc(pkgJson.name, pkgJson.version, dir);
	const log = new PluginLogger();

	plugin({pkg, log, rootPkgJson}, {pkgJson});

	expect(log.messages).toMatchSnapshot();
});
