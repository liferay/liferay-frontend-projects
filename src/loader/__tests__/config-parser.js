import config from './fixture/config.js';
import ConfigParser from '../config-parser';

describe('ConfigParser', function() {
	it(
		'should create an instance of ConfigParser without existing ' + 'data',
		function() {
			const configParser = new ConfigParser();

			let modules = configParser.getModules();
			let conditionalModules = configParser.getModules();

			expect(Object.keys(modules)).toHaveLength(0);
			expect(Object.keys(conditionalModules)).toHaveLength(0);
		}
	);

	it('should add new module', function() {
		const configParser = new ConfigParser(config);

		let addedModule = configParser.addModule({
			name: 'aui-test1',
			dependencies: ['aui-base', 'aui-core'],
			path: 'aui-test1.js',
		});

		let modules = configParser.getModules();

		expect(modules['aui-test1']).toBeDefined();
		expect(modules['aui-test1']).toBe(addedModule);
	});

	it('should overwrite the properties of an existing module', function() {
		const configParser = new ConfigParser(config);

		configParser.addModule({
			name: 'aui-test1',
			dependencies: ['aui-base', 'aui-core'],
			path: 'aui-test1.js',
			testMapk: true,
		});

		configParser.addModule({
			name: 'aui-test1',
			dependencies: ['aui-base', 'aui-core'],
		});

		let modules = configParser.getModules();

		let moduleDefinition = modules['aui-test1'];

		expect(moduleDefinition.testMapk).toBe(true);
		expect(moduleDefinition.path).toBe('aui-test1.js');
	});

	it('should add conditional module', function() {
		const configParser = new ConfigParser();

		configParser.addModule({
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

		let modules = configParser.getConditionalModules();

		expect(
			modules['aui-nate'].indexOf('aui-chema-test2')
		).toBeGreaterThanOrEqual(0);
	});

	it('should map a module to its alias', function() {
		const configParser = new ConfigParser();

		configParser.addModule({
			name: 'liferay@1.0.0',
		});

		configParser._config = {
			maps: {
				liferay: 'liferay@1.0.0',
			},
		};

		let mappedModule = configParser.mapModule('liferay');

		expect(mappedModule).toBe('liferay@1.0.0');
	});

	it('should respect "exactMatch" mappings', function() {
		const configParser = new ConfigParser();

		configParser.addModule({
			name: 'liferay@1.0.0/index',
		});

		configParser._config = {
			maps: {
				'liferay@1.0.0': {
					value: 'liferay@1.0.0/index',
					exactMatch: true,
				},
			},
		};

		let mappedModule = configParser.mapModule('liferay@1.0.0');

		expect(mappedModule).toBe('liferay@1.0.0/index');

		mappedModule = configParser.mapModule('liferay@1.0.0/index');

		expect(mappedModule).toBe('liferay@1.0.0/index');
	});

	it('should map an array of modules to their aliases', function() {
		const configParser = new ConfigParser();

		configParser.addModule({
			name: 'liferay@1.0.0',
		});

		configParser.addModule({
			name: 'liferay@2.0.0',
		});

		configParser._config = {
			maps: {
				liferay: 'liferay@1.0.0',
				liferay2: 'liferay@2.0.0',
			},
		};

		let mappedModule = configParser.mapModule(['liferay', 'liferay2']);

		expect(mappedModule).toEqual(['liferay@1.0.0', 'liferay@2.0.0']);
	});

	it('should map a module via a mapping function', function() {
		const configParser = new ConfigParser();

		configParser._config = {
			maps: {
				'*': function(name) {
					return name + 'test';
				},
			},
		};

		let mappedModule = configParser.mapModule(['liferay', 'liferay2']);

		expect(mappedModule).toEqual(['liferaytest', 'liferay2test']);
	});

	it(
		'should ignore a mapping function if a more specific module mapping ' +
			'exists',
		function() {
			const configParser = new ConfigParser();

			configParser._config = {
				maps: {
					'liferay': 'liferay@1.0.0',
					'*': function(name) {
						return name + 'test';
					},
				},
			};

			let mappedModule = configParser.mapModule(['liferay', 'liferay2']);

			expect(mappedModule).toEqual(['liferay@1.0.0', 'liferay2test']);
		}
	);

	it('should apply exactMatches first', function() {
		const configParser = new ConfigParser();

		configParser._config = {
			maps: {
				'liferay': 'liferay@2.0.0',
				'liferay/index': {
					value: 'liferay@1.0.0/index',
					exactMatch: true,
				},
			},
		};

		let mappedModule = configParser.mapModule('liferay/index');

		expect(mappedModule).toBe('liferay@1.0.0/index');

		mappedModule = configParser.mapModule('liferay/main');

		expect(mappedModule).toBe('liferay@2.0.0/main');

		mappedModule = configParser.mapModule('liferay');

		expect(mappedModule).toBe('liferay@2.0.0');

		mappedModule = configParser.mapModule('liferayX');

		expect(mappedModule).toBe('liferayX');
	});

	it('should stop replacement for exact identity matches', function() {
		const configParser = new ConfigParser();

		configParser._config = {
			maps: {
				'liferay': 'this-should-not-be-applied',
				'liferay/index': {value: 'liferay/index', exactMatch: true},
			},
		};

		let mappedModule = configParser.mapModule('liferay/index');

		expect(mappedModule).toBe('liferay/index');
	});

	it('should map local modules correctly', function() {
		const configParser = new ConfigParser();

		let contextMap = {
			isarray: 'isarray@1.0.0',
		};

		configParser.addModule({
			name: 'isobject@2.1.0/index',
			dependencies: ['module', 'require', 'isarray', 'isarray/index'],
			map: contextMap,
		});

		let mappedModule = configParser.mapModule('isarray', contextMap);

		expect(mappedModule).toBe('isarray@1.0.0');

		mappedModule = configParser.mapModule('isarray/index', contextMap);

		expect(mappedModule).toBe('isarray@1.0.0/index');
	});
});
