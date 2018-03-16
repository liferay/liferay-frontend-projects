'use strict';

const _ = require('lodash');
const path = require('path');

const {
	getBaseThemeGlob,
	getLiferayThemeJSON,
} = require('../../theme_inspector');
const themeUtil = require('../../util');

const moduleNamesMap = {
	classic: 'liferay-frontend-theme-classic-web',
	mixins: 'liferay-frontend-common-css',
	styled: 'liferay-frontend-theme-styled',
	unstyled: 'liferay-frontend-theme-unstyled',
};

const getDependencyName = name => moduleNamesMap[name];

function getBaseThemeDependencies(baseThemePath) {
	const {baseTheme} = getLiferayThemeJSON(baseThemePath);
	const baseThemeGlob = getBaseThemeGlob(baseThemePath);

	let dependencies = [
		path.join(
			themeUtil.resolveDependency(getDependencyName('unstyled')),
			baseThemeGlob
		),
	];

	if (_.isObject(baseTheme)) {
		baseThemePath = path.join(
			baseThemePath,
			'node_modules',
			baseTheme.name
		);

		dependencies.push(path.resolve(baseThemePath, 'src/**/*'));

		return getBaseThemeDependencies(baseThemePath, dependencies);
	} else if (baseTheme === 'styled' || baseTheme === 'classic') {
		dependencies.splice(
			1,
			0,
			path.join(
				themeUtil.resolveDependency(getDependencyName('styled')),
				baseThemeGlob
			)
		);

		if (baseTheme === 'classic') {
			dependencies.splice(
				2,
				0,
				path.join(
					themeUtil.resolveDependency(getDependencyName('classic')),
					baseThemeGlob
				)
			);
		}

		return dependencies;
	}

	return dependencies;
}

module.exports = {getDependencyName, getBaseThemeDependencies};
