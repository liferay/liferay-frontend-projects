/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

function getLeadingComments(node, context) {
	const code = context.getSourceCode();

	const comments = code.getCommentsBefore(node).filter(comment => {
		const precedes =
			comment.loc.end.line === node.loc.start.line - 1 ||
			comment.loc.end.line === node.loc.start.line;

		return precedes && !isHeaderComment(comment);
	});

	// In order to be considered "leading", comments must not be
	// "trailing" anything else.
	if (comments.length) {
		const {column, line} = comments[0].loc.start;
		const prefix = code.text.slice(
			code.getIndexFromLoc({column: 0, line}),
			code.getIndexFromLoc({column, line})
		);

		if (/^\s*$/.test(prefix)) {
			return comments;
		}
	}

	return [];
}

/**
 * See also `isRequireStatement()` in this module.
 */
function getRequireStatement(node) {
	if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
		const argument = node.arguments && node.arguments[0];

		if (
			argument &&
			argument.type === 'Literal' &&
			typeof argument.value === 'string'
		) {
			if (
				node.parent.type === 'CallExpression' &&
				node.parent.parent.type === 'VariableDeclarator' &&
				node.parent.parent.parent.type === 'VariableDeclaration'
			) {
				return node.parent.parent.parent;
			} else if (node.parent.type === 'ExpressionStatement') {
				return node.parent;
			} else if (
				node.parent.type === 'MemberExpression' &&
				node.parent.parent.type === 'VariableDeclarator' &&
				node.parent.parent.parent.type === 'VariableDeclaration'
			) {
				return node.parent.parent.parent;
			} else if (
				node.parent.type === 'VariableDeclarator' &&
				node.parent.parent.type === 'VariableDeclaration'
			) {
				return node.parent.parent;
			}
		}
	}
}

function getSource(node) {
	if (node.type === 'ImportDeclaration') {
		return node.source.value;
	} else if (node.type === 'VariableDeclaration') {
		const init = node.declarations[0].init;

		if (init.type === 'CallExpression') {
			if (init.callee.type === 'CallExpression') {
				// ie. `const ... = require('...')(...);
				return init.callee.arguments[0].value;
			} else {
				// ie. `const ... = require('...');`
				return init.arguments[0].value;
			}
		} else if (init.type === 'MemberExpression') {
			// ie. `const ... = require('...').thing;
			return init.object.arguments[0].value;
		}
	} else if (node.type === 'ExpressionStatement') {
		// ie. `require('...');`
		return node.expression.arguments[0].value;
	}
}

function getTrailingComments(node, context) {
	return context
		.getSourceCode()
		.getCommentsAfter(node)
		.filter(comment => comment.loc.start.line === node.loc.end.line);
}

/**
 * Returns true if an import is made exclusively for its side effects;
 * eg:
 *
 *      import 'foo';
 *      require('bar');
 *
 * Such nodes form boundaries across which we must not re-order any
 * imports.
 */
function hasSideEffects(node) {
	if (node.type === 'ImportDeclaration') {
		return node.specifiers.length === 0;
	} else {
		// ie. a `require()` call.
		return node.type === 'ExpressionStatement';
	}
}

/**
 * Returns true if `source` is an absolute path (ie. starts with "/").
 *
 * Technically, we shouldn't have any of imports that use absolute paths
 * in our codebase, but a separate lint can handle that.
 */
function isAbsolute(source) {
	return /^\//.test(source);
}

function isHeaderComment(comment) {
	return (
		/\bcopyright\b|\(c\)|©/i.test(comment.value) &&
		comment.loc.start.line < 3 /* At top or just after shebang. */
	);
}

/**
 * Returns true if `source` is a "local" path (ie. not a NodeJS built-in or
 * dependency declared in a "package.json" file).
 */
function isLocal(source) {
	return isAbsolute(source) || isRelative(source);
}

/**
 * Returns true if `source` is a relative path (ie. starts with "./" or "../").
 */
function isRelative(source) {
	return /^\.\.?\//.test(source);
}

/**
 * See also `getRequireStatement()` in this module.
 */
function isRequireStatement(node) {
	return (
		// ie. `const a = require('a');`
		(node &&
			node.type === 'VariableDeclaration' &&
			node.declarations[0].init.type === 'CallExpression' &&
			node.declarations[0].init.callee.name === 'require') ||
		// ie. `const a = require('a').item;`
		(node &&
			node.type === 'VariableDeclaration' &&
			node.declarations[0].init.type === 'MemberExpression' &&
			node.declarations[0].init.object.type === 'CallExpression' &&
			node.declarations[0].init.object.callee.name === 'require') ||
		// ie. `const a = require('a')();`
		(node &&
			node.type === 'VariableDeclaration' &&
			node.declarations[0].init.type === 'CallExpression' &&
			node.declarations[0].init.callee.type === 'CallExpression' &&
			node.declarations[0].init.callee.callee.name === 'require')
	);
}

module.exports = {
	getLeadingComments,
	getRequireStatement,
	getSource,
	getTrailingComments,
	hasSideEffects,
	isAbsolute,
	isLocal,
	isRelative,
	isRequireStatement,
};
