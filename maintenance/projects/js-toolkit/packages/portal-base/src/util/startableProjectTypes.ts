/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project, format} from '@liferay/js-toolkit-core';

const {fail, print} = format;

const STARTABLE_PROJECT_TYPES = ['customElement'];

export default STARTABLE_PROJECT_TYPES;

export function ensureProjectIsStartable(project: Project): void {
	if (!STARTABLE_PROJECT_TYPES.includes(project.build.type)) {
		print(fail`Projects of type ${project.build.type} cannot be started`);

		process.exit(1);
	}
}
