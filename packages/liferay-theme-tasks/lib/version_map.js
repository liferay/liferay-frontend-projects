'use strict';

var lfrThemeConfig = require('./liferay_theme_config');

var MODULE_NAMES_MAP = {
	'6.2': {
		mixins: 'liferay-theme-mixins',
		styled: 'liferay-theme-styled',
		unstyled: 'liferay-theme-unstyled'
	},
	'7.0': {
		classic: 'liferay-frontend-theme-classic-web',
		mixins: 'liferay-frontend-common-css',
		styled: 'liferay-frontend-theme-styled',
		unstyled: 'liferay-frontend-theme-unstyled'
	}
};

exports.getDependencyName = function(name, version) {
	if (!version) {
		var config = lfrThemeConfig.getConfig();

		version = config ? config.version : '7.0';
	}

	return MODULE_NAMES_MAP[version][name];
};