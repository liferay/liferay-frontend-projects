const del = require('del');
const fs = require('fs-extra');
const Gulp = require('gulp').Gulp;
const path = require('path');

const testUtil = require('../../test/util');

const initCwd = process.cwd();

let registerTasks;
let runSequence;
let deployPath;
let tempPath;

beforeEach(() => {
	jest.setTimeout(30000);

	testUtil.hideConsole();

	const config = testUtil.copyTempTheme({
		namespace: 'deploy_task',
		registerTasks: true,
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
	testUtil.cleanTempTheme('base-theme', '7.0', 'deploy_task', initCwd);
	del.sync(path.join(deployPath, '**'), {
		force: true,
	});

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
