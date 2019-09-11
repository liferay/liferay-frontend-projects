/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const prettier = require('prettier');
const extractJS = require('./extractJS');
const restoreTags = require('./restoreTags');
const stripIndents = require('./stripIndents');
const substituteTags = require('./substituteTags');

function formatJSP(source) {
	const result = source;

	const blocks = extractJS(source);

	blocks.forEach(({contents, range}) => {
		const [substituted, tags] = substituteTags(contents);

		const stripped = stripIndents(substituted);

		// TODO delete
		// console.log(substituted);

		const prettierOptions = {
			parser: 'babel'
		};
		const check = prettier.check(stripped, prettierOptions);
	});

	return result;
}

module.exports = formatJSP;
