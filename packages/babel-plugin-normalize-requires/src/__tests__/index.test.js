import * as babel from 'babel-core';
import plugin from '../index';

describe('when requiring local modules', () => {
	it('removes trailing ".js" from module names', () => {
		const source = `
	    require('./a-module.js')
	    `;

		const { code } = babel.transform(source, {
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('removes trailing "/" from module names', () => {
		const source = `
		require('./a-module/')
	    `;

		const { code } = babel.transform(source, {
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});
});

describe('when requiring external modules', () => {
	it('removes trailing ".js" from module names', () => {
		const source = `
		require('a-package/a-module.js')
	    `;

		const { code } = babel.transform(source, {
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('removes trailing "/" from module names', () => {
		const source = `
		require('a-package/a-module/')
	    `;

		const { code } = babel.transform(source, {
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});
});
