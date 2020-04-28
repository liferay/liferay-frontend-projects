/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {parse} from 'acorn';
import ESTree from 'estree';

import {transform, wrapModule} from '../transform';

// To write a .js file with source map for debugging purposes do:
// require('fs').writeFileSync(
// 	'/tmp/file.js',
// 	transformed.code +
// 		'\n' +
// 		require('convert-source-map')
// 			.fromObject(transformed.map)
// 			.toComment()
// );

// Note that generated source maps can be inspected (when necessary) with:
// http://sokra.github.io/source-map-visualization/#custom

describe('wrapModule', () => {
	it('wraps module without dependencies', async () => {
		const code = `
		console.log('Hello world');
		`;

		const wrapped = await wrapModule({
			fileName: 'a/module/name.js',
			code,
		});

		expect(wrapped).toMatchSnapshot();
	});

	it('wraps module with dependencies', async () => {
		const code = `
		var a = require('a/dependency');
		var another = require('another/dependency');

		console.log('Hello world');
		`;

		const wrapped = await wrapModule({
			fileName: 'a/module/name.js',
			code,
		});

		expect(wrapped).toMatchSnapshot();
	});
});

describe('transform', () => {
	it('works for single transformation', async () => {
		// Change `variable = 1` to `a = 1`
		const transformed = await transform(
			{code: 'variable = 1', fileName: 'test.js'},
			'test.t1.js',
			{
				enter(node) {
					if (node.type !== 'Identifier') {
						return;
					}

					node.name = 'a';
				},
			}
		);

		expect(transformed).toMatchSnapshot();
	});

	it('works for double transformation', async () => {
		// Change `variable = 1` to `a = 1`
		const transformed1 = await transform(
			{code: 'variable = 1', fileName: 'test.js'},
			'test.t1.js',
			{
				enter(node) {
					if (node.type !== 'Identifier') {
						return;
					}

					node.name = 'a';
				},
			}
		);

		// Wrap code into define() call
		const transformed2 = await transform(transformed1, 'test.t2.js', {
			enter(node) {
				if (node.type !== 'Program') {
					return;
				}

				const ast = parse(`define('a-module', function() {})`);

				const {body} = (ast as unknown) as ESTree.Program;

				if (body[0].type !== 'ExpressionStatement') {
					return;
				}

				const {expression} = body[0];

				if (expression.type !== 'CallExpression') {
					return;
				}

				const {arguments: args} = expression;

				if (args.length < 2) {
					return;
				}

				if (args[1].type !== 'FunctionExpression') {
					return;
				}

				const functionExpression = args[1];

				const {body: moduleBody} = functionExpression;

				if (moduleBody.type !== 'BlockStatement') {
					return;
				}

				moduleBody.body = (node.body as unknown) as [];

				node.body = body;
			},
		});

		expect(transformed2).toMatchSnapshot();
	});
});
