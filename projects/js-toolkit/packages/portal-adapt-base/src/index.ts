/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import portalBase from '@liferay/portal-base';

import build from './build';

import type {Tasks} from '@liferay/portal-base';

export default function (platformPath: string, taskOverrides: Tasks): void {
	portalBase(platformPath, {
		build,
		...(taskOverrides || {}),
	});
}
