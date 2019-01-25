import cfg from './fixture/config.js';
import Config from '../config';

describe('Config', function() {
	it(
		'should create an instance of Config without existing ' + 'data',
		function() {
			const config = new Config();

			let modules = config.getModules();
			let conditionalModules = config.getModules();

			expect(Object.keys(modules)).toHaveLength(0);
			expect(Object.keys(conditionalModules)).toHaveLength(0);
		}
	);

	it('should add new module', function() {
		const config = new Config(cfg);

		let addedModule = config.addModule({
			name: 'aui-test1',
			dependencies: ['aui-base', 'aui-core'],
			path: 'aui-test1.js',
		});

		let modules = config.getModules();

		expect(modules['aui-test1']).toBeDefined();
		expect(modules['aui-test1']).toBe(addedModule);
	});

	it('should overwrite the properties of an existing module', function() {
		const config = new Config(cfg);

		config.addModule({
			name: 'aui-test1',
			dependencies: ['aui-base', 'aui-core'],
			path: 'aui-test1.js',
			testMapk: true,
		});

		config.addModule({
			name: 'aui-test1',
			dependencies: ['aui-base', 'aui-core'],
		});

		let modules = config.getModules();

		let moduleDefinition = modules['aui-test1'];

		expect(moduleDefinition.testMapk).toBe(true);
		expect(moduleDefinition.path).toBe('aui-test1.js');
	});

	it('should add conditional module', function() {
		const config = new Config();

		config.addModule({
			name: 'aui-chema-test2',
			dependencies: ['aui-base', 'aui-core'],
			path: 'aui-chema-test2.js',
			condition: {
				trigger: 'aui-nate',
				test: function() {
					return true;
				},
			},
		});

		let modules = config.getConditionalModules();

		expect(
			modules['aui-nate'].indexOf('aui-chema-test2')
		).toBeGreaterThanOrEqual(0);
	});

	it('should map a module to its alias', function() {
		const config = new Config();

		config.addModule({
			name: 'liferay@1.0.0',
		});

		config._config = {
			maps: {
				liferay: 'liferay@1.0.0',
			},
		};

		let mappedModule = config.mapModule('liferay');

		expect(mappedModule).toBe('liferay@1.0.0');
	});

	it('should respect "exactMatch" mappings', function() {
		const config = new Config();

		config.addModule({
			name: 'liferay@1.0.0/index',
		});

		config._config = {
			maps: {
				'liferay@1.0.0': {
					value: 'liferay@1.0.0/index',
					exactMatch: true,
				},
			},
		};

		let mappedModule = config.mapModule('liferay@1.0.0');

		expect(mappedModule).toBe('liferay@1.0.0/index');

		mappedModule = config.mapModule('liferay@1.0.0/index');

		expect(mappedModule).toBe('liferay@1.0.0/index');
	});

	it('should map an array of modules to their aliases', function() {
		const config = new Config();

		config.addModule({
			name: 'liferay@1.0.0',
		});

		config.addModule({
			name: 'liferay@2.0.0',
		});

		config._config = {
			maps: {
				liferay: 'liferay@1.0.0',
				liferay2: 'liferay@2.0.0',
			},
		};

		let mappedModule = config.mapModule(['liferay', 'liferay2']);

		expect(mappedModule).toEqual(['liferay@1.0.0', 'liferay@2.0.0']);
	});

	it('should map a module via a mapping function', function() {
		const config = new Config();

		config._config = {
			maps: {
				'*': function(name) {
					return name + 'test';
				},
			},
		};

		let mappedModule = config.mapModule(['liferay', 'liferay2']);

		expect(mappedModule).toEqual(['liferaytest', 'liferay2test']);
	});

	it(
		'should ignore a mapping function if a more specific module mapping ' +
			'exists',
		function() {
			const config = new Config();

			config._config = {
				maps: {
					'liferay': 'liferay@1.0.0',
					'*': function(name) {
						return name + 'test';
					},
				},
			};

			let mappedModule = config.mapModule(['liferay', 'liferay2']);

			expect(mappedModule).toEqual(['liferay@1.0.0', 'liferay2test']);
		}
	);

	it('should apply exactMatches first', function() {
		const config = new Config();

		config._config = {
			maps: {
				'liferay': 'liferay@2.0.0',
				'liferay/index': {
					value: 'liferay@1.0.0/index',
					exactMatch: true,
				},
			},
		};

		let mappedModule = config.mapModule('liferay/index');

		expect(mappedModule).toBe('liferay@1.0.0/index');

		mappedModule = config.mapModule('liferay/main');

		expect(mappedModule).toBe('liferay@2.0.0/main');

		mappedModule = config.mapModule('liferay');

		expect(mappedModule).toBe('liferay@2.0.0');

		mappedModule = config.mapModule('liferayX');

		expect(mappedModule).toBe('liferayX');
	});

	it('should stop replacement for exact identity matches', function() {
		const config = new Config();

		config._config = {
			maps: {
				'liferay': 'this-should-not-be-applied',
				'liferay/index': {value: 'liferay/index', exactMatch: true},
			},
		};

		let mappedModule = config.mapModule('liferay/index');

		expect(mappedModule).toBe('liferay/index');
	});

	it('should map local modules correctly', function() {
		const config = new Config();

		let contextMap = {
			isarray: 'isarray@1.0.0',
		};

		config.addModule({
			name: 'isobject@2.1.0/index',
			dependencies: ['module', 'require', 'isarray', 'isarray/index'],
			map: contextMap,
		});

		let mappedModule = config.mapModule('isarray', contextMap);

		expect(mappedModule).toBe('isarray@1.0.0');

		mappedModule = config.mapModule('isarray/index', contextMap);

		expect(mappedModule).toBe('isarray@1.0.0/index');
	});
});
