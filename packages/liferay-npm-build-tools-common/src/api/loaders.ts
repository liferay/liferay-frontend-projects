/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PluginLogger from '../plugin-logger';

/**
 * A bundler loader plugin entry point
 */
export interface BundlerLoaderEntryPoint {
	(
		/** Context of execution */
		context: BundlerLoaderContext,

		/** Configured options for the loader */
		options: object
	): BundlerLoaderReturn;
}

/**
 * A bundler loader execution context
 */
export interface BundlerLoaderContext {
	/** Content of main transformed object */
	content: string;

	/** Path to main transformed object (relative to project dir) */
	filePath: string;

	/**
	 * Hash of extra objects to write (keys are paths relative to output
	 * dir and values are the content of the file)
	 */
	extraArtifacts: object;

	/** A standard plugin logger to write things to the report */
	log: PluginLogger;
}

/**
 * Bundler loader return type: a string with processed content or `undefined` if
 * content was not transformed.
 */
export type BundlerLoaderReturn = string | undefined;
