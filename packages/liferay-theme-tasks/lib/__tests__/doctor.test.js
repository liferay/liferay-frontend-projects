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

it('should throw appropriate error message', () => {
	const pkgJsonPath = path.join(__dirname, './fixtures/doctor/_package.json');
	const pkgJson = require(pkgJsonPath);

	expect(() =>
		doctor({themeConfig: pkgJson, haltOnMissingDeps: true, tasks: []})
	).toThrow(new Error('Missing 2 theme dependencies'));
});

it('should look for dependencies regardless if devDependency or not', () => {
	const pkgJsonPath = path.join(
		__dirname,
		'./fixtures/doctor/_package_mixed_dependencies.json'
	);
	const pkgJson = require(pkgJsonPath);

	expect(() =>
		doctor({themeConfig: pkgJson, haltOnMissingDeps: true, tasks: []})
	).not.toThrow();
});

it('should replace supportCompass with rubySass', () => {
	const pkgJsonPath = path.join(tempPath, 'package.json');
	const pkgJson = require(pkgJsonPath);

	doctor({themeConfig: pkgJson, haltOnMissingDeps: true, tasks: []});

	const updatedPkg = JSON.parse(fs.readFileSync(pkgJsonPath));

	const liferayTheme = updatedPkg.liferayTheme;

	expect(liferayTheme.baseTheme).toBe('styled');
	expect(liferayTheme.rubySass).toBe(false);
	expect(liferayTheme.version).toBe('7.0');
	expect(liferayTheme.supportCompass).toBeUndefined();
});
