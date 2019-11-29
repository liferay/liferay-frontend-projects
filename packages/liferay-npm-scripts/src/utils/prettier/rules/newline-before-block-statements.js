module.exports = {
	create(context) {
		const source = context.getSourceCode();

		return {
			IfStatement(node) {
				const {consequent, alternate} = node;

				if (alternate) {
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
					// We only fix if on same line.
					let last = source.getLastToken(consequent);
					const keyword = source.getTokenAfter(last);

					if (last.loc.end.line === keyword.loc.start.line) {
						// Possibly fragile assumption here: source code is
						// using tabs for indentation.
						const indent = '\t'.repeat(last.loc.end.column - 1);

						context.report({
							fix: fixer => {
								if (
									source.commentsExistBetween(last, keyword)
								) {
									const comments = source.getCommentsAfter(
										last
									);

									last = comments[comments.length - 1];
								}

								return fixer.replaceTextRange(
									[last.end, keyword.start],
									`\n${indent}`
								);
							},
							message: 'line break needed before "else"',
							node
						});
					}
				}
			}
		};
	}
};
