const del = require('del');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const {doctor} = require('../doctor');
const testUtil = require('../../test/util');

const initCwd = process.cwd();
const tempPath = path.join(
	os.tmpdir(),
	'liferay-theme-tasks',
	'doctor-fixtures'
);

beforeEach(() => {
	testUtil.hideConsole();

	fs.copySync(
		path.join(
			__dirname,
			'./fixtures/doctor/_package_outdated_settings.json'
		),
		path.join(tempPath, 'package.json')
	);
	process.chdir(tempPath);
});

afterEach(() => {
	del.sync(path.join(tempPath, '**'), {
		force: true,
	});
	process.chdir(initCwd);

	testUtil.restoreConsole();
});

it('throws appropriate error message', () => {
	const pkgJsonPath = path.join(__dirname, './fixtures/doctor/_package.json');
	const pkgJson = require(pkgJsonPath);

	expect(() =>
		doctor({themeConfig: pkgJson, haltOnMissingDeps: true, tasks: []})
	).toThrow(new Error('Missing 1 theme dependency'));

	pkgJson.liferayTheme.version = '7.2';
	expect(() =>
		doctor({themeConfig: pkgJson, haltOnMissingDeps: true, tasks: []})
	).toThrow(new Error('Missing 6 theme dependencies'));
});

it('looks for dependencies regardless if devDependency or not', () => {
	const pkgJsonPath = path.join(
		__dirname,
		'./fixtures/doctor/_package_mixed_dependencies.json'
	);
	const pkgJson = require(pkgJsonPath);

	expect(() =>
		doctor({themeConfig: pkgJson, haltOnMissingDeps: true, tasks: []})
	).not.toThrow();
});

it('removes supportCompass', () => {
	const pkgJsonPath = path.join(tempPath, 'package.json');
	const pkgJson = require(pkgJsonPath);

	doctor({themeConfig: pkgJson, haltOnMissingDeps: true, tasks: []});

	const updatedPkg = JSON.parse(fs.readFileSync(pkgJsonPath));

	const liferayTheme = updatedPkg.liferayTheme;

	expect(liferayTheme.baseTheme).toBe('styled');
	expect(liferayTheme.version).toBe('7.1');
	expect(liferayTheme.supportCompass).toBeUndefined();
});

it('explains how to upgrade old versions', () => {
	const pkgJsonPath = path.join(__dirname, './fixtures/doctor/_package.json');
	const pkgJson = require(pkgJsonPath);
	pkgJson.liferayTheme.version = '7.0';

	expect(() => doctor({themeConfig: pkgJson, tasks: ['upgrade']})).toThrow(
		/please use v8 of the toolkit/
	);
});

it('explains how to run non-upgrade tasks with old versions', () => {
	const pkgJsonPath = path.join(__dirname, './fixtures/doctor/_package.json');
	const pkgJson = require(pkgJsonPath);
	pkgJson.liferayTheme.version = '7.1';

	const tasks = ['build', 'deploy', 'extend', 'kickstart', 'watch', 'status'];

	tasks.forEach(task => {
		expect(() => doctor({themeConfig: pkgJson, tasks: [task]})).toThrow(
			new RegExp(`\\b${task}\\b.+please use v8 of the toolkit`)
		);
	});
});
