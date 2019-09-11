/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const prettier = require('prettier');
const extractJS = require('./extractJS');
const restoreTags = require('./restoreTags');
const substituteTags = require('./substituteTags');

function formatJSP(source) {
	const result = source;

	const blocks = extractJS(source);

	blocks.forEach(({contents, range}) => {
		const [transformed, tags] = substituteTags(contents);

		console.log(transformed);

		const prettierOptions = {
			parser: 'babel'
		};
		const check = prettier.check(transformed, prettierOptions);
	});

	return result;
}

module.exports = formatJSP;
