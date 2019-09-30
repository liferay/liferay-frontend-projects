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

interface BundlerCopyPluginState {
	/**
	 * File paths relative to package
	 */
	files: string[];
}

interface BundlerCopyPluginEntryPoint extends BundlerPluginEntryPoint {
	(params: BundlerPluginParams, state: BundlerCopyPluginState): void;
}

interface BundlerCopyPluginDescriptor extends BundlerPluginDescriptor {
	run: BundlerCopyPluginEntryPoint;
}
