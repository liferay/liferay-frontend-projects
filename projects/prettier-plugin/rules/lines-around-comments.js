/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

export function linesAroundComments(formattedText, ast, parserName) {
	let contentLengthIncrease = 0;

	ast.comments.forEach((commentNode) => {
		if (isEndofLineComment(commentNode)) {
			return;
		}

		const nodeStart =
			parserName === 'typescript'
				? commentNode.range[0]
				: commentNode.start;
		const nodeEnd =
			parserName === 'typescript'
				? commentNode.range[1]
				: commentNode.end;

		const commentStartIndex = nodeStart + contentLengthIncrease;

		if (!isNewLineBefore(formattedText, commentStartIndex)) {
			const position = commentStartIndex - 1;

			formattedText = insertNewLine(formattedText, position);

			contentLengthIncrease += 1;
		}

		const commentEndIndex = nodeEnd + contentLengthIncrease;

		if (
			!isBlockComment(commentNode) &&
			!isNewLineAfter(formattedText, commentEndIndex)
		) {
			const position = commentEndIndex + 1;

			formattedText = insertNewLine(formattedText, position);

			contentLengthIncrease += 1;
		}
	});

	return formattedText;
}

function isBlockComment(node) {
	return node.type === 'CommentBlock' || node.type === 'Block';
}

function isEndofLineComment(node) {
	return node.loc.start.column !== 0;
}

function isNewLineBefore(text, index) {
	return text.charAt(index - 2) === '\n';
}

function isNewLineAfter(text, index) {
	return text.charAt(index + 2) === '\n';
}

function insertNewLine(text, index) {
	return [text.slice(0, index), '\n', text.slice(index)].join('');
}
