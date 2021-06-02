/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson from '../../../schema/PkgJson';

interface Properties {
	[name: string]: boolean | string;
}

/**
 * Add one or more npm scripts to a package.json file
 *
 * @param properties
 */
export default function addPortletProperties(
	properties: Properties
): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		pkgJson.portlet = {
			...pkgJson.portlet,
			...properties,
		};

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
