/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgDesc from '../pkg-desc';
import PluginLogger from '../plugin-logger';

/**
 * Parameters passed as first argument to bundler plugins.
 */
interface BundlerPluginParams {
	config: object;
	globalConfig: object;
	log: PluginLogger;
	pkg: PkgDesc;
	rootPkgJson: object;
	source: {
		pkg: PkgDesc;
	};
}

/**
 * An abstract plugin entry point.
 *
 * @remarks
 * Note that the signature for every type of plugin is the same, but the second
 * argument `state` is different for each plugin type.
 */
interface BundlerPluginEntryPoint {
	(params: BundlerPluginParams, state: object): void;
}

/**
 * An abstract plugin description.
 *
 * @remarks
 * Note that `run` field has a different signature for each plugin type (see
 * {@link BundlerPluginEntryPoint}).
 *
 * @see BundlerPluginEntryPoint
 */
interface BundlerPluginDescriptor {
	name: string;
	config: object;
	run: BundlerPluginEntryPoint;
}
