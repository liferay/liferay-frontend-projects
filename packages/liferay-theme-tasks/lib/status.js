/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const colors = require('ansi-colors');
const _ = require('lodash');

function status(themeConfig) {
	const statusBuffer = [];

	const baseTheme = themeConfig.baseTheme;

	const baseThemeLabel = colors.cyan('Base theme: ');

	if (baseTheme) {
		const baseThemeName = baseTheme.name || baseTheme;
		const baseThemeVersion = baseTheme.version
			? 'v' + baseTheme.version
			: '';

		statusBuffer.push(
			baseThemeLabel +
				colors.green(`${baseThemeName} ${baseThemeVersion}`)
		);
	} else {
		statusBuffer.push(
			baseThemeLabel + colors.red('no base theme specified')
		);
	}

	const themeletDependencies = themeConfig.themeletDependencies;

	if (themeletDependencies) {
		statusBuffer.push(colors.cyan('Themelets:'));

		_.forEach(themeletDependencies, item => {
			statusBuffer.push(
				' - ' + colors.green(item.name + ' v' + item.version)
			);
		});
	}

	return statusBuffer.join('\n') + '\n';
}

module.exports = status;
