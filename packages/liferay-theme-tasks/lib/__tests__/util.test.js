/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

const {cleanTempTheme, setupTempTheme} = require('../test/util');
const util = require('../util');

let tempTheme;

beforeEach(() => {
	tempTheme = setupTempTheme({
		namespace: 'util',
		themeName: 'explicit-dependency-theme',
	});
});

afterEach(() => {
	cleanTempTheme(tempTheme);
});

it('isCssFile should only return true if css file', () => {
	expect(util.isCssFile('custom.css')).toBe(true);
	expect(!util.isCssFile('main.js')).toBe(true);
});

it('isSassPartial should return true for partial scss file names', () => {
	expect(util.isSassPartial('_partial.scss')).toBe(true);
	expect(!util.isSassPartial('main.scss')).toBe(true);
});

describe('resolveDependency()', () => {
	it('uses the custom dependency path when provided', () => {
		try {
			process.env.LIFERAY_THEME_STYLED_PATH = path.dirname(
				require.resolve('liferay-frontend-theme-styled/package.json')
			);
			const styledPath = util.resolveDependency(
				'liferay-frontend-theme-styled'
			);

			expect(styledPath).toContain('liferay-frontend-theme-styled');
		} finally {
			delete process.env.LIFERAY_THEME_STYLED_PATH;
		}
	});

	it('resolves relative to the current working directory', () => {
		// Note that due to use of copyTempTheme(), the current working
		// directory will be some "tmp" directory outside the repo.
		const resolved = util.resolveDependency(
			'liferay-frontend-theme-styled'
		);
		expect(resolved).toContain(process.cwd());
	});
});

it('getCustomDependencyPath should return custom dependency paths set in node env variables', () => {
	const CUSTOM_STYLED_PATH = path.join(
		process.cwd(),
		'node_modules',
		'liferay-frontend-theme-styled'
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
