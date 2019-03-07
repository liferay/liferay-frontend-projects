const path = require('path');

const testUtil = require('../../../test/util');
const lfrThemeConfig = require('../../liferay_theme_config.js');

const initCwd = process.cwd();

afterAll(() => {
	// Clean things on exit to avoid GulpStorage.save() errors because of left
	// over async operations when changing tests.
	[
		'upgrade_task_black_list',
		'upgrade_task_config',
		'upgrade_task_convert_bootstrap',
		'upgrade_task_create_backup_files',
		'upgrade_task_create_css_diff',
		'upgrade_task_log_changes',
		'upgrade_task_replace_compass',
		'upgrade_task_upgrade_templates',
	].forEach(namespace =>
		testUtil.cleanTempTheme('base-theme', '7.0', namespace, initCwd)
	);
});

beforeEach(() => {
	testUtil.hideConsole();
});

afterEach(() => {
	testUtil.restoreConsole();
});

describe('config', () => {
	let runSequence;
	let tempPath;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_config',
			themeName: 'base-theme',
			registerTasksOptions: {},
		});

		runSequence = config.runSequence;
		tempPath = config.tempPath;
	});

	it('upgrade:config', done => {
		runSequence('upgrade:config', err => {
			if (err) throw err;

			const themeConfig = lfrThemeConfig.getConfig();

			expect(themeConfig.version).toBe('7.1');

			const lookAndFeelPath = path.join(
				tempPath,
				'src/WEB-INF/liferay-look-and-feel.xml'
			);
			const pluginPackagePropertiesPath = path.join(
				tempPath,
				'src/WEB-INF/liferay-plugin-package.properties'
			);

			expect(lookAndFeelPath).toBeFileMatching(/7\.1\.0/);
			expect(lookAndFeelPath).toBeFileMatching(/7_1_0/);
			expect(pluginPackagePropertiesPath).toBeFileMatching(/7\.1\.0\+/);

			expect(lookAndFeelPath).not.toBeFileMatching(/7\.0\.0/);
			expect(lookAndFeelPath).not.toBeFileMatching(/7_0_0/);
			expect(pluginPackagePropertiesPath).not.toBeFileMatching(/7\.0\.0/);

			done();
		});
	});
});

describe('create backup files', () => {
	let runSequence;
	let tempPath;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_create_backup_files',
			themeName: 'base-theme',
			registerTasksOptions: {},
		});

		runSequence = config.runSequence;
		tempPath = config.tempPath;
	});

	it('upgrade:create-backup-files should create backup files from source', done => {
		runSequence('upgrade:create-backup-files', err => {
			if (err) throw err;

			expect(path.join(tempPath, '_backup')).toBeFolder();
			expect(path.join(tempPath, '_backup/src')).toBeFolder();
			expect(
				path.join(tempPath, '_backup/src/css/_custom.scss')
			).toBeFile();

			done();
		});
	});
});

describe('log changes', () => {
	let runSequence;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_log_changes',
			themeName: 'base-theme',
			registerTasksOptions: {},
		});

		runSequence = config.runSequence;
	});

	it('should log changes that have been and should be made', done => {
		runSequence('upgrade:log-changes', function(err) {
			if (err) throw err;

			// implement sinon stubs

			done();
		});
	});
});

describe('upgrade templates', () => {
	let runSequence;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'upgrade_task_upgrade_templates',
			themeName: 'base-theme',
			registerTasksOptions: {},
		});

		runSequence = config.runSequence;
	});

	it('should scrape templates for needed changes', done => {
		runSequence('upgrade:ftl-templates', err => {
			if (err) throw err;

			// TODO: implement 'upgrade templates' test

			done();
		});
	});
});
