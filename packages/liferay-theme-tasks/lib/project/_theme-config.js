/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

// const fs = require('fs-extra');
const _ = require('lodash');

class ThemeConfig {
	constructor(project) {
		this._project = project;
	}

	get config() {
		return this._project.pkgJson.liferayTheme;
	}

	removeConfig(keys) {
		const {_project} = this._project;

		_project.modifyPkgJson(pkgJson => _.omit(pkgJson.liferayTheme, keys));
	}

	removeDependencies(dependencies) {
		const {_project} = this._project;

		_project.modifyPkgJson(pkgJson => {
			this._deleteDependencies(pkgJson.dependencies, dependencies);
			this._deleteDependencies(pkgJson.devDependencies, dependencies);

			return pkgJson;
		});
	}

	set config(config) {
		const {_project} = this._project;

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

	setDependencies(dependencies, devDependencies) {
		const {_project} = this._project;

		_project.modifyPkgJson(pkgJson => {
			const selector = devDependencies
				? 'devDependencies'
				: 'dependencies';

			if (!pkgJson[selector]) {
				pkgJson[selector] = {};
			}

			_.merge(pkgJson[selector], dependencies);

			return pkgJson;
		});
	}

	_deleteDependencies(sourceDependencies, deletedDependencies) {
		_.forEach(sourceDependencies, (item, index) => {
			if (deletedDependencies.indexOf(index) > -1) {
				delete sourceDependencies[index];
			}
		});
	}
}

module.exports = ThemeConfig;
