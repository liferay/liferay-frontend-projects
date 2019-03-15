/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

const testUtil = require('../../test/util');

const prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

const initCwd = process.cwd();

afterAll(() => {
	// Clean things on exit to avoid GulpStorage.save() errors because of left
	// over async operations when changing tests.
	['kickstart_task_global', 'kickstart_task_npm'].forEach(namespace =>
		testUtil.cleanTempTheme('base-theme', '7.1', namespace, initCwd)
	);
});

describe('globally installed theme', () => {
	let KickstartPrompt;
	let runSequence;
	let tempPath;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'kickstart_task_global',
			themeName: 'base-theme',
			version: '7.1',
			registerTasks: true,
		});

		runSequence = config.runSequence;
		tempPath = config.tempPath;

		KickstartPrompt = require('../../lib/prompts/kickstart_prompt');
	});

	it('should kickstart', done => {
		const promptInitSpy = prototypeMethodSpy.add(
			KickstartPrompt.prototype,
			'init'
		);

		runSequence('kickstart', function() {
			const srcDir = path.join(tempPath, 'src');

			expect(
				fs
					.readFileSync(path.join(srcDir, 'css/_custom.scss'))
					.toString()
			).toEqual('/* kickstart-theme css */');

			expect(
				fs
					.readFileSync(path.join(srcDir, 'images/image.png'))
					.toString()
			).toEqual('kickstart-theme png');

			expect(
				fs.readFileSync(path.join(srcDir, 'js/main.js')).toString()
			).toContain('// kickstart-theme js\n');

			expect(
				fs
					.readFileSync(
						path.join(srcDir, 'templates/portal_normal.ftl')
					)
					.toString()
			).toEqual('kickstart-theme ftl');

			done();
		});

		const initArgs = promptInitSpy.getCall(0).args;

		const promptCb = initArgs[1];

		const kickstartThemePath = path.join(
			__dirname,
			'../../test/fixtures/themes/7.1/kickstart-theme/src'
		);

		const answers = {
			module: 'kickstart-theme',
			modulePath: kickstartThemePath,
			modules: {
				'some-theme': {},
			},
		};

		promptCb(answers);
	});
});

describe('npm theme', () => {
	let KickstartPrompt;
	let runSequence;

	beforeEach(() => {
		const config = testUtil.copyTempTheme({
			namespace: 'kickstart_task_npm',
			registerTasks: true,
		});

		runSequence = config.runSequence;

		KickstartPrompt = require('../../lib/prompts/kickstart_prompt');
	});

	it('should kickstart', done => {
		const promptInitSpy = prototypeMethodSpy.add(
			KickstartPrompt.prototype,
			'init'
		);

		runSequence('kickstart', done);

		const initArgs = promptInitSpy.getCall(0).args;

		const promptCb = initArgs[1];

		expect(initArgs[0].themeConfig.baseTheme).toBeTruthy();
		expect(initArgs[0].themeConfig.version).toBeTruthy();

		const answers = {
			module: 'some-theme',
			modules: {
				'some-theme': {},
			},
		};

		promptCb(answers);
	});
});
