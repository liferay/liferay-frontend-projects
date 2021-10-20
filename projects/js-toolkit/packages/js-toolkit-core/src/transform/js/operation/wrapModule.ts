/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {SourceTransform, replace} from '..';
import {traverse} from 'estraverse';
import estree from 'estree';

import {getProgramStatements} from '../ast';
import {parse} from '../parse';

export interface Options {

	/**
	 * Extra dependencies to add to the AMD define() call (other than those
	 * detected by scanning the code for require() calls).
	 *
	 * Default value is:
	 *
	 * {
	 *   module: 'module',
	 *   require: 'require'
	 * }
	 */
	defineDependencies?: {
		[argumentName: string]: string;
	};

	/**
	 * The name of the require() method. Default value is 'require'.
	 *
	 * @remarks
	 * This is used to scan the code and find the necessary dependencies to
	 * construct the AMD define() invocation.
	 */
	requireIdentifier?: string;
}

/**
 * Wraps a module into an AMD define call.
 *
 * @param moduleName
 * @param options
 */
export default function wrapModule(
	moduleName: string,
	options: Options = {}
): SourceTransform {
	const requireIdentifier = options.requireIdentifier || 'require';

	const defineDependencies = options.defineDependencies || {
		module: 'module',
		require: 'require',
	};

	return ((source) =>
		replace(source, {
			enter(node) {
				if (node.type !== 'Program') {
					return;
				}

				const program = node;

				const extraModules = Object.entries(defineDependencies).map(
					([, value]) => value
				);

				const dependencies = getDefineDependencies(
					program,
					requireIdentifier,
					extraModules
				);

				const defineArguments = Object.entries(defineDependencies)
					.map(([key]) => key)
					.join(',');

				const wrapAst = parse(`
					Liferay.Loader.define(
						'${moduleName}',
						[
							${dependencies}
						],
						function(${defineArguments}) {
						}
					);
				`);

				const {body: wrapBody} = wrapAst;

				const moduleBody = getBlockStatement(wrapAst);

				moduleBody.body = getProgramStatements(program);

				program.body = wrapBody;
			},
		})) as SourceTransform;
}

function getBlockStatement(wrapAst: estree.Program): estree.BlockStatement {
	const {body: wrapBody} = wrapAst;

	if (wrapBody.length !== 1) {
		throw new Error('Program body has more than one node');
	}

	if (wrapBody[0].type !== 'ExpressionStatement') {
		throw new Error('Program is not an expression statement');
	}

	const {expression} = wrapBody[0];

	if (expression.type !== 'CallExpression') {
		throw new Error('Program is not a call expression');
	}

	const {arguments: args} = expression;

	if (args.length !== 3) {
		throw new Error(
			'Program call expression must have exactly three arguments'
		);
	}

	if (args[2].type !== 'FunctionExpression') {
		throw new Error(
			'Second argument of program call expression is not a function'
		);
	}

	const {body: moduleBody} = args[2];

	if (moduleBody.type !== 'BlockStatement') {
		throw new Error('Argument function body is not a block statement');
	}

	return moduleBody;
}

function getDefineDependencies(
	program: estree.Program,
	requireIdentifier: string,
	extraDependencies: string[]
): string {
	const requiredModules = {};

	traverse(program, {
		enter(node) {
			if (node.type !== 'CallExpression') {
				return;
			}

			const {callee} = node;

			if (
				callee.type !== 'Identifier' ||
				callee.name !== requireIdentifier
			) {
				return;
			}

			const {arguments: params} = node;

			if (params.length !== 1) {
				return;
			}

			const param0 = params[0];

			if (param0.type !== 'Literal') {
				return;
			}

			const {value: moduleName} = param0;

			if (typeof moduleName !== 'string') {
				return;
			}

			requiredModules[moduleName] = true;
		},
	});

	return extraDependencies
		.concat(Object.keys(requiredModules))
		.map((dependency) => `'${dependency}'`)
		.join(',');
}
