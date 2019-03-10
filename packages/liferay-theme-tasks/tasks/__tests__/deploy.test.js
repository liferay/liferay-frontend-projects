const del = require('del');
const fs = require('fs-extra');
const path = require('path');

const testUtil = require('../../test/util');

const initCwd = process.cwd();

let deployPath;
let runSequence;
let styledPath;
let tempPath;
let unstyledPath;

function getDependency(name) {
	return path.dirname(require.resolve(path.join(name, 'package.json')));
}

function setEnv(key, value) {
	const previousValue = process.env[key];
	process.env[key] = value;
	return previousValue;
}

beforeEach(() => {
	jest.setTimeout(30000);

	testUtil.hideConsole();

	styledPath = setEnv(
		'LIFERAY_THEME_STYLED_PATH',
		getDependency('liferay-frontend-theme-styled')
	);
	unstyledPath = setEnv(
		'LIFERAY_THEME_UNSTYLED_PATH',
		getDependency('liferay-frontend-theme-unstyled')
	);

	const config = testUtil.copyTempTheme({
		namespace: 'deploy_task',
		registerTasks: true,
		themeName: 'base-theme-7-2',
		version: '7.2',
	});

	runSequence = config.runSequence;
	tempPath = config.tempPath;

	deployPath = path.join(tempPath, '../appserver/deploy');

	const store = config.gulp.storage;

	store.set('deployPath', deployPath);
	store.set('webBundleDir');

	fs.mkdirsSync(deployPath);
});

afterEach(() => {
	testUtil.cleanTempTheme('base-theme-7-2', '7.2', 'deploy_task', initCwd);
	del.sync(path.join(deployPath, '**'), {
		force: true,
	});
	setEnv('LIFERAY_THEME_STYLED_PATH', styledPath);
	setEnv('LIFERAY_THEME_UNSTYLED_PATH', unstyledPath);

	testUtil.restoreConsole();
});

it('should deploy to deploy server', done => {
	runSequence('deploy', err => {
		if (err) throw err;

		expect(fs.existsSync(path.join(deployPath, 'base-theme.war'))).toBe(
			true
		);

		done();
	});
});
