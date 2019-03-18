/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');
const path = require('path');

const {getBaseThemeGlob, getLiferayThemeJSON} = require('./theme_inspector');
const themeUtil = require('./util');

function getBaseThemeDependencies(
	baseThemePath = process.cwd(),
	dependencies = []
) {
	const {baseTheme} = getLiferayThemeJSON(baseThemePath);
	const baseThemeGlob = getBaseThemeGlob(baseThemePath);

	dependencies = _.uniq(
		dependencies.concat([
			path.join(
				themeUtil.resolveDependency('liferay-frontend-theme-unstyled'),
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
	} else if (baseTheme === 'styled' || baseTheme === 'admin') {
		dependencies.splice(
			1,
			0,
			path.join(
				themeUtil.resolveDependency('liferay-frontend-theme-styled'),
				baseThemeGlob
			)
		);

		if (baseTheme === 'admin') {
			dependencies.splice(
				2,
				0,
				path.join(
					themeUtil.resolveDependency(
						'liferay-frontend-theme-admin-web'
					),
					baseThemeGlob
				)
			);
		}

		return dependencies;
	}

	return dependencies;
}

module.exports = getBaseThemeDependencies;
