/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import {PkgJson} from '../../../project';

export default function addPortletHeader(
	header: string,
	value: string | boolean
): JsonTransform<PkgJson> {
	return (pkgJson =>
		_addPortletHeader(pkgJson, header, value)) as JsonTransform<PkgJson>;
}

async function _addPortletHeader(
	pkgJson: PkgJson,
	header: string,
	value: string | boolean
): Promise<PkgJson> {
	pkgJson['portlet'] = pkgJson['portlet'] || {};
	pkgJson['portlet'][header] = value;

	return pkgJson;
}
