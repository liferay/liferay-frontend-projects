/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from '../file/FilePath';
import {ProjectType} from './Probe';
import Project from './Project';

/**
 * Reflects adapted project configuration
 */
export class Adapt {
	constructor(project: Project) {
		this._project = project;
	}

	get supported(): boolean {
		this._lazyInit();

		return this._supported;
	}

	/**
	 * Project relative path of the build directory used by the underlying
	 * project framework.
	 */
	get buildDir(): FilePath {
		this._lazyInit();

		return this._buildDir;
	}

	_lazyInit(): void {
		const {probe} = this._project;

		switch (probe.type) {
			case ProjectType.ANGULAR_CLI:
				this._buildDir = new FilePath('dist');
				this._supported = true;
				break;

			case ProjectType.CREATE_REACT_APP:
				this._buildDir = new FilePath('build');
				this._supported = true;
				break;

			case ProjectType.VUE_CLI:
				this._buildDir = new FilePath('dist');
				this._supported = true;
				break;

			default:
				this._supported = false;
		}
	}

	private _buildDir: FilePath;
	private readonly _project: Project;
	private _supported: boolean;
}

export default Adapt;
