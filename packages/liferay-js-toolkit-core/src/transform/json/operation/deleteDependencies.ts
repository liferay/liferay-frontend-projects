/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson from '../../../schema/PkgJson';

/**
 * Delete packages from the dependencies section of a package.json file
 *
 * @param packageNames
 */
export default function deleteDependencies(
	...packageNames: string[]
): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		if (!pkgJson.dependencies) {
			return pkgJson;
		}

		packageNames.forEach(
			(packageName) => delete pkgJson.dependencies[packageName]
		);

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
