/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson, {PkgJsonPortletProperties} from '../../../schema/PkgJson';

/**
 * Add one or more npm scripts to a package.json file
 *
 * @param properties
 */
export default function addPkgJsonPortletProperties(
	properties: PkgJsonPortletProperties
): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		pkgJson.portlet = {
			...pkgJson.portlet,
			...properties,
		};

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
