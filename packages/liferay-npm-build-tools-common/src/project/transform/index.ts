/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgDesc from '../../pkg-desc';
import {Project} from '..';
import * as util from '../util';
import {BundlerTransformPluginDescriptor} from './types';

/**
 * Defines configuration for the transform step.
 */
export default class Transform {
	constructor(project: Project) {
		this._project = project;
	}

	getPostPluginDescriptors(pkg: PkgDesc): BundlerTransformPluginDescriptor[] {
		const {_project} = this;

		const pkgConfig = util.getPackageConfig(
			_project,
			pkg,
			'post-plugins',
			[]
		) as [];

		return util.createBundlerPluginDescriptors(_project, pkgConfig);
	}

	getPrePluginDescriptors(pkg: PkgDesc): BundlerTransformPluginDescriptor[] {
		const {_project} = this;

		const pkgConfig = util.getPackageConfig(
			_project,
			pkg,
			'plugins',
			[]
		) as [];

		return util.createBundlerPluginDescriptors(_project, pkgConfig);
	}

	_project: Project;
}
