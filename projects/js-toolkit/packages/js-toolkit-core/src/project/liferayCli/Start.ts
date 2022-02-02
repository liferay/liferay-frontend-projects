/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Project from './Project';

export default class Start {
	readonly port: number;

	constructor(project: Project) {
		const {liferayJson} = project;

		this.port = liferayJson.start?.port || 8081;
	}
}
