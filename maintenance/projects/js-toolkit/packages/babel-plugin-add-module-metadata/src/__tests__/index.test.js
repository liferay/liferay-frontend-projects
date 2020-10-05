/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babel from 'babel-core';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import Manifest from 'liferay-npm-build-tools-common/lib/manifest';
import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import plugin from '../index';

const prjDirPath = path.join(__dirname, '__fixtures__', 'a-project');
const prjRelModulePath = path.join('path', 'to', 'module.js');
const filename = path.join(prjDirPath, prjRelModulePath);
const prjPkgDesc = new PkgDesc('a-project', '1.0.0', null);

const case1Source = `
Object.defineProperty(exports, "__esModule", {
	value: true
  });

var x = require('./x');
console.log('x is', x);
module.exports = 'Here is x: ' + x;
`;
const case2Source = `
Object.defineProperty(exports, "__esModule", {
	value: true
  });

var x = require('./x');
console.log('x is', x);
module.exports = 'Here is x: ' + x;
`;

beforeAll(() => {
	project.loadFrom(prjDirPath);
});

describe('plugin feature tests', () => {
	let logger, manifest;

	beforeEach(() => {
		babelIpc.set(filename, {
			log: (logger = new PluginLogger()),
			manifest: (manifest = new Manifest()),
			rootPkgJson: project.pkgJson,
		});
	});

	it('esModule flag is added in case 1', () => {
		const source = case1Source;

		babel.transform(source, {
			filename,
			plugins: [plugin],
		});

		const pkg = manifest.getPackage(prjPkgDesc);

		const {flags} = pkg.modules[prjRelModulePath];

		expect(flags.esModule).toBe(true);
	});

	it('esModule flag is added in case 2', () => {
		const source = `
		module.exports.__esModule = true;

		var x = require('./x');
		console.log('x is', x);
		module.exports = 'Here is x: ' + x;
		`;

		babel.transform(source, {
			filename,
			plugins: [plugin],
		});

		const pkg = manifest.getPackage(prjPkgDesc);

		const {flags} = pkg.modules[prjRelModulePath];

		expect(flags.esModule).toBe(true);
	});

	it('logs results correctly in case 1', () => {
		const source = case1Source;

		babel.transform(source, {
			filename,
			plugins: [plugin],
		});

		expect(logger.messages).toEqual([
			{
				level: 'info',
				source: 'add-module-metadata',
				things: ["Added 'esModule' flag"],
			},
		]);
	});

	it('logs results correctly in case 2', () => {
		const source = case2Source;

		babel.transform(source, {
			filename,
			plugins: [plugin],
		});

		expect(logger.messages).toEqual([
			{
				level: 'info',
				source: 'add-module-metadata',
				things: ["Added 'esModule' flag"],
			},
		]);
	});
});
