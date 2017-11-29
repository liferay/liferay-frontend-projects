'use strict';

let MODULE_NAMES_MAP = {
	mixins: 'liferay-theme-mixins',
	styled: 'liferay-theme-styled',
	unstyled: 'liferay-theme-unstyled',
};

const getDependencyName = name => MODULE_NAMES_MAP[name];

module.exports = {getDependencyName};
