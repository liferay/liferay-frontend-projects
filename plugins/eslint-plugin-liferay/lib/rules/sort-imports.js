/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {
	getLeadingComments,
	getSource,
	getTrailingComments,
	hasSideEffects,
	isAbsolute,
	isRelative,
} = require('../common/imports');

const DESCRIPTION = 'imports must be sorted';

/**
 * Given two source strings `a` and `b`, return -1, 0 or 1 to indicate
 * their relative ordering.
 */
function compare(a, b) {
	const compareBy = fn => {
		const [rankA, rankB] = [fn(a), fn(b)];

		return rankA < rankB ? -1 : rankA > rankB ? 1 : 0;
	};

	const result = compareBy(ranking);

	if (result) {
		return result;
	}

	// Break ties with a standard lexicographical (case-sensitive) sort.
	return compareBy(name => name);
}

/**
 * Returns a ranking for `source`. Lower-numbered ranks are considered more
 * important and will be sorted first in the file.
 *
 * - 0: NodeJS built-ins and dependencies declared in "package.json" files.
 * - 1: Absolute paths.
 * - 2: Relative paths.
 */
function ranking(source) {
	return isRelative(source) ? 2 : isAbsolute(source) ? 1 : 0;
}

module.exports = {
	create(context) {
		/**
		 * A buffer for collecting imports into a group.
		 */
		let group = [];

		/**
		 * An array of groups of imports. Any import that is made just
		 * for its side-effects will start (and end) a new group, and
		 * forms a boundary across which we must not re-order.
		 */
		const imports = [group];

		const scope = [];

		const enterScope = node => scope.push(node);
		const exitScope = () => scope.pop();

		function getRangeForNode(node) {
			const commentsBefore = getLeadingComments(node, context);
			const commentsAfter = getTrailingComments(node, context);

			const first = commentsBefore[0] || node;

			const last = commentsAfter[commentsAfter.length - 1] || node;

			return [first.range[0], last.range[1]];
		}

		function register(node) {
			if (hasSideEffects(node)) {
				// Create a boundary group across which we cannot reorder.
				group = [];
				imports.push([node], group);
			} else {
				group.push(node);
			}
		}

		return {
			ArrowFunctionExpression: enterScope,
			'ArrowFunctionExpression:exit': exitScope,

			BlockStatement: enterScope,
			'BlockStatement:exit': exitScope,

			CallExpression(node) {
				if (scope.length) {
					// Only consider `require` calls at the top level.
					return;
				}

				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'require'
				) {
					const argument = node.arguments && node.arguments[0];
					if (
						argument &&
						argument.type === 'Literal' &&
						typeof argument.value === 'string'
					) {
						if (node.parent.type === 'ExpressionStatement') {
							register(node.parent);
						} else if (
							node.parent.type === 'VariableDeclarator' &&
							node.parent.parent.type === 'VariableDeclaration'
						) {
							register(node.parent.parent);
						}
					}
				}
			},

			FunctionDeclaration: enterScope,
			'FunctionDeclaration:exit': exitScope,

			FunctionExpression: enterScope,
			'FunctionExpression:exit': exitScope,

			ImportDeclaration(node) {
				register(node);
			},

			ObjectExpression: enterScope,
			'ObjectExpression:exit': exitScope,

			['Program:exit'](_node) {
				const problems = imports.map(group => {
					const desired = [...group].sort((a, b) =>
						compare(getSource(a), getSource(b))
					);

					// Try to make error messages (somewhat) minimal
					// by only reporting from the first to the last
					// mismatch (ie. not a full Myers diff algorithm).
					const [firstMismatch, lastMismatch] = group.reduce(
						([first, last], node, i) => {
							if (getSource(node) !== getSource(desired[i])) {
								if (first === -1) {
									first = i;
								}
								last = i;
							}
							return [first, last];
						},
						[-1, -1]
					);

					if (firstMismatch !== -1) {
						return {
							description: desired
								.slice(firstMismatch, lastMismatch + 1)
								.map(node => JSON.stringify(getSource(node)))
								.join(' << '),
							desired,
							firstMismatch,
							lastMismatch,
						};
					}

					return null;
				});

				problems.forEach((problem, i) => {
					if (!problem) {
						return;
					}

					const group = imports[i];

					const {
						description,
						desired,
						firstMismatch,
						lastMismatch,
					} = problem;

					const message =
						'imports must be sorted by module name ' +
						`(expected: ${description})`;

					context.report({
						fix: fixer => {
							const fixings = [];

							const code = context.getSourceCode();

							const sources = new Map();

							for (
								let i = firstMismatch;
								i <= lastMismatch;
								i++
							) {
								const node = group[i];
								const range = getRangeForNode(node);
								const text = code.getText().slice(...range);

								sources.set(getSource(group[i]), {text});
							}

							for (
								let i = firstMismatch;
								i <= lastMismatch;
								i++
							) {
								fixings.push(
									fixer.replaceTextRange(
										getRangeForNode(group[i]),
										sources.get(getSource(desired[i])).text
									)
								);
							}

							return fixings;
						},
						message,
						node: group[0],
					});
				});
			},
		};
	},

	meta: {
		docs: {
			category: 'Best Practices',
			description: DESCRIPTION,
			recommended: false,
			url:
				'https://github.com/liferay/liferay-frontend-guidelines/issues/60',
		},
		fixable: 'code',
		schema: [],
		type: 'problem',
	},
};
