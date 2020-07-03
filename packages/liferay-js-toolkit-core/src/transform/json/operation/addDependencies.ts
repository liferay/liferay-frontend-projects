/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson from '../../../schema/PkgJson';

/**
 * Add a list of dependencies to a package.json file
 *
 * @param dependencies
 */
export default function addDependencies(
	dependencies: object
): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		pkgJson.dependencies = pkgJson.dependencies || {};

		pkgJson.dependencies = {
			...pkgJson.dependencies,
			...dependencies,
		};

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
