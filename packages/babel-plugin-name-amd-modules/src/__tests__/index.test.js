/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babel from 'babel-core';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import path from 'path';
import plugin from '../index';

const filenameRelative = path.join(__dirname, '__fixtures__', 'source.js');

let logger;

beforeEach(() => {
	babelIpc.set(filenameRelative, {
		log: (logger = new PluginLogger()),
	});
});

it('logs results correctly', () => {
	const source = `
	define([], function(){})
	`;

	babel.transform(source, {
		filenameRelative,
		plugins: [plugin],
	});

	expect(logger.messages).toMatchSnapshot();
});

it('correctly names anonymous modules', () => {
	const source = `
	define([], function(){})
	`;

	const {code} = babel.transform(source, {
		filenameRelative,
		plugins: [plugin],
	});

	expect(code).toMatchSnapshot();
});

it('correctly renames named modules', () => {
	const source = `
	define('my-invalid-name', [], function(){})
	`;

	const {code} = babel.transform(source, {
		filenameRelative,
		plugins: [plugin],
	});

	expect(code).toMatchSnapshot();
});
