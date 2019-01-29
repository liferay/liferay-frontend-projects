import fs from 'fs';
import path from 'path';

import Loader from '../loader';
import Config from '../config.js';

describe('Loader', function() {
	let config;
	let loader;
	let fetchResponse;

	beforeEach(function() {
		config = new Config();

		fetchResponse = undefined;

		global.fetch = param => {
			if (!fetchResponse) {
				const modulesParam = decodeURIComponent(
					param.replace(`${config.resolvePath}?modules=`, '')
				);

				const moduleNames = decodeURIComponent(modulesParam).split(',');

				fetchResponse = {
					resolvedModules: moduleNames,
					moduleMap: {},
					configMap: {},
					pathMap: {},
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
					} catch (err) {
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

	it('should fail after a require timeout', done => {
		config._config.waitTimeout = 100;

		loader.require('missing-module', jest.fn(), err => {
			expect(err).toHaveProperty('modules');
			done();
		});
	});

	it('should implement local require', done => {
		fetchResponse = {
			resolvedModules: ['local-require/a', 'local-require/sync'],
			moduleMap: {},
			configMap: {},
			pathMap: {},
		};

		loader.require('local-require/sync', module => {
			expect(module).toBe('a');
			done();
		});
	});

	it('should implement localRequire.toUrl', done => {
		loader.require(['local-require/to-url'], module => {
			expect(module).toBe('/local-require/to-url.js');
			done();
		});
	});

	it('should support relative paths in local require', done => {
		fetchResponse = {
			resolvedModules: ['local-require/a', 'local-require/rel-path'],
			moduleMap: {},
			configMap: {},
			pathMap: {},
		};

		loader.require(['local-require/rel-path'], module => {
			expect(module).toBe('a');
			done();
		});
	});

	it.only('should fail when local require is called with an undeclared module', done => {
		loader.require(['local-require/failure'], jest.fn(), err => {
			expect(err).toBeDefined();
			done();
		});
	});

	it('should work correctly when a module exports `false`', done => {
		loader.require('export-false', module => {
			expect(module).toBe(false);
			done();
		});
	});

	it('should work correctly when a module exports `null`', done => {
		loader.require('export-null', module => {
			expect(module).toBeNull();
			done();
		});
	});

	it('should work correctly when a module exports `undefined`', done => {
		loader.require('export-undefined', module => {
			expect(module).toBeUndefined();
			done();
		});
	});

	it('localRequire should not mix contexts (issue 140)', done => {
		fetchResponse = {
			resolvedModules: ['issue-140/a', 'issue-140/m1', 'issue-140/m2/m2'],
			moduleMap: {
				'issue-140/m1': {
					'mapped-issue-140/a': 'issue-140/a',
				},
			},
			configMap: {},
			pathMap: {},
		};

		loader.require('issue-140/m2/m2', m2 => {
			const result = m2();

			expect(result.standard).toBe('standard:a');
			expect(result.local).toBe('local:a');
			expect(result.mapped).toBe('mapped:a');

			done();
		});
	});
});
