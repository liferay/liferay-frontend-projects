/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import estree from 'estree';

const STATEMENT_NODES = new Set([
	'BlockStatement',
	'BreakStatement',
	'ClassDeclaration',
	'ContinueStatement',
	'DebuggerStatement',
	'DoWhileStatement',
	'EmptyStatement',
	'ExpressionStatement',
	'ForInStatement',
	'ForOfStatement',
	'ForStatement',
	'FunctionDeclaration',
	'IfStatement',
	'LabeledStatement',
	'ReturnStatement',
	'SwitchStatement',
	'ThrowStatement',
	'TryStatement',
	'VariableDeclaration',
	'WhileStatement',
	'WithStatement',
]);

/**
 * Programs may have Directives, Statements, and ModuleDeclarations as children,
 * but if we are wrapping them in an AMD function, we cannot insert other than
 * Statements inside it, so we must filter out ModuleDeclarations (Directives
 * are a specialized type of ExpressionStatements).
 *
 * In case we find any ModuleDeclaration, we throw an error because the build
 * won't be functional anyway so better failing fast than waiting for a runtime
 * error.
 *
 * @param program
 */
export function getProgramStatements(
	program: estree.Program
): estree.Statement[] {
	program.body.forEach(({type}) => {
		if (!STATEMENT_NODES.has(type)) {
			throw new Error(
				`Found a ${type} node in Program but only Statements are allowed`
			);
		}
	});

	return program.body as estree.Statement[];
}
