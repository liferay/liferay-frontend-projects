import Config from '../config';
import ScriptLoader from '../script-loader';

describe('ScriptLoader', () => {
	let document;

	beforeEach(() => {
		document = {
			eventHandler: 'onload',
			scripts: [],
			createElement: () => {
				const script = {};

				document.scripts.push(script);

				setTimeout(() => {
					script[document.eventHandler].apply(script);
				}, 100);

				return script;
			},
			head: {
				appendChild: () => {},
			},
		};
	});

	it('should insert synchronous DOM script nodes', function(done) {
		const config = new Config({combine: false, url: 'http://localhost'});
		const scriptLoader = new ScriptLoader(document, config);

		config.addModule('a@1.0.0');

		scriptLoader.loadModules(['a@1.0.0']).then(() => {
			expect(document.scripts).toHaveLength(1);

			expect(document.scripts[0]).toMatchObject({
				async: false,
			});

			done();
		});
	});

	it('should work without combine flag', done => {
		const config = new Config({combine: false, url: 'http://localhost'});
		const scriptLoader = new ScriptLoader(document, config);

		const moduleNames = ['a@1.0.0', 'b@1.2.0'];

		moduleNames.forEach(moduleName => config.addModule(moduleName));

		scriptLoader.loadModules(moduleNames).then(() => {
			expect(document.scripts).toHaveLength(2);

			expect(document.scripts[0]).toMatchObject({
				src: 'http://localhost/a@1.0.0.js',
				async: false,
			});
			expect(document.scripts[1]).toMatchObject({
				src: 'http://localhost/b@1.2.0.js',
				async: false,
			});

			done();
		});
	});

	it('should work with combine flag', done => {
		const config = new Config({combine: true, url: 'http://localhost'});
		const scriptLoader = new ScriptLoader(document, config);

		const moduleNames = ['a@1.0.0', 'b@1.2.0'];

		moduleNames.forEach(moduleName => config.addModule(moduleName));

		scriptLoader.loadModules(moduleNames).then(() => {
			expect(document.scripts).toHaveLength(1);

			expect(document.scripts[0]).toMatchObject({
				src: 'http://localhost/a@1.0.0.js&/b@1.2.0.js',
				async: false,
			});

			done();
		});
	});

	it('should reject on error', done => {
		const config = new Config({combine: true, url: 'http://localhost'});
		const scriptLoader = new ScriptLoader(document, config);

		const moduleNames = ['a@1.0.0', 'b@1.2.0'];

		moduleNames.forEach(moduleName => config.addModule(moduleName));

		document.eventHandler = 'onerror';

		scriptLoader.loadModules(moduleNames).catch(err => {
			expect(err.url).toBe('http://localhost/a@1.0.0.js&/b@1.2.0.js');
			expect(err.modules).toEqual(moduleNames);
			expect(err.script).toBe(document.scripts[0]);

			done();
		});
	});
});
