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

	if (
		programBody.length === 1 &&
		programBody[0].type === 'ExpressionStatement' &&
		programBody[0].expression.type === 'AssignmentExpression' &&
		programBody[0].expression.right &&
		programBody[0].expression.right.type === 'FunctionExpression' &&
		programBody[0].expression.right.body.type === 'BlockStatement'
	) {
		return programBody[0].expression.right.body;
	} else {
		throw new Error(
			'Provided program does not match the expected structure'
		);
	}
}
