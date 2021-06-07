/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';
import cpr from 'cpr';
import fs from 'fs-extra';

import {project} from '../config';

const {error, print, success} = format;

/**
 *
 */
export default function (): Promise<void> {
	return new Promise((resolve) => {
		const {outputDir} = project;

		fs.mkdirpSync(outputDir.asNative);

		cpr(
			project.sourceDir.asNative,
			outputDir.asNative,
			{confirm: true, overwrite: true},
			(error) => {
				if (error) {
					print(error`${error}`);
					process.exit(1);
				}
				else {
					print(success`JavaScript files copied`);
				}

				resolve();
			}
		);
	});
}
