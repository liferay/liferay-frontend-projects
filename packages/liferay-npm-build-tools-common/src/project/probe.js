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

		this.TYPE_CREATE_REACT_APP = 'create-react-app';
		this.TYPE_ANGULAR_CLI = 'angular-cli';
	}

	/**
	 * Return true if project is of type create-react-app
	 * @return {string|undefined} the project type or undefined if nothing
	 * 			detected
	 */
	get type() {
		if (this._hasDependency('react-scripts')) {
			return this.TYPE_CREATE_REACT_APP;
		}

		if (this._hasDependency('@angular/cli')) {
			return this.TYPE_ANGULAR_CLI;
		}

		return undefined;
	}

	_hasDependency(pkgName) {
		const {pkgJson} = this._project;

		return (
			(pkgJson.dependencies && pkgJson.dependencies[pkgName]) ||
			(pkgJson.devDependencies && pkgJson.devDependencies[pkgName])
		);
	}
}
