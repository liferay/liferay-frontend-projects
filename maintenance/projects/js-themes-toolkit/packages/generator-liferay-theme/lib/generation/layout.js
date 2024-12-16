/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const LayoutCreator = require('../../lib/LayoutCreator');
const {normalizeName} = require('../../lib/util');
const config = require('../../lib/utils/config');
const promptWithConfig = require('../../lib/utils/promptWithConfig');
const versions = require('../../lib/versions');

async function prompting(generator) {
	return await promptWithConfig(generator, 'layout', [
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
			default: versions.supported[0],
			message: 'Which version of Liferay is this theme for?',
			name: 'liferayVersion',
			type: 'list',
		},
	]);
}

async function runLayoutCreator(className, liferayVersion) {
	const options = {
		className,
		liferayVersion,
	};

	if (config.batchMode()) {
		options.rowData = [
			[
				{
					className: 'portlet-column-only',
					contentClassName: 'portlet-column-content-only',
					number: 1,
					size: 12,
				},
			],
		];
	}

	const layoutCreator = new LayoutCreator(options);

	return await layoutCreator.run();
}

module.exports = {
	prompting,
	runLayoutCreator,
};
