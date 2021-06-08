/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson, {PkgJsonScripts} from '../../../schema/PkgJson';

/**
 * Add one or more npm scripts to a package.json file
 *
 * @param scripts
 */
export default function addPkgJsonScripts(
	scripts: PkgJsonScripts
): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		pkgJson.scripts = {
			...pkgJson.scripts,
			...scripts,
		};

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
