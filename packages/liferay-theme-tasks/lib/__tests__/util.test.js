const os = require('os');
const path = require('path');

const testUtil = require('../../test/util');

const cssBuild = 'build/_css';
const themeName = 'explicit-dependency-theme';
const initCwd = process.cwd();

let changedFile;
let util;
let tempPath;
let utilConfig;

beforeEach(() => {
	const config = testUtil.copyTempTheme({
		namespace: 'util',
		themeName: themeName,
	});

	tempPath = config.tempPath;

	util = require('../../lib/util');

	changedFile = {
		path: path.join(tempPath, 'src/css/_custom.scss'),
		type: 'changed',
	};

	utilConfig = {
		changedFile: changedFile,
		deployed: true,
		version: '7.0',
	};
});

afterEach(() => {
	testUtil.cleanTempTheme(themeName, '7.0', 'util', initCwd);
});

it('isCssFile should only return true if css file', () => {
	expect(util.isCssFile('custom.css')).toBe(true);
	expect(!util.isCssFile('main.js')).toBe(true);
});

it('isSassPartial should return true for partial scss file names', () => {
	expect(util.isSassPartial('_partial.scss')).toBe(true);
	expect(!util.isSassPartial('main.scss')).toBe(true);
});

it('requireDependency should return dependency', () => {
	const unstyled = util.requireDependency(
		'liferay-frontend-theme-unstyled',
		'7.0'
	);

	expect(unstyled).toBeTruthy();
});

it('resolveDependency should return resolved path of dependency', () => {
	const unstyledPath = util.resolveDependency(
		'liferay-frontend-theme-unstyled',
		'7.0'
	);

	expect(unstyledPath).toBeTruthy();

	const styledPath = util.resolveDependency(
		'liferay-frontend-theme-styled',
		'7.0'
	);

	expect(styledPath).toBeTruthy();
	expect(!/liferay-theme-deps-7\.0/.test(styledPath)).toBeTruthy();
});

it('getCustomDependencyPath should return custom dependency paths set in node env variables', () => {
	const CUSTOM_STYLED_PATH = path.join(
		process.cwd(),
		'node_modules/liferay-frontend-theme-styled'
	);
	const STYLED = 'liferay-frontend-theme-styled';
	const UNSTYLED = 'liferay-frontend-theme-unstyled';

	let customDependencyPath = util.getCustomDependencyPath(UNSTYLED);

	expect(!customDependencyPath).toBe(true);

	process.env['LIFERAY_THEME_STYLED_PATH'] = CUSTOM_STYLED_PATH;

	customDependencyPath = util.getCustomDependencyPath(STYLED);

	expect(customDependencyPath).toEqual(CUSTOM_STYLED_PATH);

	process.env['LIFERAY_THEME_STYLED_PATH'] = 'does/not/exist';

	expect(() => {
		util.getCustomDependencyPath(STYLED);
	}).toThrow();
});

it('getDepsPath should return preset path or cwd of theme if dependency is explicitly defined in dependencies', () => {
	let depsPath = util.getDepsPath(
		{
			dependencies: {},
		},
		'liferay-frontend-theme-styled',
		'7.0'
	);

	expect(path.basename(depsPath)).toEqual('liferay-theme-deps-7.0');

	depsPath = util.getDepsPath(
		{
			dependencies: {
				'liferay-frontend-theme-styled': '2.0.1',
			},
		},
		'liferay-frontend-theme-styled',
		'7.0'
	);

	expect(path.basename(depsPath)).toBe(themeName);
});

it('hasDependency should return truthy value if dependency is defined in either dependencies or devDependencies', () => {
	let dependency = util.hasDependency({}, 'test-package');

	expect(!dependency).toBe(true);

	dependency = util.hasDependency(
		{
			dependencies: {
				'test-package': '*',
			},
		},
		'test-package'
	);

	expect(dependency).toBeTruthy();

	dependency = util.hasDependency(
		{
			devDependencies: {
				'test-package': '*',
			},
		},
		'test-package'
	);

	expect(dependency).toBeTruthy();
});

it('validateCustomDependencyPath should throw error if customPath does not exist or is not a directory', () => {
	expect(() =>
		util.validateCustomDependencyPath(process.cwd())
	).not.toThrow();

	expect(() =>
		util.validateCustomDependencyPath(
			path.join(process.cwd(), 'package.json')
		)
	).toThrow();

	expect(() => util.validateCustomDependencyPath('does/not/exist')).toThrow();
});
