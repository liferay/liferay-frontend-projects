/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/** Default entry point for the @liferay/cli executable. */
export default async function (argv: {version: boolean}): Promise<void> {
	if (argv.version) {
		const pkgJson = require('../package.json');

		// eslint-disable-next-line no-console
		console.log(pkgJson.version);

		return;
	}
}
