const _ = require('lodash');
const colors = require('ansi-colors');

function status(themeConfig) {
	let statusBuffer = [];

	let baseTheme = themeConfig.baseTheme;

	let baseThemeLabel = colors.cyan('Base theme: ');

	if (baseTheme) {
		let baseThemeName = baseTheme.name || baseTheme;
		let baseThemeVersion = baseTheme.version ? 'v' + baseTheme.version : '';

		statusBuffer.push(
			baseThemeLabel +
				colors.green(`${baseThemeName} ${baseThemeVersion}`)
		);
	} else {
		statusBuffer.push(
			baseThemeLabel + colors.red('no base theme specified')
		);
	}

	let themeletDependencies = themeConfig.themeletDependencies;

	if (themeletDependencies) {
		statusBuffer.push(colors.cyan('Themelets:'));

		_.forEach(themeletDependencies, function(item) {
			statusBuffer.push(
				' - ' + colors.green(item.name + ' v' + item.version)
			);
		});
	}

	return statusBuffer.join('\n') + '\n';
}

module.exports = status;
