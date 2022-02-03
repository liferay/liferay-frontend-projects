/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import LiferayJson from '../../schema/LiferayJson';
import Project from './Project';

export default class Start {
	readonly port: number;

	constructor(_project: Project, liferayJson: LiferayJson) {
		this.port = liferayJson.start?.port || 8081;
	}
}
