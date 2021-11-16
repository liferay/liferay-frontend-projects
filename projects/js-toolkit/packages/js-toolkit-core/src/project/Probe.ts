/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Project from './Project';

export enum ProjectType {
	ANGULAR_CLI = 'angular-cli',
	BUNDLER = 'liferay-npm-bundler',
	CREATE_REACT_APP = 'create-react-app',
	LIFERAY_FRAGMENT = 'liferay-fragment',
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

		if (this._hasScriptCalling('yo liferay-fragments:')) {
			return ProjectType.LIFERAY_FRAGMENT;
		}

		// This must go last, as all other types have (or may have)
		// @liferay/npm-bundler as dependency.

		if (
			this._hasDependency('@liferay/npm-bundler') ||
			this._hasScriptCalling('js-toolkit') ||
			this._hasScriptCalling('liferay-npm-bundler')
		) {
			return ProjectType.BUNDLER;
		}

		return undefined;
	}

	_hasDependency(pkgName): boolean {
		const {pkgJson} = this._project;

		return (
			(pkgJson.dependencies &&
				pkgJson.dependencies[pkgName] !== undefined) ||
			(pkgJson.devDependencies &&
				pkgJson.devDependencies[pkgName] !== undefined)
		);
	}

	_hasScriptCalling(tool: string): boolean {
		const {pkgJson} = this._project;

		const {scripts} = pkgJson;

		if (!scripts) {
			return false;
		}

		return Object.values(scripts).some((script) =>
			new RegExp(`^\\s*${tool}\\b`).test(script)
		);
	}

	private readonly _project: Project;
}
