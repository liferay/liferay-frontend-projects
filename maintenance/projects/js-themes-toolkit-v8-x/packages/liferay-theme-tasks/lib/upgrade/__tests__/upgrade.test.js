/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

const testUtil = require('../../../test/util');
const lfrThemeConfig = require('../../liferay_theme_config');
const gulpBlackList = require('../6.2/gulp_black_list');

const initCwd = process.cwd();

afterAll(() => {

	// Clean things on exit to avoid GulpStorage.save() errors because of left
	// over async operations when changing tests.

	[
		'upgrade_task_black_list',
		'upgrade_task_config',
		'upgrade_task_convert_bootstrap',
		'upgrade_task_create_deprecated_mixins',
		'upgrade_task_log_changes',
		'upgrade_task_replace_compass',
		'upgrade_task_upgrade_templates',
	].forEach((namespace) =>
		testUtil.cleanTempTheme('upgrade-theme', '6.2', namespace, initCwd)
	);
});

beforeEach(() => {
	testUtil.hideConsole();
});

afterEach(() => {
	testUtil.restoreConsole();
});

describe('black list', () => {
	let gulp;
	let runSequence;
	let tempPath;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_black_list',
			registerTasksOptions: {
				pathSrc: 'src',
			},
			themeName: 'upgrade-theme',
			version: '6.2',
		});

		tempPath = config.tempPath;
		runSequence = config.runSequence;
		gulp = config.gulp;
	});

	it('creates blacklist of scss mixins found in theme css files', (done) => {
		runSequence('upgrade:black-list', (err) => {
			if (err) {
				throw err;
			}

			gulp.src(path.join(tempPath, 'src/css/*')).pipe(
				gulpBlackList(null, (result) => {
					expect(result.mixins).toBeTruthy();
					expect(result.mixins.indexOf('border-radius') > -1).toBe(
						true
					);

					done();
				})
			);
		});
	});
});

describe('config', () => {
	let runSequence;
	let tempPath;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_config',
			registerTasksOptions: {
				pathSrc: 'src',
			},
			themeName: 'upgrade-theme',
			version: '6.2',
		});

		runSequence = config.runSequence;
		tempPath = config.tempPath;
	});

	it('upgrade:config', (done) => {
		runSequence('upgrade:config', (err) => {
			if (err) {
				throw err;
			}

			const themeConfig = lfrThemeConfig.getConfig();

			expect(themeConfig.version).toBe('7.0');

			const lookAndFeelPath = path.join(
				tempPath,
				'src/WEB-INF/liferay-look-and-feel.xml'
			);
			const pluginPackagePropertiesPath = path.join(
				tempPath,
				'src/WEB-INF/liferay-plugin-package.properties'
			);

			expect(lookAndFeelPath).toBeFileMatching(/7\.0\.0/);
			expect(lookAndFeelPath).toBeFileMatching(/7_0_0/);
			expect(pluginPackagePropertiesPath).toBeFileMatching(/7\.0\.0\+/);

			expect(lookAndFeelPath).not.toBeFileMatching(/6\.2\.0/);
			expect(lookAndFeelPath).not.toBeFileMatching(/6_2_0/);
			expect(pluginPackagePropertiesPath).not.toBeFileMatching(/6\.2\.0/);

			done();
		});
	});
});

describe('convert bootstrap', () => {
	let runSequence;
	let tempPath;

	beforeEach((done) => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_convert_bootstrap',
			registerTasksOptions: {
				pathSrc: 'src',
			},
			themeName: 'upgrade-theme',
			version: '6.2',
		});

		runSequence = config.runSequence;
		tempPath = config.tempPath;

		done();
	});

	it('upgrade:convert-bootstrap should run convert-bootstrap-2-to-3 module on css files', (done) => {
		runSequence('upgrade:convert-bootstrap', (err) => {
			if (err) {
				throw err;
			}

			const customCSSPath = path.join(tempPath, 'src/css/custom.css');

			expect(customCSSPath).not.toBeFileMatching(/\$grayDark/);
			expect(customCSSPath).toBeFileMatching(/\$gray-dark/);
			expect(customCSSPath).toBeFileMatching(/\$gray-darker/);

			done();
		});
	});
});

describe('create deprecated mixins', () => {
	let runSequence;
	let tempPath;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_create_deprecated_mixins',
			registerTasksOptions: {
				pathSrc: 'src',
			},
			themeName: 'upgrade-theme',
			version: '6.2',
		});

		runSequence = config.runSequence;
		tempPath = config.tempPath;
	});

	it('creates deprecated mixins file', (done) => {
		runSequence(
			'upgrade:config',
			'upgrade:create-deprecated-mixins',
			(err) => {
				if (err) {
					throw err;
				}

				expect(
					path.join(tempPath, 'src/css/_deprecated_mixins.scss')
				).toBeFile();

				done();
			}
		);
	});
});

describe('log changes', () => {
	let runSequence;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_log_changes',
			registerTasksOptions: {
				pathSrc: 'src',
			},
			themeName: 'upgrade-theme',
			version: '6.2',
		});

		runSequence = config.runSequence;
	});

	it('logs changes that have been and should be made', (done) => {
		runSequence('upgrade:log-changes', (err) => {
			if (err) {
				throw err;
			}

			// implement sinon stubs

			done();
		});
	});
});

describe('replace compass', () => {
	let runSequence;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_replace_compass',
			registerTasksOptions: {
				pathSrc: 'src',
			},
			themeName: 'upgrade-theme',
			version: '6.2',
		});

		runSequence = config.runSequence;
	});

	it('upgrade:replace-compass should replace compass mixins with bourbon equivalents exluding anything mixins/functions on blacklist', (done) => {
		runSequence('upgrade:black-list', 'upgrade:replace-compass', (err) => {
			if (err) {
				throw err;
			}

			const customCSSPath = path.join(
				process.cwd(),
				'src/css/custom.css'
			);

			expect(customCSSPath).toBeFileMatching(/@import\s"bourbon";/);
			expect(customCSSPath).not.toBeFileMatching(/@import\s"compass";/);

			expect(customCSSPath).toBeFileMatching(/@include\sborder-radius/);
			expect(customCSSPath).not.toBeFileMatching(/@include\sbox-shadow/);

			done();
		});
	});
});

describe('upgrade templates', () => {
	let runSequence;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_upgrade_templates',
			registerTasksOptions: {
				pathSrc: 'src',
			},
			themeName: 'upgrade-theme',
			version: '6.2',
		});

		runSequence = config.runSequence;
	});

	it('scrapes templates for needed changes', (done) => {
		runSequence('upgrade:ftl-templates', 'upgrade:vm-templates', (err) => {
			if (err) {
				throw err;
			}

			// TODO: implement 'upgrade templates' test

			done();
		});
	});
});
