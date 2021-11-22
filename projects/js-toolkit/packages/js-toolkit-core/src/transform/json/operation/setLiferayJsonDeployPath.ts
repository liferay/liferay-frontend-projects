/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsonTransform} from '..';

import LiferayJson from '../../../schema/LiferayJson';

/**
 * Add deploy.path to .liferay.json
 */
export default function setLiferayJsonDeployPath(
	deployPath: string
): JsonTransform<LiferayJson> {
	return (async (liferayJson) => {
		liferayJson.deploy = liferayJson.deploy || {};
		liferayJson.deploy.path = deployPath;

		return liferayJson;
	}) as JsonTransform<LiferayJson>;
}
