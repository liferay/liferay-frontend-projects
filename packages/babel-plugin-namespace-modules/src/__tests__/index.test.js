import * as babel from 'babel-core';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import plugin from '../index';

const imports = {
	provider: {
		'imp-module': '^1.0.0',
	},
};

describe('when called from Babel', () => {
	it('correctly namespaces require modules', () => {
		const source = `
			define(function(){
				require('a-module');
				require('imp-module');
				require('./a-local-module');
				require('fs');
			})
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [[plugin, {imports}]],
		});

		expect(code).toMatchSnapshot();
	});

	it('correctly namespaces define() dependencies', () => {
		const source = `
			define(
				['a-module', 'imp-module', './a-local-module', 'fs'], 
				function(){
				}
			)
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [[plugin, {imports}]],
		});

		expect(code).toMatchSnapshot();
	});

	it('does not namespace define() module name', () => {
		const source = `
			define('a-module', function(){
			})
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [[plugin, {imports}]],
		});

		expect(code).toMatchSnapshot();
	});

	it('correctly namespaces all together', () => {
		const source = `
			define(
				'a-module', 
				['a-module', 'imp-module', './a-local-module', 'fs'], 
				function(){
					require('a-module');
					require('imp-module');
					require('./a-local-module');
					require('fs');
				}
			)
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [[plugin, {imports}]],
		});

		expect(code).toMatchSnapshot();
	});
});

describe('when called from liferay-npm-bundler', () => {
	let logger;

	beforeEach(() => {
		babelIpc.set(__filename, {
			log: (logger = new PluginLogger()),
			rootPkgJson: require('./root-package.json'),
			globalConfig: {imports},
		});
	});

	it('correctly namespaces require modules', () => {
		const source = `
			define(function(){
				require('a-module');
				require('imp-module');
				require('./a-local-module');
				require('fs');
			})
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('correctly namespaces define() dependencies', () => {
		const source = `
			define(
				['a-module', 'imp-module', './a-local-module', 'fs'], 
				function(){
				}
			)
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('correctly namespaces define() module name', () => {
		const source = `
			define('a-module', function(){
			})
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('does not namespace define() module name in the root package', () => {
		const source = `
			define('a-module', function(){
			})
		`;

		// Make the plugin think that it is processing the root package
		babelIpc.set(__filename, {
			rootPkgJson: require('./package.json'),
			globalConfig: {imports},
		});

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('correctly namespaces all together', () => {
		const source = `
			define(
				'a-module', 
				['a-module', 'imp-module', './a-local-module', 'fs'], 
				function(){
					require('a-module');
					require('imp-module');
					require('./a-local-module');
					require('fs');
				}
			)
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('logs results correctly', () => {
		const source = `
			define(
				'a-module', 
				['a-module', 'imp-module', './a-local-module', 'fs'], 
				function(){
					require('a-module');
					require('imp-module');
					require('./a-local-module');
					require('fs');
				}
			)
		`;

		babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(logger.messages).toMatchSnapshot();
	});
});
