/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {normalizeName} = require('../../lib/util');
const versions = require('../../lib/versions');

async function prompting(generator) {
	return await generator.prompt([
		{
			default: 'My Liferay Layout',
			message: 'What would you like to call your layout template?',
			name: 'layoutName',
			type: 'input',
		},
		{
			default(answers) {
				return normalizeName(answers.layoutName || '');
			},
			message: 'What id would you like to give to your layout template?',
			name: 'layoutId',
			type: 'input',
		},
		{
			choices: versions.supported,
			message: 'Which version of Liferay is this theme for?',
			name: 'liferayVersion',
			type: 'list',
		},
	]);
}

module.exports = {
	prompting,
};
