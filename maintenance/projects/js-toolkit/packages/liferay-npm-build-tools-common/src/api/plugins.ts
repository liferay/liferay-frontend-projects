/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Manifest from '../manifest';
import PkgDesc from '../pkg-desc';
import PluginLogger from '../plugin-logger';

/**
 * The IPC object passed to all babel plugins through the `babelIpc` mechanism
 * (see `liferay-npm-build-tools-common/lib/babel-ipc` module).
 */
export interface BabelIpcObject {
	log: PluginLogger;
	manifest: Manifest;
	rootPkgJson: object;
	globalConfig: object;
}

/**
 * A bundler plugin entry point.
 *
 * @remarks
 * Note that the signature for every type of plugin is the same, but the second
 * argument `state` is different for each plugin type.
 *
 * @see BundlerCopyPluginState
 * @see BundlerTransformPluginState
 */
export interface BundlerPluginEntryPoint<T> {
	(params: BundlerPluginParams, state: T): void;
}

/**
 * Parameters passed as first argument to bundler plugins.
 */
export interface BundlerPluginParams {
	/** Config for plugin */
	config: object;

	/** Global configuration (`config` section of `.npmbundlerrc`) */
	globalConfig: object;

	/** A logger object to write messages to the report file */
	log: PluginLogger;

	/** Destination package descriptor */
	pkg: PkgDesc;

	/** Contents of project's package.json file */
	rootPkgJson: object;

	source: {
		/** Source package descriptor */
		pkg: PkgDesc;
	};
}

/** State parameter type for copy plugins */
export interface BundlerCopyPluginState {
	/** File paths (relative to package directory) */
	files: string[];
}

/** State parameter type for transformation plugins */
export interface BundlerTransformPluginState {
	/** The contents of the package.json file for the transformed package */
	pkgJson: object;
}
