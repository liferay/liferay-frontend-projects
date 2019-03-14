/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');
const path = require('path');

const {getBaseThemeGlob, getLiferayThemeJSON} = require('../theme_inspector');
const themeUtil = require('../util');

function getBaseDependencies(version) {
	return function get(baseThemePath = process.cwd(), dependencies = []) {
		const {baseTheme} = getLiferayThemeJSON(baseThemePath);
		const baseThemeGlob = getBaseThemeGlob(baseThemePath);

		dependencies = _.uniq(
			dependencies.concat([
				path.join(
					themeUtil.resolveDependency(
						'liferay-frontend-theme-unstyled'
					),
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

			return get(baseThemePath, dependencies);
		} else if (
			baseTheme === 'styled' ||
			baseTheme === 'classic' ||
			baseTheme === 'admin'
		) {
			dependencies.splice(
				1,
				0,
				path.join(
					themeUtil.resolveDependency(
						'liferay-frontend-theme-styled'
					),
					baseThemeGlob
				)
			);

			if (baseTheme === 'classic') {
				dependencies.splice(
					2,
					0,
					path.join(
						themeUtil.resolveDependency(
							'liferay-frontend-theme-classic-web'
						),
						baseThemeGlob
					)
				);
			}

			if (baseTheme === 'admin' && version !== '7.0') {
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
	};
}

module.exports = {getBaseDependencies};
