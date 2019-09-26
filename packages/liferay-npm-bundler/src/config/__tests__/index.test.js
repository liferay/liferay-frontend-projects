/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

const cfg = require('..');

const savedCwd = process.cwd();

beforeEach(() => {
	process.chdir(path.join(__dirname, '__fixtures__', 'config', 'default'));
	cfg.reloadConfig();
});

afterEach(() => {
	process.chdir(savedCwd);
});

describe('global config', () => {
	it('getVersionsInfo() works', () => {
		const versions = cfg.getVersionsInfo();
		const myVersion = require('../../../package.json').version;

		expect(Object.keys(versions).length).toEqual(9);
		expect(versions['liferay-npm-bundler']).toEqual(myVersion);
		expect(versions['liferay-npm-bundler-plugin-test-0']).toEqual('1.0.0');
		expect(versions['liferay-npm-bundler-plugin-test-1']).toEqual('1.0.1');
		expect(versions['liferay-npm-bundler-plugin-test-2']).toEqual('1.0.2');
		expect(versions['liferay-npm-bundler-plugin-test-3']).toEqual('1.0.3');
		expect(versions['liferay-npm-bundler-plugin-test-4']).toEqual('1.0.4');
		expect(versions['liferay-npm-bundler-plugin-test-5']).toEqual('1.0.5');
		expect(versions['liferay-npm-bundler-plugin-test-6']).toEqual('1.0.6');
		expect(versions['liferay-npm-bundler-plugin-test-7']).toEqual('1.0.7');
	});
});
