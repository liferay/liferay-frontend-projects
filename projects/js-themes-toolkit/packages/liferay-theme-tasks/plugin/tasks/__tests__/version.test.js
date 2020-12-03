/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

var fs = require('fs-extra');
var {Gulp} = require('gulp');
var path = require('path');

const project = require('../../../lib/project');
const {cleanTempPlugin, setupTempPlugin} = require('../../../lib/test/util');
const {registerTasks} = require('../../index');

let tempPlugin;

beforeEach(() => {
	tempPlugin = setupTempPlugin({
		init: () =>
			registerTasks({
				gulp: new Gulp(),
			}),
		namespace: 'version-task',
		pluginName: 'test-plugin-layouttpl',
		version: '7.0',
	});
});

afterEach(() => {
	cleanTempPlugin(tempPlugin);
});

test('plugin:version should add package.json version to liferay-plugin-package.properties', done => {
	project.gulp.runSequence('plugin:version', () => {
		expect(
			path.join(
				tempPlugin.tempPath,
				'docroot',
				'WEB-INF',
				'liferay-plugin-package.properties'
			)
		).toBeFileMatching(/module-version=1\.2\.3/);

		done();
	});
});

test('plugin:version should add package.json version to liferay-plugin-package.properties', done => {
	const pkgPath = path.join(tempPlugin.tempPath, 'package.json');

	// eslint-disable-next-line liferay/no-dynamic-require
	const pkg = require(pkgPath);

	pkg.version = '1.2.4';

	fs.writeJSONSync(pkgPath, pkg, {spaces: '\t'});

	project.gulp.runSequence('plugin:version', () => {
		expect(
			path.join(
				tempPlugin.tempPath,
				'docroot',
				'WEB-INF',
				'liferay-plugin-package.properties'
			)
		).toBeFileMatching(/module-version=1\.2\.4/);

		done();
	});
});
