/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * @param {object} context loader's context
 * @return {string} the processed file content
 */
export default function (context) {
	const {filePath, log} = context;
	let {content} = context;

	try {
		content = JSON.stringify(JSON.parse(content));

		// content = content.replace(//g, '\n');

		context.extraArtifacts[`${filePath}.js`] = `
module.exports = JSON.parse(${JSON.stringify(content)});
`;
	}
	catch (err) {
		context.extraArtifacts[`${filePath}.js`] = `
throw new Error('${err.toString()}')
`;
	}

	log.info('json-loader', `Generated JavaScript JSON module`);
}
