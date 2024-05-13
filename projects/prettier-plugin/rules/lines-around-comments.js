/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

export function linesAroundComments(formattedText, ast, parserName) {
	const totalLines = ast.loc.end.line;

	let hasDirective = false;
	let linesAdded = 0;

	/*
	 * Track where each inline comment is so that we can group them
	 */
	const linesWithInlineComment = ast.comments.reduce(
		(inlineComments, commentNode) => {
			if (
				isInlineComment(commentNode) &&
				!isEndofLineComment(commentNode, formattedText, parserName)
			) {

				/*
				 * Subtract '1' to make it zero based counting
				 */
				inlineComments.push(commentNode.loc.start.line - 1);
			}

			return inlineComments;
		},
		[]
	);

	/*
	 * Normalizes our content into an array of strings. Each item represents a single
	 * line of the source file. An empty item in the array would signify a new line.
	 */
	let formattedTextByLines = formattedText.split('\n');

	ast.comments.forEach((commentNode) => {

		/*
		 * Ignore comments that are at the end of a line
		 */
		if (isEndofLineComment(commentNode, formattedText, parserName)) {
			return;
		}

		/*
		 * Skip directives
		 */
		if (isDirective(commentNode, formattedText, parserName)) {
			hasDirective = true;

			return;
		}

		/*
		 * Subtract '1' to make it zero based counting
		 */
		const startingLine = commentNode.loc.start.line - 1;
		const endingLine = commentNode.loc.end.line - 1;

		let skipAfter = false;
		let skipBefore = false;

		/*
		 * Don't add a line after if the comment is for eslint
		 */
		if (commentNode.value.includes('disable-next-line')) {
			skipAfter = true;
		}

		/*
		 * Don't add a line after if the comment is at the end of the file
		 */
		if (endingLine === totalLines) {
			skipAfter = true;
		}

		/*
		 * Don't add a line before if its the first line in the file
		 * or
		 * Don't add a line before if the line above is a directive
		 */
		if (startingLine === 0 || (hasDirective && startingLine === 1)) {
			skipBefore = true;
		}

		/*
		 * This allows to group inline comments next to one another
		 */
		if (isInlineComment(commentNode)) {
			if (linesWithInlineComment.includes(startingLine - 1)) {
				skipBefore = true;
			}

			if (linesWithInlineComment.includes(startingLine + 1)) {
				skipAfter = true;
			}
		}

		const startLine = startingLine + linesAdded;

		if (!isNewLineBefore(formattedTextByLines, startLine) && !skipBefore) {
			formattedTextByLines = insertNewLine(
				formattedTextByLines,
				startLine
			);

			linesAdded += 1;
		}

		const endLine = endingLine + linesAdded;

		if (
			!isBlockComment(commentNode) &&
			!isNewLineAfter(formattedTextByLines, endLine) &&
			!skipAfter
		) {
			formattedTextByLines = insertNewLine(
				formattedTextByLines,
				endLine + 1
			);

			linesAdded += 1;
		}
	});

	return formattedTextByLines.join('\n');
}

function isDirective(node, text, parserName) {
	if (parserName === 'typescript') {
		return (
			node.range[0] === 0 &&
			text.substring(...node.range).startsWith('#!')
		);
	}

	return node.type === 'InterpreterDirective';
}

function isBlockComment(node) {
	return node.type === 'CommentBlock' || node.type === 'Block';
}

function isInlineComment(node) {
	return node.type === 'CommentLine' || node.type === 'Line';
}

/*
 * Returns The contents on the same line before the comment starts
 */
function getContentsBeforeColumn(node, source, parserName) {
	const {column} = node.loc.start;
	let index;

	if (parserName === 'typescript') {
		index = node.range[0];
	}
	else {
		index = node.loc.start.index;
	}

	return source.slice(index - column, index - 1);
}

/*
 * A comment like `var test = 'foo'; // this is my variable`
 */
function isEndofLineComment(node, source, parserName) {
	return (
		node.loc.start.column !== 0 &&
		/\S/.test(getContentsBeforeColumn(node, source, parserName))
	);
}

function isNewLineBefore(textArray, index) {
	return textArray[index - 1] === '';
}

function isNewLineAfter(textArray, index) {
	return textArray[index + 1] === '';
}

function insertNewLine(textArray, index) {
	return [...textArray.slice(0, index), '', ...textArray.slice(index)];
}
