/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const _ = require('lodash');

class ThemeConfig {
	constructor(project) {
		this._project = project;
	}

	get config() {
		return this._project.pkgJson.liferayTheme;
	}

	removeConfig(keys) {
		const {_project} = this;

		_project.modifyPkgJson(pkgJson => ({
			...pkgJson,
			liferayTheme: _.omit(pkgJson.liferayTheme, keys),
		}));
	}

	setConfig(config) {
		const {_project} = this;

		_project.modifyPkgJson(pkgJson => {
			if (pkgJson.liferayTheme) {
				if (config.baseTheme) {
					pkgJson.liferayTheme.baseTheme = undefined;
				}

				if (config.themeletDependencies) {
					pkgJson.liferayTheme.themeletDependencies = undefined;
				}
			}

			pkgJson = _.merge(pkgJson, {
				liferayTheme: config,
			});

			return pkgJson;
		});
	}
}

module.exports = ThemeConfig;
