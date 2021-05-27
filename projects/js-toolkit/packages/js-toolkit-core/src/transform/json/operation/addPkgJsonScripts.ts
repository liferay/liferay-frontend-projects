/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson from '../../../schema/PkgJson';

interface Scripts {
	[name: string]: string;
}

/**
 * Add one or more npm scripts to a package.json file
 *
 * @param scripts
 */
export default function addPkgJsonScripts(
	scripts: Scripts
): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		pkgJson.scripts = {
			...pkgJson.scripts,
			...scripts,
		};

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
