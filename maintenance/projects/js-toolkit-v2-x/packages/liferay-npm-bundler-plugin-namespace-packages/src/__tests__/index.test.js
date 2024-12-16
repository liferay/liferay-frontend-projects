/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import path from 'path';
import readJsonSync from 'read-json-sync';

import plugin from '../index';

const fixturesDir = path.join(__dirname, '__fixtures__');

it('namespaces packages correctly for the root package', () => {
	const pkgJson = readJsonSync(`${fixturesDir}/project/package.json`);
	const pkg = new PkgDesc(pkgJson.name, pkgJson.version, fixturesDir, true);
	const log = new PluginLogger();

	plugin({pkg, log, rootPkgJson: pkgJson}, {pkgJson});

	expect(pkgJson).toMatchSnapshot();
});

it('namespaces packages correctly for non-root package', () => {
	const rootPkgJson = readJsonSync(`${fixturesDir}/project/package.json`);
	const dir = `${fixturesDir}/project/node_modules/is-finite`;
	const pkgJson = readJsonSync(`${dir}/package.json`);
	const pkg = new PkgDesc(pkgJson.name, pkgJson.version, dir);
	const log = new PluginLogger();

	plugin({pkg, log, rootPkgJson}, {pkgJson});

	expect(pkgJson).toMatchSnapshot();
});

it('logs results correctly', () => {
	const rootPkgJson = readJsonSync(`${fixturesDir}/project/package.json`);
	const dir = `${fixturesDir}/project/node_modules/is-finite`;
	const pkgJson = readJsonSync(`${dir}/package.json`);
	const pkg = new PkgDesc(pkgJson.name, pkgJson.version, dir);
	const log = new PluginLogger();

	plugin({pkg, log, rootPkgJson}, {pkgJson});

	expect(log.messages).toMatchSnapshot();
});
