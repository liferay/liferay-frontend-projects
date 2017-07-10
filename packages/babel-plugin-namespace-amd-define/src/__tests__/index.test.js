import * as babel from 'babel-core';
import plugin from '../index';

it('correctly namespaces unqualified define calls', () => {
	const source = `
	define([], function(){})
	`;

	const { code } = babel.transform(source, {
		plugins: [plugin],
	});

	expect(code).toMatchSnapshot();
});

it('does not namespace already qualified define calls', () => {
	const source = `
	Other.Namespace.define([], function(){})
	`;

	const { code } = babel.transform(source, {
		plugins: [plugin],
	});

	expect(code).toMatchSnapshot();
});
