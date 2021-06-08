/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson, {PkgJsonDependencies} from '../../../schema/PkgJson';

/**
 * Add a list of dependencies to a package.json file
 *
 * @param type
 * @param dependencies
 */
export default function addPkgJsonDependencies(
	dependencies: PkgJsonDependencies,
	type: 'dev' | 'peer' | '' = ''
): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		const key = {
			'': 'dependencies',
			dev: 'devDependencies',
			peer: 'peerDependencies',
		}[type];

		pkgJson[key] = {
			...pkgJson[key],
			...dependencies,
		};

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
