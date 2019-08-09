/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Reflects project type (React, Angular, ...)
 */
export default class Probe {
	/**
	 *
	 * @param {Project} project
	 */
	constructor(project) {
		this._project = project;
		this._pkgJson = project._pkgJson;

		this.TYPE_CREATE_REACT_APP = 'create-react-app';
	}

	/**
	 * Return true if project is of type create-react-app
	 * @return {string|undefined} the project type or undefined if nothing
	 * 			detected
	 */
	get type() {
		const pkgJson = this._pkgJson;

		if (
			pkgJson.dependencies &&
			(pkgJson.dependencies['react-scripts'] ||
				pkgJson.devDependencies['react-scripts'])
		) {
			return this.TYPE_CREATE_REACT_APP;
		}

		return undefined;
	}
}
