/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';

import Config from '../../src/loader/config';
import Loader from '../../src/loader/loader';

describe('Loader', () => {
	let config;
	let loader;
	let fetchResponse;

	beforeEach(() => {
		jest.setTimeout(200);

		config = new Config();

		fetchResponse = undefined;

		global.fetch = (param) => {
			if (!fetchResponse) {
				const modulesParam = decodeURIComponent(
					param.replace(`${config.resolvePath}?modules=`, '')
				);

				const moduleNames = decodeURIComponent(modulesParam).split(',');

				fetchResponse = {
					configMap: {},
					moduleMap: {},
					pathMap: {},
					resolvedModules: moduleNames,
				};
			}

			return Promise.resolve({
				text: () => Promise.resolve(JSON.stringify(fetchResponse)),
			});
		};

		const document = {
			createElement: () => {
				const script = {};

				setTimeout(() => {
					try {
						/* eslint-disable-next-line no-eval */
						eval(
							fs
								.readFileSync(
									path.join(
										__dirname,
										'__fixtures__',
										'loader',
										script.src
									)
								)
								.toString()
						);

						script['onload'].apply(script);
					}
					catch (err) {
						script['onerror'].apply(script);
					}
				}, 1);

				return script;
			},
			head: {
				appendChild: () => {},
			},
		};

		global.Loader = loader = new Loader(config, document);
	});

	describe('require can be called with different signatures', () => {
		const noop = () => {};

		it('array, function, function', (done) => {
			loader.require(['say-hello'], () => done(), noop);
		});

		it('...string, function, function', (done) => {
			loader.require('say-hello', 'say-goodbye', () => done(), noop);
		});

		it('string, function, function', (done) => {
			loader.require('say-hello', () => done(), noop);
		});

		it('array, function, null', (done) => {
			loader.require(['say-hello'], () => done(), null);
		});

		it('...string, function, null', (done) => {
			loader.require('say-hello', 'say-goodbye', () => done(), null);
		});

		it('string, function, null', (done) => {
			loader.require('say-hello', () => done(), null);
		});

		it('array, function', (done) => {
			loader.require(['say-hello'], () => done());
		});

		it('...string, function', (done) => {
			loader.require('say-hello', 'say-goodbye', () => done());
		});

		it('string, function', (done) => {
			loader.require('say-hello', () => done());
		});
	});

	it('fails after a require timeout', (done) => {
		config._config.waitTimeout = 100;

		loader.require('missing-module', jest.fn(), (err) => {
			expect(err).toHaveProperty('modules');
			done();
		});
	});

	it('implements local require', (done) => {
		fetchResponse = {
			configMap: {},
			moduleMap: {},
			pathMap: {},
			resolvedModules: ['local-require/a', 'local-require/sync'],
		};

		loader.require('local-require/sync', (module) => {
			expect(module).toBe('a');
			done();
		});
	});

	it('implements localRequire.toUrl', (done) => {
		loader.require(['local-require/to-url'], (module) => {
			expect(module).toBe('/local-require/to-url.js');
			done();
		});
	});

	it('supports relative paths in local require', (done) => {
		fetchResponse = {
			configMap: {},
			moduleMap: {
				'local-require/rel-path': {
					'./a': 'local-require/a',
				},
			},
			pathMap: {},
			resolvedModules: ['local-require/a', 'local-require/rel-path'],
		};

		loader.require(['local-require/rel-path'], (module) => {
			expect(module).toBe('a');
			done();
		});
	});

	it('fails when local require is called with an undeclared module', (done) => {
		loader.require(['local-require/failure'], jest.fn(), (err) => {
			expect(err).toBeDefined();
			done();
		});
	});

	it('works correctly when a module exports `false`', (done) => {
		loader.require('export-false', (module) => {
			expect(module).toBe(false);
			done();
		});
	});

	it('works correctly when a module exports `null`', (done) => {
		loader.require('export-null', (module) => {
			expect(module).toBeNull();
			done();
		});
	});

	it('works correctly when a module exports `undefined`', (done) => {
		loader.require('export-undefined', (module) => {
			expect(module).toBeUndefined();
			done();
		});
	});

	it('localRequire should not mix contexts (issue 140)', (done) => {
		fetchResponse = {
			configMap: {},
			moduleMap: {
				'issue-140/m1': {
					'./a': 'issue-140/a',
					'mapped-issue-140/a': 'issue-140/a',
				},
			},
			pathMap: {},
			resolvedModules: ['issue-140/a', 'issue-140/m1', 'issue-140/m2/m2'],
		};

		loader.require('issue-140/m2/m2', (m2) => {
			const result = m2();

			expect(result.standard).toBe('standard:a');
			expect(result.local).toBe('local:a');
			expect(result.mapped).toBe('mapped:a');

			done();
		});
	});
});
