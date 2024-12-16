/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project} from '@liferay/js-toolkit-core';

import abort from './util/abort';
import startWebpackDevServer from './util/startWebpackDevServer';
import {ensureProjectIsStartable} from './util/startableProjectTypes';

export default async function start(): Promise<void> {
	const project = new Project('.');

	ensureProjectIsStartable(project);

	try {
		await startWebpackDevServer(project);
	}
	catch (error) {
		abort(`Start failed!\n${error.stack}`);
	}
}
