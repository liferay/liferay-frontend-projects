/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgDesc from '../../pkg-desc';
import PluginLogger from '../../plugin-logger';
import {
	BundlerPluginDescriptor,
	BundlerPluginEntryPoint,
	BundlerPluginParams,
} from '../types';

interface BundlerCopyPluginState {
	/**
	 * File pats relative to package
	 */
	files: string[];
}

interface BundlerCopyPluginEntryPoint extends BundlerPluginEntryPoint {
	(params: BundlerPluginParams, state: BundlerCopyPluginState): void;
}

interface BundlerCopyPluginDescriptor extends BundlerPluginDescriptor {
	run: BundlerCopyPluginEntryPoint;
}
