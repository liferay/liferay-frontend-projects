'use strict';

const _ = require('lodash');
const path = require('path');

const {
	getBaseThemeGlob,
	getLiferayThemeJSON,
} = require('../../theme_inspector');
const themeUtil = require('../../util');

const moduleNamesMap = {
	admin: 'liferay-frontend-theme-admin-web',
	classic: 'liferay-frontend-theme-classic-web',
	mixins: 'liferay-frontend-common-css',
	styled: 'liferay-frontend-theme-styled',
	unstyled: 'liferay-frontend-theme-unstyled',
};

const getDependencyName = name => moduleNamesMap[name];

function getBaseThemeDependencies(baseThemePath, dependencies = []) {
	const {baseTheme} = getLiferayThemeJSON(baseThemePath);
	const baseThemeGlob = getBaseThemeGlob(baseThemePath);

	dependencies = _.uniq(
		dependencies.concat([
			path.join(
				themeUtil.resolveDependency(getDependencyName('unstyled')),
				baseThemeGlob
			),
		])
	);

	if (_.isObject(baseTheme)) {
		baseThemePath = path.join(
			baseThemePath,
			'node_modules',
			baseTheme.name
		);

		dependencies.push(path.resolve(baseThemePath, 'src/**/*'));

		return getBaseThemeDependencies(baseThemePath, dependencies);
	} else if (
		baseTheme === 'styled' ||
		baseTheme === 'classic' ||
		baseTheme === 'admin'
	) {
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

		if (baseTheme === 'admin') {
			dependencies.splice(
				2,
				0,
				path.join(
					themeUtil.resolveDependency(getDependencyName('admin')),
					baseThemeGlob
				)
			);
		}

		return dependencies;
	}

	return dependencies;
}

module.exports = {getDependencyName, getBaseThemeDependencies};
