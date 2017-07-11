import * as babel from 'babel-core';
import plugin from '../index';

describe('when requiring package default modules', () => {
	it('keeps trailing ".js" from package names', () => {
		const source = `
		require('a-package.js')
		`;

		const { code } = babel.transform(source, {
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});

	it('keeps trailing ".js" from scoped package names', () => {
		const source = `
		require('@some-scope/a-package.js')
		`;

		const { code } = babel.transform(source, {
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});
});

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

	it('only removes trailing "/" from module names ending in ".js"', () => {
		const source = `
		require('./a-module.js/')
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

	it('only removes trailing "/" from module names ending in ".js"', () => {
		const source = `
		require('a-package/a-module.js/')
		`;

		const { code } = babel.transform(source, {
			plugins: [plugin],
		});

		expect(code).toMatchSnapshot();
	});
});
