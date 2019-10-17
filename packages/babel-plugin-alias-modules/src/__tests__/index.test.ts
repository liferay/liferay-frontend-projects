/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

import {resolve} from '../index';

const fixturesDir = new FilePath(path.join(__dirname, '__fixtures__'));

let log: PluginLogger;

beforeEach(() => {
	log = new PluginLogger();
});

describe('for absolute paths', () => {
	it('returns undefined', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'/absolute/path/to/module',
				['browser'],
				log
			)
		).toBeUndefined();
	});

	it('logs an error', () => {
		resolve(
			fixturesDir,
			fixturesDir.join('index.js'),
			'/absolute/path/to/module',
			['browser'],
			log
		);

		expect(log.messages).toEqual([
			{
				level: 'error',
				source: 'babel-plugin-alias-modules',
				things: [
					'Require to absolute path /absolute/path/to/module will ' +
						'not work in AMD environments (like Liferay)',
				],
			},
		]);
	});
});

describe('when unaliased', () => {
	it('resolves external module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'path/to/unaliased/external/module',
				['browser'],
				log
			)
		).toEqual('path/to/unaliased/external/module');
	});

	it('resolves local module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/unaliased/module',
				['browser'],
				log
			)
		).toEqual('./path/to/unaliased/module');
	});

	it('resolves local file', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/unaliased/module.js',
				['browser'],
				log
			)
		).toEqual('./path/to/unaliased/module.js');
	});
});

describe('when aliased in the same folder', () => {
	it('resolves external module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join(
					'path',
					'to',
					'in',
					'folder',
					'aliased',
					'index.js'
				),
				'external/module',
				['browser'],
				log
			)
		).toEqual('a-shim-package');
	});

	it('resolves local module required as module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/in/folder/aliased/module',
				['browser'],
				log
			)
		).toEqual('./path/to/in/folder/aliased/module-shim.js');
	});

	it('does not resolve local module required as file', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/in/folder/aliased/module.js',
				['browser'],
				log
			)
		).toEqual('./path/to/in/folder/aliased/module.js');
	});

	it('resolves local file required as module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/in/folder/aliased/file',
				['browser'],
				log
			)
		).toEqual('./path/to/in/folder/aliased/file-shim.js');
	});

	it('resolves local file required as file', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/in/folder/aliased/file.js',
				['browser'],
				log
			)
		).toEqual('./path/to/in/folder/aliased/file-shim.js');
	});
});

describe('when aliased in a parent folder', () => {
	it('resolves external module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join(
					'path',
					'to',
					'in',
					'parent',
					'aliased',
					'index.js'
				),
				'external/module',
				['browser'],
				log
			)
		).toEqual('a-shim-package');
	});

	it('resolves local module required as module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/in/parent/aliased/module',
				['browser'],
				log
			)
		).toEqual('./path/to/in/parent/module-shim.js');
	});

	it('does not resolve local module required as file', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/in/parent/aliased/module.js',
				['browser'],
				log
			)
		).toEqual('./path/to/in/parent/aliased/module.js');
	});

	it('resolves local file required as module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/in/parent/aliased/file',
				['browser'],
				log
			)
		).toEqual('./path/to/in/parent/file-shim.js');
	});

	it('resolves local file required as file', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/in/parent/aliased/file.js',
				['browser'],
				log
			)
		).toEqual('./path/to/in/parent/file-shim.js');
	});
});

describe('when aliased as `false`', () => {
	it('works for external module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('path', 'to', 'ignored', 'index.js'),
				'external',
				['browser'],
				log
			)
		).toBe(false);
	});

	it('works for local module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/ignored/module',
				['browser'],
				log
			)
		).toBe(false);
	});

	it('works for local file', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('index.js'),
				'./path/to/ignored/file.js',
				['browser'],
				log
			)
		).toBe(false);
	});
});

describe('when collision for external, module and file exists', () => {
	it('resolves external to external', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('path', 'to', 'colliding', 'index.js'),
				'module',
				['browser'],
				log
			)
		).toBe('package-shim');
	});

	it('resolves module to module', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('path', 'to', 'colliding', 'index.js'),
				'./module',
				['browser'],
				log
			)
		).toBe('./module-shim.js');
	});

	it('resolves file to file', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('path', 'to', 'colliding', 'index.js'),
				'./module.js',
				['browser'],
				log
			)
		).toBe('./file-shim.js');
	});
});

describe('when collision between parent and child exists', () => {
	it('resolves to parent in parent', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('path', 'to', 'overriden', 'index.js'),
				'./child/module',
				['browser'],
				log
			)
		).toBe('./parent-shim.js');
	});

	it('resolves to child in child', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join(
					'path',
					'to',
					'overriden',
					'child',
					'index.js'
				),
				'./module',
				['browser'],
				log
			)
		).toBe('./child-shim.js');
	});

	it('resolves to child in grandpa', () => {
		expect(
			resolve(
				fixturesDir,
				fixturesDir.join('path', 'to', 'index.js'),
				'./overriden/child/module',
				['browser'],
				log
			)
		).toBe('./overriden/child/child-shim.js');
	});
});

// TODO: collisions between module/external aliases and real files

// TODO: que pasa si un padre del require define un ../algo del required que esta en otra rama
