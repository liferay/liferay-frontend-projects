/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson from '../../../schema/PkgJson';

/**
 * Set the main entry of the package.json file
 *
 * @param main
 */
export default function setPkgJsonMain(main: string): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		pkgJson['main'] = main;

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
