/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson from '../../../schema/PkgJson';

/**
 * Delete packages from all dependencies sections of a package.json file
 *
 * @param packageNames
 */
export default function deletePkgJsonDependencies(
	...packageNames: string[]
): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		['dependencies', 'devDependencies', 'peerDependencies'].forEach(
			(section) => {
				if (pkgJson[section]) {
					packageNames.forEach(
						(packageName) => delete pkgJson[section][packageName]
					);

					if (!Object.keys(pkgJson[section]).length) {
						delete pkgJson[section];
					}
				}
			}
		);

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
