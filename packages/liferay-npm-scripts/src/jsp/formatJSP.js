/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const prettier = require('../prettier');
const getMergedConfig = require('../utils/getMergedConfig');
const processJSP = require('./processJSP');

/**
 * Formats the JSP `source` string.
 *
 * Currently, the only formattable elements are script tags.
 */
function formatJSP(source, prettierConfig = getMergedConfig('prettier')) {
	const prettierOptions = {
		...prettierConfig,
		parser: 'babel'
	};

	return processJSP(source, {
		onFormat: input => {
			return prettier.format(input, prettierOptions);
		}
	});
}

module.exports = formatJSP;
