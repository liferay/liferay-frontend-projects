module.exports = {
	create(context) {
		const source = context.getSourceCode();

		const fixed = new Set();

		return {
			IfStatement(node) {
				const {consequent, alternate} = node;

				// The alternate will be either:
				//
				//      } else if {
				//             ^ the "if" after an "else"
				//
				// or:
				//
				//      } else {
				//             ^ the start of an "else" block
				//
				if (alternate && !fixed.has(node)) {
					fixed.add(node);

					context.report({
						fix: fixer => {
							const last = source.getLastToken(consequent);
							const keyword = source.getTokenAfter(last);

							// Possibly fragile assumption here: source code is
							// using tabs for indentation.
							const indent = '\t'.repeat(last.loc.end.column - 1);

							// TODO: only do this if not on same line
							return fixer.replaceTextRange(
								[last.end, keyword.start],
								`\n${indent}`
							);
						},
						message: 'line break needed before "else"',
						node
					});
				}
			},
		};
	},
};
