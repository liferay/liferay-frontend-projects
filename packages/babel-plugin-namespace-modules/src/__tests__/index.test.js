import * as babel from 'babel-core';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import plugin from '../index';

describe('when called from babel', () => {
	it('correctly namespaces require modules', () => {
		const source = `
			define(function(){
				require('a-module');
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
			define(['a-module', './a-local-module', 'fs'], function(){
			})
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('does not namespaces define() module name', () => {
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

	it('correctly namespaces all together', () => {
		const source = `
			define('a-module', ['a-module', './a-local-module', 'fs'], function(){
				require('a-module');
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
});

describe('when called from liferay-npm-bundler', () => {
	let logger;

	beforeEach(() => {
		PluginLogger.set(__filename, (logger = new PluginLogger()));
		babelIpc.set(__filename, {rootPkgJson: require('./package.json')});
	});

	afterEach(() => {
		PluginLogger.delete(__filename);
	});

	it('correctly namespaces require modules', () => {
		const source = `
			define(function(){
				require('a-module');
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
			define(['a-module', './a-local-module', 'fs'], function(){
			})
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

	it('correctly namespaces all together', () => {
		const source = `
			define('a-module', ['a-module', './a-local-module', 'fs'], function(){
				require('a-module');
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

	it('logs results correctly', () => {
		const source = `
			define('a-module', ['a-module', './a-local-module', 'fs'], function(){
				require('a-module');
				require('./a-local-module');
				require('fs');
			})
		`;

		babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(logger.messages).toMatchSnapshot();
	});
});
