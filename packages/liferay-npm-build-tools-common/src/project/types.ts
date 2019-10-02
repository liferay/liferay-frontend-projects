/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {BundlerPluginEntryPoint} from '../api/plugins';

/**
 * An bundler plugin description.
 *
 * @remarks
 * Note that `run` field has a different signature for each plugin type (see
 * {@link BundlerPluginEntryPoint}).
 *
 * @see BundlerPluginEntryPoint
 */
export interface BundlerPluginDescriptor<T> {
	name: string;
	config: object;
	run: BundlerPluginEntryPoint<T>;
}

/** Plugin version information */
export interface VersionInfo {
	version: string;
	path: string;
}
