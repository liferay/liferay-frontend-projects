'use strict';

let _ = require('lodash');
let gutil = require('gulp-util');

let chalk = gutil.colors;

function status(themeConfig) {
	let statusBuffer = [];

	let baseTheme = themeConfig.baseTheme;

	let baseThemeLabel = chalk.cyan('Base theme: ');

	if (baseTheme) {
		let baseThemeName = baseTheme.name || baseTheme;

		statusBuffer.push(
			baseThemeLabel +
				chalk.green(
					baseThemeName,
					baseTheme.version ? 'v' + baseTheme.version : ''
				)
		);
	} else {
		statusBuffer.push(
			baseThemeLabel + chalk.red('no base theme specified')
		);
	}

	let themeletDependencies = themeConfig.themeletDependencies;

	if (themeletDependencies) {
		statusBuffer.push(chalk.cyan('Themelets:'));

		_.forEach(themeletDependencies, function(item) {
			statusBuffer.push(
				' - ' + chalk.green(item.name, 'v' + item.version)
			);
		});
	}

	return statusBuffer.join('\n') + '\n';
}

module.exports = status;
