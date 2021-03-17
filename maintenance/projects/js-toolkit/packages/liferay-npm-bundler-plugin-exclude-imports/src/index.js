/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {unrollImportsConfig} from 'liferay-npm-build-tools-common/lib/imports';

/**
 * @return {void}
 */
export default function (
	{config, globalConfig, log, pkg, rootPkgJson},
	{files}
) {
	let imports = config.imports || globalConfig.imports || {};

	imports = unrollImportsConfig(imports);

	// Exclude third party deps when imported, but not if coming from us

	if (imports[pkg.name] && imports[pkg.name].name !== rootPkgJson.name) {
		files.length = 0;

		log.info(
			'exclude-imports',
			'Excluding package',
			pkg.id,
			'from output as it is configured as an import.'
		);
	}
}
