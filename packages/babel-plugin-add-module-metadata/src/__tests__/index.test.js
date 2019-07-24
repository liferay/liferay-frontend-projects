/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babel from 'babel-core';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import Manifest from 'liferay-npm-build-tools-common/lib/manifest';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import path from 'path';

import plugin from '../index';

const pkgJson = require(path.join(__dirname, '../../package.json'));
const pkgDesc = new PkgDesc(pkgJson.name, pkgJson.version, null);

let logger, manifest;

beforeEach(() => {
	babelIpc.set(__filename, {
		log: (logger = new PluginLogger()),
		manifest: (manifest = new Manifest()),
		rootPkgJson: pkgJson,
	});
});

describe('esModule flag', () => {
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

	it('is added in case 1', () => {
		const source = case1Source;

		babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		const pkg = manifest.getPackage(pkgDesc);

		const {flags} = pkg.modules['src/__tests__/index.test.js'];

		expect(flags.esModule).toBe(true);
	});

	it('is added in case 2', () => {
		const source = `
		module.exports.__esModule = true;

		var x = require('./x');
		console.log('x is', x);
		module.exports = 'Here is x: ' + x;
		`;

		babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		const pkg = manifest.getPackage(pkgDesc);

		const {flags} = pkg.modules['src/__tests__/index.test.js'];

		expect(flags.esModule).toBe(true);
	});

	it('logs results correctly in case 1', () => {
		const source = case1Source;

		babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(logger.messages).toMatchSnapshot();
	});

	it('logs results correctly in case 2', () => {
		const source = case2Source;

		babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(logger.messages).toMatchSnapshot();
	});
});
