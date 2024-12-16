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
	require('a-package.js');
	require('./a-module.js');
	`;

	babel.transform(source, {
		filename: __filename,
		plugins: [plugin],
	});

	expect(logger.messages).toMatchSnapshot();
});

describe('when requiring package default modules', () => {
	it('keeps trailing ".js" from package names', () => {
		const source = `
		require('a-package.js')
		`;

		const {code} = babel.transform(source, {
			filename: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('keeps trailing ".js" from scoped package names', () => {
		const source = `
		require('@some-scope/a-package.js')
		`;

		const {code} = babel.transform(source, {
			filename: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});
});

describe('when requiring local modules', () => {
	it('removes trailing ".js" from module names', () => {
		const source = `
	    require('./a-module.js')
	    `;

		const {code} = babel.transform(source, {
			filename: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('removes trailing "/" from module names', () => {
		const source = `
		require('./a-module/')
	    `;

		const {code} = babel.transform(source, {
			filename: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('only removes trailing "/" from module names ending in ".js"', () => {
		const source = `
		require('./a-module.js/')
	    `;

		const {code} = babel.transform(source, {
			filename: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});
});

describe('when requiring external modules', () => {
	it('removes trailing ".js" from module names', () => {
		const source = `
		require('a-package/a-module.js')
	    `;

		const {code} = babel.transform(source, {
			filename: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('removes trailing "/" from module names', () => {
		const source = `
		require('a-package/a-module/')
	    `;

		const {code} = babel.transform(source, {
			filename: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('only removes trailing "/" from module names ending in ".js"', () => {
		const source = `
		require('a-package/a-module.js/')
		`;

		const {code} = babel.transform(source, {
			filename: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});
});
