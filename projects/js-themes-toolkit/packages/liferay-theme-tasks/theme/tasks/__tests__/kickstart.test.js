/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const {Gulp} = require('gulp');
const path = require('path');

const project = require('../../../lib/project');
const {cleanTempTheme, setupTempTheme} = require('../../../lib/test/util');
const {registerTasks} = require('../../index');
const KickstartPrompt = require('../../prompts/kickstart_prompt');

const savedPrompt = KickstartPrompt.prompt;

const kickstartThemePath = path.join(
	__dirname,
	'..',
	'..',
	'..',
	'lib',
	'test',
	'fixtures',
	'themes',
	'7.1',
	'kickstart-theme',
	'src'
);

describe('globally installed theme', () => {
	let tempTheme;

	beforeEach(() => {
		tempTheme = setupTempTheme({
			init: () => registerTasks({gulp: new Gulp()}),
			namespace: 'kickstart_task_global',
			themeName: 'base-theme',
			version: '7.1',
		});

		KickstartPrompt.prompt = (config, cb) => {
			const answers = {
				module: 'kickstart-theme',
				modulePath: kickstartThemePath,
				modules: {
					'some-theme': {},
				},
			};

			cb(answers);
		};
	});

	afterEach(() => {
		KickstartPrompt.prompt = savedPrompt;

		cleanTempTheme(tempTheme);
	});

	it('kickstarts', done => {
		project.gulp.runSequence('kickstart', () => {
			const srcDir = path.join(tempTheme.tempPath, 'src');

			expect(
				fs
					.readFileSync(path.join(srcDir, 'css', '_custom.scss'))
					.toString()
			).toEqual('/* kickstart-theme css */');

			expect(
				fs
					.readFileSync(path.join(srcDir, 'images', 'image.png'))
					.toString()
			).toEqual('kickstart-theme png');

			expect(
				fs.readFileSync(path.join(srcDir, 'js', 'main.js')).toString()
			).toContain('// kickstart-theme js\n');

			expect(
				fs
					.readFileSync(
						path.join(srcDir, 'templates', 'portal_normal.ftl')
					)
					.toString()
			).toEqual('kickstart-theme ftl');

			done();
		});
	});
});

describe('npm theme', () => {
	let tempTheme;

	beforeEach(() => {
		tempTheme = setupTempTheme({
			init: () => registerTasks({gulp: new Gulp()}),
			namespace: 'kickstart_task_npm',
		});

		KickstartPrompt.prompt = (config, cb) => {
			const answers = {
				module: 'some-theme',
				modules: {
					'some-theme': {},
				},
			};

			cb(answers);
		};
	});

	afterEach(() => {
		KickstartPrompt.prompt = savedPrompt;

		cleanTempTheme(tempTheme);
	});

	it('kickstarts', done => {
		project.gulp.runSequence('kickstart', done);
	});
});
