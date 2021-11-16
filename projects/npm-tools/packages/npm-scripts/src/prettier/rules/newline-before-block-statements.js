/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = {
	create(context) {
		const source = context.getSourceCode();

		/**
		 * Checks for a line break after the supplied node.
		 */
		function check(node) {

			// We only fix if on same line.

			let last = source.getLastToken(node);

			const keyword = source.getTokenAfter(last);

			if (last.loc.end.line === keyword.loc.start.line) {

				// Possibly fragile assumption here: source code is
				// using tabs for indentation.

				const indent = '\t'.repeat(last.loc.end.column - 1);

				context.report({
					fix: (fixer) => {
						if (source.commentsExistBetween(last, keyword)) {
							const comments = source.getCommentsAfter(last);

							last = comments[comments.length - 1];
						}

						return fixer.replaceTextRange(
							[last.range[1], keyword.range[0]],
							`\n${indent}`
						);
					},
					message: 'line break needed before node',
					node,
				});
			}
		}

		return {
			IfStatement(node) {

				// Deal with either:
				//
				//                } else if {
				//     consequent ^         ^ alternate
				//
				// or:
				//
				//                } else {
				//     consequent ^      ^ alternate
				//

				const {alternate, consequent} = node;

				if (alternate) {
					check(consequent);
				}
			},

			TryStatement(node) {

				// Deal with either:
				//
				//                } catch (error) {
				//         block--^ ^--handler
				//
				// or:
				//
				//                } catch {
				//         block--^ ^--handler
				//
				// or:
				//
				//                      } finally {
				//     block-or-handler ^         ^ finalizer
				//
				// Note that even though the structure here is a little variable
				// (ie. the "handler" includes the "catch" keyword itself while
				// the "finalizer" only starts at the following "{" punctuator)
				// things will work fine because we run our check against the
				// preceding node (whether that be a "block" or a "handler") and
				// they both stop at their ending "}" punctuator.
				//

				const {block, finalizer, handler} = node;

				if (handler) {
					check(block);
				}

				if (finalizer) {
					check(handler || block);
				}
			},
		};
	},
};
