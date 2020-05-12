/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as acorn from 'acorn';
import estree from 'estree';

/**
 * Parses JavaScript source code and converts it to a Program AST node.
 *
 * @param code
 */
export function parse(code: string): estree.Program {
	const program = acorn.parse(code, {
		allowAwaitOutsideFunction: true,
		allowHashBang: true,
		allowImportExportEverywhere: true,
		allowReserved: true,
		allowReturnOutsideFunction: true,
		ecmaVersion: 10,
		locations: true,
		sourceType: 'module',
	}) as estree.Node;

	if (program.type !== 'Program') {
		throw new Error('Code cannot be parsed as an AST Program node');
	}

	return program as estree.Program;
}

/**
 * Parses a snippet of JavaScript source code, extracts it from the Program
 * AST node.
 *
 * This is useful to get AST representations of code snippets to be used during
 * AST transformations.
 *
 * @remarks
 * Note that the given source code must generate one single AST node below the
 * Program node.
 *
 * @param code
 */
export function parseAsExpressionStatement(
	code: string
): estree.ExpressionStatement {
	const {body} = parse(code);

	if (body.length !== 1 || body[0].type !== 'ExpressionStatement') {
		throw new Error('Code cannot be parses as an ExpressionStatement node');
	}

	return body[0] as estree.ExpressionStatement;
}
