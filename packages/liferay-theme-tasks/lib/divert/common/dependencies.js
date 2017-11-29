'use strict';

let MODULE_NAMES_MAP = {
	classic: 'liferay-frontend-theme-classic-web',
	mixins: 'liferay-frontend-common-css',
	styled: 'liferay-frontend-theme-styled',
	unstyled: 'liferay-frontend-theme-unstyled',
};

const getDependencyName = name => MODULE_NAMES_MAP[name];

module.exports = {getDependencyName};
