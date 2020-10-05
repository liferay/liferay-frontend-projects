/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

import {Visitor} from '../index';

const fixturesDir = new FilePath(path.join(__dirname, '__fixtures__'));

let log: PluginLogger;
let visitor: Visitor;

beforeEach(() => {
	const state = {
		file: {
			opts: {
				filename: fixturesDir.join('index.js').asNative,
			},
		},
		opts: {},
	};

	babelIpc.set(state.file.opts.filename, {
		globalConfig: {},
		log: log = new PluginLogger(),
	});

	visitor = new Visitor(state);
});

describe('for absolute paths', () => {
	it('returns undefined', () => {
		expect(visitor._resolve('/absolute/path/to/module')).toBeUndefined();
	});

	it('logs an error', () => {
		visitor._resolve('/absolute/path/to/module');

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
		expect(visitor._resolve('path/to/unaliased/external/module')).toEqual(
			'path/to/unaliased/external/module'
		);
	});

	it('resolves local module', () => {
		expect(visitor._resolve('./path/to/unaliased/module')).toEqual(
			'./path/to/unaliased/module'
		);
	});

	it('resolves local file', () => {
		expect(visitor._resolve('./path/to/unaliased/module.js')).toEqual(
			'./path/to/unaliased/module.js'
		);
	});
});

describe('when aliased in the same folder', () => {
	it('resolves local module required as module', () => {
		expect(visitor._resolve('./path/to/in/folder/aliased/module')).toEqual(
			'./path/to/in/folder/aliased/module-shim.js'
		);
	});

	it('does not resolve local module required as file', () => {
		expect(
			visitor._resolve('./path/to/in/folder/aliased/module.js')
		).toEqual('./path/to/in/folder/aliased/module.js');
	});

	it('resolves local file required as module', () => {
		expect(visitor._resolve('./path/to/in/folder/aliased/file')).toEqual(
			'./path/to/in/folder/aliased/file-shim.js'
		);
	});

	it('resolves local file required as file', () => {
		expect(visitor._resolve('./path/to/in/folder/aliased/file.js')).toEqual(
			'./path/to/in/folder/aliased/file-shim.js'
		);
	});

	it('resolves external module', () => {
		const state = {
			file: {
				opts: {
					filename: fixturesDir.join(
						'path',
						'to',
						'in',
						'folder',
						'aliased',
						'index.js'
					).asNative,
				},
			},
			opts: {},
		};

		babelIpc.set(state.file.opts.filename, {
			globalConfig: {},
			log: new PluginLogger(),
		});

		const visitor = new Visitor(state);

		expect(visitor._resolve('external/module')).toEqual('a-shim-package');
	});
});

describe('when aliased in a parent folder', () => {
	it('resolves local module required as module', () => {
		expect(visitor._resolve('./path/to/in/parent/aliased/module')).toEqual(
			'./path/to/in/parent/module-shim.js'
		);
	});

	it('does not resolve local module required as file', () => {
		expect(
			visitor._resolve('./path/to/in/parent/aliased/module.js')
		).toEqual('./path/to/in/parent/aliased/module.js');
	});

	it('resolves local file required as module', () => {
		expect(visitor._resolve('./path/to/in/parent/aliased/file')).toEqual(
			'./path/to/in/parent/file-shim.js'
		);
	});

	it('resolves local file required as file', () => {
		expect(visitor._resolve('./path/to/in/parent/aliased/file.js')).toEqual(
			'./path/to/in/parent/file-shim.js'
		);
	});

	it('resolves external module', () => {
		const state = {
			file: {
				opts: {
					filename: fixturesDir.join(
						'path',
						'to',
						'in',
						'parent',
						'aliased',
						'index.js'
					).asNative,
				},
			},
			opts: {},
		};

		babelIpc.set(state.file.opts.filename, {
			globalConfig: {},
			log: new PluginLogger(),
		});

		const visitor = new Visitor(state);

		expect(visitor._resolve('external/module')).toEqual('a-shim-package');
	});
});

describe('when aliased as `false`', () => {
	it('works for local module', () => {
		expect(visitor._resolve('./path/to/ignored/module')).toBe(false);
	});

	it('works for local file', () => {
		expect(visitor._resolve('./path/to/ignored/file.js')).toBe(false);
	});

	it('works for external module', () => {
		const state = {
			file: {
				opts: {
					filename: fixturesDir.join(
						'path',
						'to',
						'ignored',
						'index.js'
					).asNative,
				},
			},
			opts: {},
		};

		babelIpc.set(state.file.opts.filename, {
			globalConfig: {},
			log: new PluginLogger(),
		});

		const visitor = new Visitor(state);

		expect(visitor._resolve('external')).toBe(false);
	});
});

describe('when collision for external, module and file exists', () => {
	let visitor: Visitor;

	beforeEach(() => {
		const state = {
			file: {
				opts: {
					filename: fixturesDir.join(
						'path',
						'to',
						'colliding',
						'index.js'
					).asNative,
				},
			},
			opts: {},
		};

		babelIpc.set(state.file.opts.filename, {
			globalConfig: {},
			log: new PluginLogger(),
		});

		visitor = new Visitor(state);
	});

	it('resolves external to external', () => {
		expect(visitor._resolve('module')).toBe('package-shim');
	});

	it('resolves module to module', () => {
		expect(visitor._resolve('./module')).toBe('./module-shim.js');
	});

	it('resolves file to file', () => {
		expect(visitor._resolve('./module.js')).toBe('./file-shim.js');
	});
});

describe('when collision between parent and child exists', () => {
	it('resolves to parent in parent', () => {
		const state = {
			file: {
				opts: {
					filename: fixturesDir.join(
						'path',
						'to',
						'overriden',
						'index.js'
					).asNative,
				},
			},
			opts: {},
		};

		babelIpc.set(state.file.opts.filename, {
			globalConfig: {},
			log: new PluginLogger(),
		});

		const visitor = new Visitor(state);

		expect(visitor._resolve('./child/module')).toBe('./parent-shim.js');
	});

	it('resolves to child in child', () => {
		const state = {
			file: {
				opts: {
					filename: fixturesDir.join(
						'path',
						'to',
						'overriden',
						'child',
						'index.js'
					).asNative,
				},
			},
			opts: {},
		};

		babelIpc.set(state.file.opts.filename, {
			globalConfig: {},
			log: new PluginLogger(),
		});

		const visitor = new Visitor(state);

		expect(visitor._resolve('./module')).toBe('./child-shim.js');
	});

	it('resolves to child in grandpa', () => {
		const state = {
			file: {
				opts: {
					filename: fixturesDir.join('path', 'to', 'index.js')
						.asNative,
				},
			},
			opts: {},
		};

		babelIpc.set(state.file.opts.filename, {
			globalConfig: {},
			log: new PluginLogger(),
		});

		const visitor = new Visitor(state);

		expect(visitor._resolve('./overriden/child/module')).toBe(
			'./overriden/child/child-shim.js'
		);
	});
});
