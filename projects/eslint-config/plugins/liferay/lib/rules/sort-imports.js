/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {
	getLeadingComments,
	getRequireStatement,
	getSource,
	getTrailingComments,
	hasSideEffects,
	isAbsolute,
	isRelative,
	withScope,
} = require('../common/imports');

const DESCRIPTION = 'imports must be sorted';

/**
 * Given two sort keys `a` and `b`, return -1, 0 or 1 to indicate
 * their relative ordering.
 */
function compare(aKey, bKey) {
	const [aName, aTieBreaker] = aKey.split(':');
	const [bName, bTieBreaker] = bKey.split(':');

	const cmp = (a, b) => {
		return a < b ? -1 : a > b ? 1 : 0;
	};

	//

	return (
		cmp(ranking(aName), ranking(bName)) ||
		cmp(aName, bName) ||
		cmp(aTieBreaker, bTieBreaker)
	);
}

/**
 * Ideally we'd just sort by source, but in case there is a pathological case
 * where we import from the same module twice, we need to include information
 * about the import specifiers in the sort key.
 */
function getSortKey(node) {
	const source = getSource(node);
	let tieBreaker;

	if (node.type === 'ImportDeclaration') {
		const specifiers = node.specifiers.map((specifier) => {

			// Note tie breaking order here:
			//
			//      * as name
			//      name
			//      {name}
			//      {name:alias}
			//

			if (specifier.type === 'ImportNamespaceSpecifier') {
				return `*${specifier.local.name}`;
			}
			else if (specifier.type === 'ImportDefaultSpecifier') {
				return specifier.local.name;
			}
			else {
				return `{${specifier.imported.name}:${specifier.local.name}}`;
			}
		});

		tieBreaker = specifiers.sort().join(':');
	}
	else if (node.type === 'VariableDeclaration') {

		// ie. `const ... = require('...');`

		const declarations = node.declarations.map((declaration) => {
			if (declaration.id.type === 'Identifier') {
				return declaration.id.name;
			}
			else if (declaration.id.type === 'ObjectPattern') {
				const properties = declaration.id.properties.map((property) => {
					if (property.type === 'Property') {
						return `${property.key.name}:${property.value.name}`;
					}
					else if (property.type === 'ExperimentalRestProperty') {
						return `...${property.argument.name}`;
					}
				});

				return `{${properties.sort().join()}}`;
			}
		});

		tieBreaker = declarations.sort().join(':');
	}
	else if (node.type === 'ExpressionStatement') {

		// ie. `require('...');`
		// Always alone in group so tieBreaker not needed.

		tieBreaker = '';
	}

	return `${source}:${tieBreaker}`;
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

		const {scope, visitors} = withScope();

		function getRangeForNode(node) {
			const commentsBefore = getLeadingComments(node, context);
			const commentsAfter = getTrailingComments(node, context);

			const first = commentsBefore[0] || node;

			const last = commentsAfter[commentsAfter.length - 1] || node;

			return [first.range[0], last.range[1]];
		}

		function register(node) {
			if (node) {
				if (hasSideEffects(node)) {

					// Create a boundary group across which we cannot reorder.

					group = [];
					imports.push([node], group);
				}
				else {
					group.push(node);
				}
			}
		}

		return {
			...visitors,

			CallExpression(node) {
				if (scope.length) {

					// Only consider `require` calls at the top level.

					return;
				}

				register(getRequireStatement(node));
			},

			ImportDeclaration(node) {
				register(node);
			},

			['Program:exit'](_node) {
				const problems = imports.map((group) => {
					const desired = [...group].sort((a, b) =>
						compare(getSortKey(a), getSortKey(b))
					);

					// Try to make error messages (somewhat) minimal
					// by only reporting from the first to the last
					// mismatch (ie. not a full Myers diff algorithm).

					const [firstMismatch, lastMismatch] = group.reduce(
						([first, last], node, i) => {
							if (getSortKey(node) !== getSortKey(desired[i])) {
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
								.map((node) => JSON.stringify(getSource(node)))
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
						fix: (fixer) => {
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

								sources.set(getSortKey(group[i]), {text});
							}

							for (
								let i = firstMismatch;
								i <= lastMismatch;
								i++
							) {
								fixings.push(
									fixer.replaceTextRange(
										getRangeForNode(group[i]),
										sources.get(getSortKey(desired[i])).text
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
