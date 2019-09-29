/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const WHITESPACE_REGEXP = /^\s*$/gm;

/**
 * Provides number of comment lines in the analyzed content
 */
function extractCommentLOC(ast) {
	return ast.comments.reduce(
		(lines, node) => lines + node.loc.end.line - node.loc.start.line + 1,
		0
	);
}

/**
 * Provides number of whitespace-only lines in the analyzed content
 */
function extractWhitespaceLOC(content) {
	return content.match(WHITESPACE_REGEXP).length;
}

/**
 * Augments a provided moduleInfo report with information about the number of lines in the module and their nature: code, comment, total and whitespace
 */
module.exports = async function({ast, content, moduleInfo}) {
	const comment = extractCommentLOC(ast);
	const total = ast.loc.end.line;
	const whitespace = extractWhitespaceLOC(content);

	const code = total - comment - whitespace;

	const loc = {
		code,
		comment,
		total,
		whitespace
	};

	return {
		...moduleInfo,
		loc
	};
};
