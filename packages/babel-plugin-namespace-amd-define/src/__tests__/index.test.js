import * as babel from 'babel-core';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import plugin from '../index';

let logger;

beforeEach(() => {
	PluginLogger.set(__filename, (logger = new PluginLogger()));
});

it('logs results correctly', () => {
	const source = `
	define([], function(){})
	if (typeof define === "function" && define.amd) {
		console.log('UMD!');
	}
	`;

	babel.transform(source, {
		filenameRelative: __filename,
		plugins: [plugin],
	});

	expect(logger.messages).toMatchSnapshot();
});

it('namespaces unqualified define calls', () => {
	const source = `
	define([], function(){})
	`;

	const {code} = babel.transform(source, {
		filenameRelative: __filename,
		plugins: [plugin],
	});

	expect(code).toMatchSnapshot();
});

it('does not namespace already qualified define calls', () => {
	const source = `
	Other.Namespace.define([], function(){})
	`;

	const {code} = babel.transform(source, {
		filenameRelative: __filename,
		plugins: [plugin],
	});

	expect(code).toMatchSnapshot();
});

it('namespaces references to global define identifier', () => {
	const source = `
	if (typeof define === "function" && define.amd) {
		console.log('UMD!');
	}
	`;

	const {code} = babel.transform(source, {
		filenameRelative: __filename,
		plugins: [plugin],
	});

	expect(code).toMatchSnapshot();
});

describe('does not namespace references to local define identifier', () => {
	it('when it is a variable', () => {
		const source = `
		let define = 'x';

		if(true) {
			if(true) {
				console.log(define);
			}
	    }
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('when it is a function parameter', () => {
		const source = `
		function fn(define) {
			console.log(define);
		};
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('when it is a function', () => {
		const source = `
		function define(x) {
			console.log(define);
		}
		`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('when it is an object field', () => {
		const source = `
			var a = {
				define: function(name, value) {
					return name;
				}
			}
			`;

		const {code} = babel.transform(source, {
			filenameRelative: __filename,
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});
});
