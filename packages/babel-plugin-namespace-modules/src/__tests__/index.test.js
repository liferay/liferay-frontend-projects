/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babel from 'babel-core';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import plugin from '../index';

const prjDirPath = path.join(__dirname, '__fixtures__', 'a-project');
const filenameRelative = path.join('path', 'to', 'module.js');
const filename = path.join(prjDirPath, filenameRelative);

const imports = {
	provider: {
		'imp-package': '^1.0.0',
	},
	shims: {
		fs: '^1.0.0',
	},
	'': {
		'no-namespace-package': '^1.0.0',
	},
};

beforeAll(() => {
	project.loadFrom(prjDirPath);
});

describe('plugin feature tests', () => {
	let logger;

	beforeEach(() => {
		babelIpc.set(filenameRelative, {
			log: (logger = new PluginLogger()),
			rootPkgJson: project.pkgJson,
			globalConfig: {imports},
		});
	});

	it('namespaces require() modules', () => {
		const source = `
			define(function(){
				require('a-package');
				require('imp-package');
				require('no-namespace-package');
				require('./a-local-module');
				require('fs');
			})
		`;

		const {code} = babel.transform(source, {
			filename,
			filenameRelative,
			plugins: [plugin],
		});

		expect(code).toEqual(`
define(function () {
	require('a-project$a-package');
	require('provider$imp-package');
	require('no-namespace-package');
	require('./a-local-module');
	require('shims$fs');
});`);
	});

	it('namespaces define() dependencies', () => {
		const source = `
			define(
				['a-package', 'imp-package', 'no-namespace-package', './a-local-module', 'fs'], 
				function(){
				}
			)
		`;

		const {code} = babel.transform(source, {
			filenameRelative,
			plugins: [plugin],
		});

		expect(code).toEqual(`
define(['a-project$a-package', 'provider$imp-package', 'no-namespace-package', './a-local-module', 'shims$fs'], function () {});`);
	});

	it('does not namespace define() module name in the root package', () => {
		const source = `
			define('a-project/module', function(){
			})
		`;

		const {code} = babel.transform(source, {
			filename,
			filenameRelative,
			plugins: [plugin],
		});

		expect(code).toEqual(`
define('a-project/module', function () {});`);
	});

	it('namespaces all together', () => {
		const source = `
			define(
				'a-project/module', 
				['a-package', 'imp-package', 'no-namespace-package', './a-local-module', 'fs'], 
				function(){
					require('a-package');
					require('imp-package');
					require('no-namespace-package');
					require('./a-local-module');
					require('fs');
				}
			)
		`;

		const {code} = babel.transform(source, {
			filename,
			filenameRelative,
			plugins: [plugin],
		});

		expect(code).toEqual(`
define('a-project/module', ['a-project$a-package', 'provider$imp-package', 'no-namespace-package', './a-local-module', 'shims$fs'], function () {
	require('a-project$a-package');
	require('provider$imp-package');
	require('no-namespace-package');
	require('./a-local-module');
	require('shims$fs');
});`);
	});

	it('logs results correctly', () => {
		const source = `
			define(
				'a-project/module', 
				['a-package', 'imp-package', './a-local-module', 'fs'], 
				function(){
					require('a-package');
					require('imp-package');
					require('./a-local-module');
					require('fs');
				}
			)
		`;

		babel.transform(source, {
			filename,
			filenameRelative,
			plugins: [plugin],
		});

		expect(logger.messages).toEqual([
			{
				level: 'info',
				source: 'namespace-modules',
				things: [
					'Namespaced',
					0,
					'define() names,',
					3,
					'define() dependencies,',
					'and',
					3,
					'require() names',
				],
			},
		]);
	});
});

describe('when module is', () => {
	it('in a dependency, namespaces define() module name', () => {
		const filenameRelative = path.join(
			'node_modules',
			'a-package',
			'path',
			'to',
			'module.js'
		);
		const filename = path.join(prjDirPath, filenameRelative);

		const source = `
			define('a-package/module', function(){
			})
		`;

		babelIpc.set(filenameRelative, {
			log: new PluginLogger(),
			rootPkgJson: project.pkgJson,
			globalConfig: {imports},
		});

		const {code} = babel.transform(source, {
			filename,
			filenameRelative,
			plugins: [plugin],
		});

		expect(code).toEqual(`
define('a-project$a-package/module', function () {});`);
	});

	it('in a scoped dependency, namespaces define() module name', () => {
		const filenameRelative = path.join(
			'node_modules',
			'@a-scoped',
			'package',
			'path',
			'to',
			'module.js'
		);
		const filename = path.join(prjDirPath, filenameRelative);

		const source = `
				define('@a-scoped/package/module', function(){
				})
			`;

		babelIpc.set(filenameRelative, {
			log: new PluginLogger(),
			rootPkgJson: project.pkgJson,
			globalConfig: {imports},
		});

		const {code} = babel.transform(source, {
			filename,
			filenameRelative,
			plugins: [plugin],
		});

		expect(code).toEqual(`
define('@a-project$a-scoped/package/module', function () {});`);
	});
});
