const _ = require('lodash');
const minimist = require('minimist');

const lfrThemeConfig = require('./liferay_theme_config');

let options;

function getOptions(config) {
	if (!options || config) {
		config = config || {};
		config.argv = minimist(process.argv.slice(2));
		config.pathBuild = config.pathBuild || './build';
		config.pathDist = config.pathDist || './dist';
		config.pathSrc = config.pathSrc || './src';
		config.rubySass = config.rubySass || false;
		config.sassOptions = config.sassOptions || {};
		config.dockerThemesDir = config.dockerThemesDir || '/home/liferay/tmp/themes';

		let themeConfig = lfrThemeConfig.getConfig();

		_.assign(config, themeConfig);

		options = config;
	}

	return options;
}

module.exports = getOptions;
