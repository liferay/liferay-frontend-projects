/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Tell the bundler we want the file as a raw Buffer so that we can copy
 * binaries too.
 */
export const metadata = {
	encoding: null,
};

/**
 * @param {object} context loader's context
 */
export default function (context) {
	const {log} = context;

	// No need to do anything as the bundler will write the file in the build
	// directory.

	log.info('copy-loader', 'Copied file to build directory');
}
