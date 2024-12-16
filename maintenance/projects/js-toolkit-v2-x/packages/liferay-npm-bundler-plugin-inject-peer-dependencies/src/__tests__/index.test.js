/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import path from 'path';

import plugin from '../index';

const fixturesDir = path.join(__dirname, '__fixtures__');

describe('when using regular packages', () => {
	it('injects peer dependencies as needed', () => {
		const config = {};
		const log = new PluginLogger();
		const rootPkgJson = require(`${fixturesDir}/project/package.json`);
		const pkg = new PkgDesc(
			'pkg-with-peer-deps',
			'1.0.0',
			`${fixturesDir}/project/node_modules/pkg-with-peer-deps`,
			true
		);
		const source = {
			pkg,
		};
		const pkgJson = require(fixturesDir +
			'/project/node_modules/pkg-with-peer-deps/package.json');

		plugin({config, log, rootPkgJson, pkg, source}, {pkgJson});

		expect(pkgJson.dependencies).toEqual({
			'number-is-nan': '1.0.0',
		});
	});
});

describe('when using scoped packages', () => {
	it('injects peer dependencies for regular packages', () => {
		const config = {};
		const log = new PluginLogger();
		const rootPkgJson = require(`${fixturesDir}/project/package.json`);
		const pkg = new PkgDesc(
			'@scope/pkg-with-peer-deps',
			'1.0.0',
			`${fixturesDir}/project/node_modules/@scope/pkg-with-peer-deps`,
			true
		);
		const source = {
			pkg,
		};
		const pkgJson = require(fixturesDir +
			'/project/node_modules/@scope/pkg-with-peer-deps/package.json');

		plugin({config, log, rootPkgJson, pkg, source}, {pkgJson});

		expect(pkgJson.dependencies).toEqual({
			'@scope/number-is-nan': '1.0.0',
		});
	});

	it('injects peer dependencies for namespaced packages', () => {
		const config = {};
		const log = new PluginLogger();
		const rootPkgJson = require(`${fixturesDir}/project/package.json`);
		const pkg = new PkgDesc(
			'@project$1.0.0$scope/pkg-with-peer-deps',
			'1.0.0',
			fixturesDir +
				'/project/node_modules/@project$1.0.0$scope/pkg-with-peer-deps',
			true
		);
		const source = {
			pkg,
		};
		const pkgJson = require(fixturesDir +
			'/project/node_modules/@project$1.0.0$scope/pkg-with-peer-deps' +
			'/package.json');

		plugin({config, log, rootPkgJson, pkg, source}, {pkgJson});

		expect(pkgJson.dependencies).toEqual({
			'@project$scope/number-is-nan': '1.0.0',
		});
	});
});

it('logs results correctly', () => {
	const config = {};
	const log = new PluginLogger();
	const rootPkgJson = require(`${fixturesDir}/project/package.json`);
	const pkg = new PkgDesc(
		'pkg-for-logs',
		'1.0.0',
		`${fixturesDir}/project/node_modules/pkg-for-logs`,
		true
	);
	const source = {
		pkg,
	};
	const pkgJson = require(fixturesDir +
		'/project/node_modules/pkg-for-logs/package.json');

	plugin({config, log, rootPkgJson, pkg, source}, {pkgJson});

	expect(log.messages).toHaveLength(2);
	expect(log.messages[0]).toMatchObject({
		level: 'info',
		source: 'inject-peer-dependencies',
		things: ['Injected dependency', 'number-is-nan@1.0.0'],
	});
	expect(log.messages[1]).toMatchObject({
		level: 'warn',
		source: 'inject-peer-dependencies',
	});
	expect(log.messages[1].things).toHaveLength(4);
	expect(log.messages[1].things[0]).toBe('Failed to resolve dependency');
	expect(log.messages[1].things[1]).toBe('missing-dep');
	expect(log.messages[1].things[2]).toBe('with error:');
	expect(log.messages[1].things[3].toString()).toMatch(
		/Error: Cannot find module 'missing-dep\/package.json' from '.*'/
	);
});
