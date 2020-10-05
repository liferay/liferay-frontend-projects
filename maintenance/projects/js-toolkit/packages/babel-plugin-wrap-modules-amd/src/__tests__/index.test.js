/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babel from 'babel-core';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

import plugin from '../index';

let logger;

beforeEach(() => {
	babelIpc.set(__filename, {
		log: (logger = new PluginLogger()),
	});
});

it('logs results correctly', () => {
	const source = `
	console.log('Say something');
	var a = require('a-module');
	var b = require('b-module');
	`;

	babel.transform(source, {
		filename: __filename,
		plugins: [plugin],
	});

	expect(logger.messages).toMatchSnapshot();
});

it('correctly wraps modules', () => {
	const source = `
	console.log('Say something');
	if (1 == 0) {
		console.log('Something broke in the Matrix');
	}
	module.exports = 'All OK';
	`;

	const {code} = babel.transform(source, {
		filename: __filename,
		plugins: [plugin],
	});

	expect(code).toMatchSnapshot();
});
