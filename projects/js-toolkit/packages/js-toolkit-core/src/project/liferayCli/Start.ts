/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import LiferayJson from '../../schema/LiferayJson';
import Project from './Project';
import persist from './persist';

import type {Writable} from './Writable';

export default class Start {
	readonly port: number;

	constructor(project: Project, liferayJson: LiferayJson) {
		this._project = project;

		this.port = liferayJson.start?.port || 8081;
	}

	storePort(port: number): void {
		(this as Writable<Start>).port = port;

		persist(this._project, 'start', 'port');
	}

	private _project: Project;
}
