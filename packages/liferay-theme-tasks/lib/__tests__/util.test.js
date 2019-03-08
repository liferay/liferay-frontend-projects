const path = require('path');

const testUtil = require('../../test/util');

const themeName = 'explicit-dependency-theme';
const initCwd = process.cwd();

let util;

beforeEach(() => {
	testUtil.copyTempTheme({
		namespace: 'util',
		themeName,
	});

	util = require('../../lib/util');
});

afterEach(() => {
	testUtil.cleanTempTheme(themeName, '7.1', 'util', initCwd);
});

it('isCssFile should only return true if css file', () => {
	expect(util.isCssFile('custom.css')).toBe(true);
	expect(!util.isCssFile('main.js')).toBe(true);
});

it('isSassPartial should return true for partial scss file names', () => {
	expect(util.isSassPartial('_partial.scss')).toBe(true);
	expect(!util.isSassPartial('main.scss')).toBe(true);
});

// TODO: replace this with tests that verify the new behavior of
// resolveDependency after we repurpose it
xit('resolveDependency should return resolved path of dependency', () => {
	const unstyledPath = util.resolveDependency(
		'liferay-frontend-theme-unstyled',
		'7.1'
	);

	expect(unstyledPath).toBeTruthy();

	const styledPath = util.resolveDependency(
		'liferay-frontend-theme-styled',
		'7.1'
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
