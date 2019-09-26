/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	BundlerPluginDescriptor,
	BundlerPluginEntryPoint,
	BundlerPluginParams,
} from '../types';

interface BundlerTransformPluginState {
	/**
	 * The contents of the package.json file for the transformed package.
	 */
	pkgJson: object;
}

interface BundlerTransformPluginEntryPoint extends BundlerPluginEntryPoint {
	(params: BundlerPluginParams, state: BundlerTransformPluginState): void;
}

interface BundlerTransformPluginDescriptor extends BundlerPluginDescriptor {
	run: BundlerTransformPluginEntryPoint;
}

interface BabelPlugin {
	();
}
