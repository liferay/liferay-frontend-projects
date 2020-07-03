/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import PkgJson from '../../../schema/PkgJson';

export default function setPkgJsonPortletHeader(
	header: string,
	value: string | boolean | undefined
): JsonTransform<PkgJson> {
	return (async (pkgJson) => {
		if (value === undefined) {
			if (pkgJson['portlet']) {
				delete pkgJson['portlet'][header];
			}
		} else {
			pkgJson['portlet'] = pkgJson['portlet'] || {};
			pkgJson['portlet'][header] = value;
		}

		return pkgJson;
	}) as JsonTransform<PkgJson>;
}
