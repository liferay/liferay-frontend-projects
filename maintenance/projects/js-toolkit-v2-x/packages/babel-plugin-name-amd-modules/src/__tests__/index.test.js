/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babel from 'babel-core';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import plugin from '../index';

const prjDirPath = path.join(__dirname, '__fixtures__', 'a-project');
const filename = path.join(prjDirPath, 'path', 'to', 'module.js');

beforeAll(() => {
	project.loadFrom(prjDirPath);
});

describe('plugin feature tests', () => {
	let logger;

	beforeEach(() => {
		babelIpc.set(filename, {
			log: (logger = new PluginLogger()),
		});
	});

	it('logs results correctly', () => {
		const source = `
		define([], function(){})
		`;

		babel.transform(source, {
			filename,
			plugins: [plugin],
		});

		expect(logger.messages).toEqual([
			{
				level: 'info',
				source: 'name-amd-modules',
				things: ["Set module name to 'a-project@1.0.0/path/to/module'"],
			},
		]);
	});

	it('correctly names anonymous modules', () => {
		const source = `
		define([], function(){})
		`;

		const {code} = babel.transform(source, {
			filename,
			plugins: [plugin],
		});

		expect(code).toEqual(
			`\ndefine("a-project@1.0.0/path/to/module", [], function () {});`
		);
	});

	it('correctly renames named modules', () => {
		const source = `
		define('my-invalid-name', [], function(){})
		`;

		const {code} = babel.transform(source, {
			filename,
			plugins: [plugin],
		});

		expect(code).toEqual(
			`\ndefine('a-project@1.0.0/path/to/module', [], function () {});`
		);
	});

	it('honors `packageName` option', () => {
		const source = `
		define([], function(){})
		`;

		const {code} = babel.transform(source, {
			filename,
			plugins: [[plugin, {packageName: 'override-pkg-name'}]],
		});

		expect(code).toEqual(
			`\ndefine("override-pkg-name/path/to/module", [], function () {});`
		);
	});

	it('honors `srcPrefixes` option', () => {
		const source = `
		define([], function(){})
		`;

		const {code} = babel.transform(source, {
			filename,
			plugins: [[plugin, {srcPrefixes: ['path/to']}]],
		});

		expect(code).toEqual(
			`\ndefine("a-project@1.0.0/module", [], function () {});`
		);
	});
});
