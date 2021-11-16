/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Config from '../../src/loader/config';
import ScriptLoader from '../../src/loader/script-loader';

describe('ScriptLoader', () => {
	let document;

	beforeEach(() => {
		document = {
			createElement: () => {
				const script = {};

				document.scripts.push(script);

				setTimeout(() => {
					script[document.eventHandler].apply(script);
				}, 100);

				return script;
			},
			eventHandler: 'onload',
			head: {
				appendChild: () => {},
			},
			scripts: [],
		};
	});

	it('inserts synchronous DOM script nodes', (done) => {
		const config = new Config({combine: false, url: 'http://localhost'});

		const scriptLoader = new ScriptLoader(document, config);

		config.addModule('a@1.0.0');

		// eslint-disable-next-line promise/catch-or-return
		scriptLoader.loadModules(['a@1.0.0']).then(() => {
			expect(document.scripts).toHaveLength(1);

			expect(document.scripts[0]).toMatchObject({
				async: false,
			});

			done();
		});
	});

	it('works without combine flag', (done) => {
		const config = new Config({combine: false, url: 'http://localhost'});

		const scriptLoader = new ScriptLoader(document, config);

		const moduleNames = ['a@1.0.0', 'b@1.2.0'];

		moduleNames.forEach((moduleName) => config.addModule(moduleName));

		// eslint-disable-next-line promise/catch-or-return
		scriptLoader.loadModules(moduleNames).then(() => {
			expect(document.scripts).toHaveLength(2);

			expect(document.scripts[0]).toMatchObject({
				async: false,
				src: 'http://localhost/a@1.0.0.js',
			});
			expect(document.scripts[1]).toMatchObject({
				async: false,
				src: 'http://localhost/b@1.2.0.js',
			});

			done();
		});
	});

	it('works with combine flag', (done) => {
		const config = new Config({combine: true, url: 'http://localhost'});

		const scriptLoader = new ScriptLoader(document, config);

		const moduleNames = ['a@1.0.0', 'b@1.2.0'];

		moduleNames.forEach((moduleName) => config.addModule(moduleName));

		// eslint-disable-next-line promise/catch-or-return
		scriptLoader.loadModules(moduleNames).then(() => {
			expect(document.scripts).toHaveLength(1);

			expect(document.scripts[0]).toMatchObject({
				async: false,
				src: 'http://localhost/a@1.0.0.js&/b@1.2.0.js',
			});

			done();
		});
	});

	it('rejects on error', (done) => {
		const config = new Config({combine: true, url: 'http://localhost'});

		const scriptLoader = new ScriptLoader(document, config);

		const moduleNames = ['a@1.0.0', 'b@1.2.0'];

		moduleNames.forEach((moduleName) => config.addModule(moduleName));

		document.eventHandler = 'onerror';

		scriptLoader.loadModules(moduleNames).catch((error) => {
			expect(error.url).toBe('http://localhost/a@1.0.0.js&/b@1.2.0.js');
			expect(error.modules).toEqual(moduleNames);
			expect(error.script).toBe(document.scripts[0]);

			done();
		});
	});
});
