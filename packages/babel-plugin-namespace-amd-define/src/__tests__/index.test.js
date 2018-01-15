import * as babel from 'babel-core';
import plugin from '../index';

it('namespaces unqualified define calls', () => {
	const source = `
	define([], function(){})
	`;

	const {code} = babel.transform(source, {
		plugins: [plugin],
	});

	expect(code).toMatchSnapshot();
});

it('does not namespace already qualified define calls', () => {
	const source = `
	Other.Namespace.define([], function(){})
	`;

	const {code} = babel.transform(source, {
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
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});
});
