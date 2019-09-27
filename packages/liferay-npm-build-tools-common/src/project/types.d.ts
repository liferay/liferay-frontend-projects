/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgDesc from '../pkg-desc';
import PluginLogger from '../plugin-logger';

/**
 * A normalized bundler rule (as opposed to its looser structure when found in
 * `.npmbundlerrc`).
 */
interface BundlerNormalizedRule {
	test: RegExp[];
	include: RegExp[];
	exclude: RegExp[];
	use: BundlerLoaderDescriptor[];
}

/**
 * A bundler loader plugin entry point
 */
interface BundlerLoaderEntryPoint {
	(
		context: {
			/** Content of main transformed object */
			content: string;

			/** Path to main transformed object (relative to project dir) */
			filePath: string;

			/**
			 * List of extra objects to write (each item of the array is an
			 * object where the key is the path relative to output dir and the
			 * value is the content of that file)
			 */
			extraArtifacts: object[];

			/** A standard plugin logger to write things to the report */
			log: PluginLogger;
		},

		/** Configured options for the loader */
		options: object
	): string | undefined;
}

/**
 * A bundler loader plugin descriptor
 */
interface BundlerLoaderDescriptor {
	loader: string;
	resolvedModule: string;
	exec: BundlerLoaderEntryPoint;
	options: object;
}

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

/**
 * Plugin version information.
 */
interface VersionInfo {
	version: string;
	path: string;
}
