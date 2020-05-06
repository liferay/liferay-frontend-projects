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
 * Parses a snippet of JavaScript source code and extracts it from the Program
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
export function parseAs<T extends estree.Node>(code: string): T {
	const {body} = parse(code);

	if (body.length !== 1) {
		throw new Error('Given code parses to more than one AST node');
	}

	return (body[0] as unknown) as T;
}
