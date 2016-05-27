'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');

var chalk = gutil.colors;

function status(themeConfig) {
	var statusBuffer = [];

	var baseTheme = themeConfig.baseTheme;

	var baseThemeLabel = chalk.cyan('Base theme: ');

	if (baseTheme) {
		var baseThemeName = baseTheme.name || baseTheme;

		statusBuffer.push(baseThemeLabel + chalk.green(baseThemeName, baseTheme.version ? 'v' + baseTheme.version : ''));
	}
	else {
		statusBuffer.push(baseThemeLabel + chalk.red('no base theme specified'));
	}

	var themeletDependencies = themeConfig.themeletDependencies;

	if (themeletDependencies) {
		statusBuffer.push(chalk.cyan('Themelets:'));

		_.forEach(themeletDependencies, function(item, index) {
			statusBuffer.push(' - ' + chalk.green(item.name, 'v' + item.version));
		});
	}

	return statusBuffer.join('\n') + '\n';
}

module.exports = status;