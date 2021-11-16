/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const path = require('path');
const sinon = require('sinon');
const {parseString} = require('xml2js');

const testUtil = require('../../test/util');

const initCwd = process.cwd();

function getDependency(name) {
	return path.dirname(require.resolve(path.join(name, 'package.json')));
}

beforeAll(() => {
	process.env.LIFERAY_THEME_STYLED_PATH = getDependency(
		'liferay-frontend-theme-styled'
	);
	process.env.LIFERAY_THEME_UNSTYLED_PATH = getDependency(
		'liferay-frontend-theme-unstyled'
	);
});

afterAll(() => {

	// Clean things on exit to avoid GulpStorage.save() errors because of left
	// over async operations when changing tests.

	testUtil.cleanTempTheme(
		'base-theme-7-2',
		'7.2',
		'lib_sass_build_task',
		initCwd
	);

	delete process.env.LIFERAY_THEME_STYLED_PATH;
	delete process.env.LIFERAY_THEME_UNSTYLED_PATH;
});

describe('using lib_sass', () => {
	const namespace = 'lib_sass_build_task';
	const themeName = 'base-theme-7-2';
	const version = '7.2';
	const sassOptionsSpy = sinon.spy();
	let runSequence;
	let buildPath;
	let tempPath;
	let themeConfig;

	beforeEach(() => {
		testUtil.cleanTempTheme(themeName, version, namespace, null);

		const config = testUtil.copyTempTheme({
			namespace,
			registerTasksOptions: {
				hookFn: buildHookFn,
				sassOptions: (defaults) => {
					sassOptionsSpy();

					expect(defaults.includePaths).toBeTruthy();

					return defaults;
				},
			},
			themeConfig: {},
			themeName,
			version,
		});

		tempPath = config.tempPath;

		buildPath = path.join(tempPath, config.registerTasksOptions.pathBuild);

		const lfrThemeConfig = require('../../lib/liferay_theme_config');

		themeConfig = lfrThemeConfig.getConfig();

		runSequence = config.runSequence;
	});

	afterEach(() => {
		expect(sassOptionsSpy.calledOnce).toBe(true);
	});

	it('build task should correctly compile theme', (done) => {
		runSequence('build', done);
	});

	function buildHookFn(gulp) {
		gulp.hook('after:build:base', _assertBase);
		gulp.hook('after:build:clean', _assertClean);
		gulp.hook('after:build:compile-css', _assertCompileCss);
		gulp.hook('after:build:hook', _assertHook);
		gulp.hook('after:build:fix-at-directives', _assertFixAtDirectives);
		gulp.hook('after:build:move-compiled-css', _assertMoveCompiledCss);
		gulp.hook('after:build:remove-old-css-dir', _assertRemoveOldCssDir);
		gulp.hook('after:build:rename-css-dir', _assertRenameCssDir);
		gulp.hook('after:build:src', _assertSrc);
		gulp.hook('after:build:themelets', _assertThemelets);
		gulp.hook('after:build:web-inf', _assertWebInf);
		gulp.hook('after:plugin:war', _assertWar);
		gulp.hook('before:build', _assertBeforeBuild);
	}

	function _assertBase(cb) {
		expect(fs.existsSync(buildPath)).toBe(true);

		cb();
	}

	function _assertBeforeBuild(cb) {
		const distPath = path.join(tempPath, 'dist');
		const customSrcPath = path.join(tempPath, 'src');

		expect(fs.existsSync(customSrcPath)).toBe(true);
		expect(() => fs.statSync(buildPath)).toThrow();
		expect(() => fs.statSync(distPath)).toThrow();

		cb();
	}

	function _assertClean(cb) {
		expect(fs.existsSync(buildPath)).not.toBe(true);

		cb();
	}

	function _assertCompileCss(cb) {
		cb();
	}

	function _assertHook(cb) {
		const hookPath = path.join(buildPath, 'WEB-INF', 'liferay-hook.xml');

		expect(fs.existsSync(hookPath)).toBe(true);

		const liferayHookXML = fs.readFileSync(hookPath, {
			encoding: 'utf8',
		});

		parseString(liferayHookXML, (err, result) => {
			if (err) {
				throw err;
			}

			expect(result.hook['language-properties']).toEqual([
				'content/Language_en.properties',
				'content/Language_es.properties',
			]);

			cb();
		});
	}

	function _assertFixAtDirectives(cb) {
		const cssPath = path.join(buildPath, 'css');

		const mainCssPath = path.join(cssPath, 'main.css');

		expect(fs.existsSync(cssPath)).toBe(true);
		expect(fs.readFileSync(mainCssPath).toString()).toMatch(
			/@import\surl\(file\.css\?t=[0-9]+\);/
		);

		cb();
	}

	function _assertMoveCompiledCss(cb) {
		const cssPath = path.join(buildPath, 'css');

		expect(fs.existsSync(cssPath)).toBe(true);

		cb();
	}

	function _assertRemoveOldCssDir(cb) {
		const cssPath = path.join(buildPath, '_css');

		expect(fs.existsSync(cssPath)).not.toBe(true);

		cb();
	}

	function _assertRenameCssDir(cb) {
		const _cssPath = path.join(buildPath, '_css');

		expect(fs.existsSync(_cssPath)).toBe(true);

		cb();
	}

	function _assertSrc(cb) {
		const cssPath = path.join(buildPath, 'css');
		const jsPath = path.join(buildPath, 'js');
		const templatesPath = path.join(buildPath, 'templates');
		const imagesPath = path.join(buildPath, 'images');
		const webInfPath = path.join(buildPath, 'WEB-INF');

		expect(fs.existsSync(cssPath)).toBe(true);
		expect(fs.existsSync(jsPath)).toBe(true);
		expect(fs.existsSync(imagesPath)).toBe(true);
		expect(fs.existsSync(webInfPath)).toBe(true);
		expect(fs.existsSync(templatesPath)).toBe(true);

		const customCSSFileName = '_custom.scss';

		const customCSSPath = path.join(cssPath, customCSSFileName);

		const fileContent = testUtil.stripNewlines(
			fs.readFileSync(customCSSPath, {
				encoding: 'utf8',
			})
		);

		expect(
			fileContent.indexOf(
				'/* inject:imports *//* endinject *//* ' +
					customCSSFileName +
					' */'
			) > -1
		).toBe(true);

		const mainJsPath = path.join(jsPath, 'main.js');

		expect(fs.readFileSync(mainJsPath).toString()).toMatch(
			/console\.log\('main\.js'\)/
		);

		const baseTextScssPath = path.join(cssPath, 'base/_text.scss');

		expect(fs.existsSync(baseTextScssPath)).toBe(true);

		const templateLanguage = themeConfig.templateLanguage;

		const initPath = path.join(templatesPath, 'init.' + templateLanguage);
		const initCustomPath = path.join(
			templatesPath,
			'init_custom.' + templateLanguage
		);
		const navigationPath = path.join(
			templatesPath,
			'navigation.' + templateLanguage
		);
		const portalNormalPath = path.join(
			templatesPath,
			'portal_normal.' + templateLanguage
		);
		const portalPopUpPath = path.join(
			templatesPath,
			'portal_pop_up.' + templateLanguage
		);
		const portletPath = path.join(
			templatesPath,
			'portlet.' + templateLanguage
		);

		expect(fs.existsSync(initPath)).toBe(true);
		expect(fs.existsSync(initCustomPath)).toBe(true);
		expect(fs.existsSync(navigationPath)).toBe(true);
		expect(fs.existsSync(portalNormalPath)).toBe(true);
		expect(fs.existsSync(portalPopUpPath)).toBe(true);
		expect(fs.existsSync(portletPath)).toBe(true);

		expect(fs.readFileSync(portalNormalPath).toString()).toMatch(
			/BASE_THEME/
		);

		cb();
	}

	function _assertThemelets(cb) {
		const customScssPath = path.join(
			buildPath,
			'themelets/test-themelet/css/_custom.scss'
		);
		const iconPngPath = path.join(
			buildPath,
			'themelets/test-themelet/images/icon.png'
		);
		const mainJsPath = path.join(
			buildPath,
			'themelets/test-themelet/js/main.js'
		);
		const freemarkerPath = path.join(
			buildPath,
			'themelets/test-themelet/templates/freemarker.ftl'
		);
		const velocityPath = path.join(
			buildPath,
			'themelets/test-themelet/templates/velocity.vm'
		);

		expect(fs.existsSync(customScssPath)).toBe(true);
		expect(fs.existsSync(iconPngPath)).toBe(true);
		expect(fs.existsSync(mainJsPath)).toBe(true);
		expect(fs.existsSync(freemarkerPath)).toBe(true);
		expect(fs.existsSync(velocityPath)).toBe(true);

		const customCSSFileName = '_custom.scss';

		const customCSSPath = path.join(buildPath, 'css', customCSSFileName);

		expect(fs.readFileSync(customCSSPath).toString()).toMatch(
			/@import "\.\.\/themelets\/test-themelet\/css\/_custom\.scss";/
		);

		// TODO: add inject tags to themes when in development

		const portalNormalPath = path.join(
			buildPath,
			'templates/portal_normal.ftl'
		);

		expect(fs.readFileSync(portalNormalPath).toString()).toMatch(
			/<script src="\${theme_display\.getPathThemeRoot\(\)}\/themelets\/test-themelet\/js\/main\.js"><\/script>/
		);

		cb();
	}

	function _assertWar(cb) {
		const warPath = path.join(tempPath, 'dist/base-theme.war');

		expect(fs.existsSync(warPath)).toBe(true);

		cb();
	}

	function _assertWebInf(cb) {
		const webInfPath = path.join(buildPath, 'WEB-INF');
		const pluginPackagePath = path.join(
			webInfPath,
			'liferay-plugin-package.properties'
		);

		expect(fs.existsSync(webInfPath)).toBe(true);
		expect(fs.existsSync(pluginPackagePath)).toBe(true);

		cb();
	}
});
