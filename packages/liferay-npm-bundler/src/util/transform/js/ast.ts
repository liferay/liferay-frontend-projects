/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import estree from 'estree';

/**
 * Programs may have Directives, Statements, and ModuleDeclarations as children,
 * but if we are wrapping them info an AMD function, we cannot insert other than
 * Statements inside it, so we must filter out ModuleDeclarations (Directives
 * are an specialized type of ExpressionStatements).
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
	const statementNodes = {
		ExpressionStatement: true,
		BlockStatement: true,
		EmptyStatement: true,
		DebuggerStatement: true,
		WithStatement: true,
		ReturnStatement: true,
		LabeledStatement: true,
		BreakStatement: true,
		ContinueStatement: true,
		IfStatement: true,
		SwitchStatement: true,
		ThrowStatement: true,
		TryStatement: true,
		WhileStatement: true,
		DoWhileStatement: true,
		ForStatement: true,
		ForInStatement: true,
		ForOfStatement: true,
		FunctionDeclaration: true,
		VariableDeclaration: true,
		ClassDeclaration: true,
	};

	const nonStatementNode = program.body.find(
		node => statementNodes[node.type] !== true
	);

	if (nonStatementNode) {
		throw new Error(
			`Found a ${nonStatementNode.type} node in Program but only` +
				`Statements are allowed`
		);
	}

	return (program.body as unknown[]) as estree.Statement[];
}
