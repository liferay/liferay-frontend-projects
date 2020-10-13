/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	JsSource,
	JsSourceTransform,
	getAstProgramStatements,
	parseAsAstProgram,
	replaceJsSource,
} from '@liferay/js-toolkit-core';
import estree from 'estree';

export default function exportModuleAsFunction(): JsSourceTransform {
	return ((source) => _exportModuleAsFunction(source)) as JsSourceTransform;
}

async function _exportModuleAsFunction(source: JsSource): Promise<JsSource> {
	return replaceJsSource(source, {
		enter(node) {
			if (node.type !== 'Program') {
				return;
			}

			const program = node;

			const wrapAst = parseAsAstProgram(`
				module.exports = function(_LIFERAY_PARAMS_, _ADAPT_RT_) {
				};
			`);

			const {body: wrapBody} = wrapAst;

			const functionBody = getBlockStatement(wrapAst);

			functionBody.body = getAstProgramStatements(program);

			program.body = wrapBody;
		},
	});
}

function getBlockStatement(program: estree.Program): estree.BlockStatement {
	const {body: programBody} = program;

	if (
		programBody.length === 1 &&
		programBody[0].type === 'ExpressionStatement' &&
		programBody[0].expression.type === 'AssignmentExpression' &&
		programBody[0].expression.right &&
		programBody[0].expression.right.type === 'FunctionExpression' &&
		programBody[0].expression.right.body.type === 'BlockStatement'
	) {
		return programBody[0].expression.right.body;
	}
	else {
		throw new Error(
			'Provided program does not match the expected structure'
		);
	}
}
