const lfrThemeConfig = require('./liferay_theme_config');

const DEFAULT_VERSION = '7.1';

/**
 * Utility for retrieving version-specific functionality.
 *
 * @param {string} key The identifying name for the functionality.
 * @param {string} [version] The Liferay version; will be inferred if omitted.
 * @return {?}
 */
function lookup(key, version = null) {
	if (!version) {
		const config = lfrThemeConfig.getConfig();

		version = config ? config.version : DEFAULT_VERSION;
	}

	return {
		baseThemeDependencies: () =>
			require('./lookup/base').getBaseDependencies,
		devDependencies: () => require('./lookup/dependencies').devDependencies,
		'kickstart:choices': () => require('./lookup/kickstart').choices,
		'kickstart:afterPromptThemeSource': () =>
			require('./lookup/kickstart').afterPromptThemeSource,
	}[key]()(version);
}

module.exports = lookup;
