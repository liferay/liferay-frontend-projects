/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import estree from 'estree';
import {
	SourceCode,
	SourceTransform,
	replace,
} from 'liferay-npm-build-tools-common/lib/transform/js';
import {getProgramStatements} from 'liferay-npm-build-tools-common/lib/transform/js/ast';
import {parse} from 'liferay-npm-build-tools-common/lib/transform/js/parse';

export default function exportModuleAsFunction(): SourceTransform {
	return (source => _exportModuleAsFunction(source)) as SourceTransform;
}

async function _exportModuleAsFunction(
	source: SourceCode
): Promise<SourceCode> {
	return replace(source, {
		enter(node) {
			if (node.type !== 'Program') {
				return;
			}

			const program = node;

			const wrapAst = parse(`
			module.exports = function(_LIFERAY_PARAMS_, _ADAPT_RT_) {
			};
			`);

			const {body: wrapBody} = wrapAst;

			const functionBody = getBlockStatement(wrapAst);

			functionBody.body = getProgramStatements(program);

			program.body = wrapBody;
		},
	});
}

function getBlockStatement(program: estree.Program): estree.BlockStatement {
	const {body: programBody} = program;

	if (programBody.length !== 1) {
		throw new Error('Program body has more than one node');
	}

	if (programBody[0].type !== 'ExpressionStatement') {
		throw new Error('Program is not an expression statement');
	}

	const {expression} = programBody[0];

	if (expression.type !== 'AssignmentExpression') {
		throw new Error('Program is not an assignment expression');
	}

	const {right} = expression;

	if (right.type !== 'FunctionExpression') {
		throw new Error('Right hand operator is not a function expression');
	}

	const {body: functionBody} = right;

	if (functionBody.type !== 'BlockStatement') {
		throw new Error('Right hand operator body is not a block statement');
	}

	return functionBody;
}
