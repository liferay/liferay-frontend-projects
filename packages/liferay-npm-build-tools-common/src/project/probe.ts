import {Project} from '.';

/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

export enum ProjectType {
	CREATE_REACT_APP = 'create-react-app',
	ANGULAR_CLI = 'angular-cli',
	VUE_CLI = 'vue-cli',
}

/**
 * Reflects project type (React, Angular, ...)
 */
export default class Probe {
	constructor(project) {
		this._project = project;
	}

	/**
	 * Return true if project is of type create-react-app
	 * @return the project type or undefined if nothing detected
	 */
	get type(): ProjectType | undefined {
		if (this._hasDependency('react-scripts')) {
			return ProjectType.CREATE_REACT_APP;
		}

		if (this._hasDependency('@angular/cli')) {
			return ProjectType.ANGULAR_CLI;
		}

		if (this._hasDependency('@vue/cli-service')) {
			return ProjectType.VUE_CLI;
		}

		return undefined;
	}

	_hasDependency(pkgName) {
		const {pkgJson} = this._project;

		return (
			(pkgJson['dependencies'] && pkgJson['dependencies'][pkgName]) ||
			(pkgJson['devDependencies'] && pkgJson['devDependencies'][pkgName])
		);
	}

	private readonly _project: Project;
}
