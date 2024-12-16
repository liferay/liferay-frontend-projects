/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson from '../../../schema/PkgJson';

/**
 * Delete one or more npm scripts from a package.json file
 *
 * @param scripts
 */
export default function deletePkgJsonScripts(
	...scripts: string[]
): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		if (pkgJson.scripts === undefined) {
			return pkgJson;
		}

		scripts.forEach((script) => delete pkgJson.scripts[script]);

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
