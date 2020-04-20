/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {renderTemplates} from '..';

import * as log from '../../../log';
import {runPkgJsonScript} from '../../../util/run';

/**
 * Run configured rules.
 */
export default async function adaptCreateReactApp(): Promise<void> {
	log.info(`Running React's build...`);

	runPkgJsonScript('build');

	renderTemplates();
}
