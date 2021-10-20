/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const chalk = require('chalk');

function choices(version) {
	const choices = [
		{
			name: 'Freemarker (.ftl)',
			value: 'ftl',
		},
	];

	if (version === '7.0' || version === '7.1') {
		choices.push({
			name: 'Velocity (.vm) - deprecated',
			value: 'vm',
		});
	}

	return choices;
}

function isLanguage(version) {
	return function (language) {
		if (version === '7.0' || version === '7.1') {
			return language === 'ftl' || language === 'vm';
		}
		else {
			return language === 'ftl';
		}
	};
}

function printWarnings(version) {
	return function (generator, {templateLanguage}) {
		if (templateLanguage === 'vm') {
			if (version === '7.0') {
				generator.log(
					chalk.yellow(
						'   Warning: Velocity is deprecated for 7.0, some features will be removed in the next release.'
					)
				);
			}
			else {
				generator.log(
					chalk.yellow(
						'   Warning: Velocity support was removed in 7.1.'
					)
				);
			}
		}
	};
}

module.exports = {
	choices,
	isLanguage,
	printWarnings,
};
