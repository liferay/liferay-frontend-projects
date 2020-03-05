/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import ejs from 'ejs';
import fs from 'fs-extra';
import path from 'path';

import {buildBundlerDir} from '../../../dirs';

/**
 * Helper function to transform a file inside `buildBundlerDir`.
 *
 * @remarks
 * If the file does not exist it is considered to be empty.
 *
 * @param transform callback function to translate file content
 */
export async function transformFile(
	fileName: string,
	transform: {(content: string): Promise<string> | string}
): Promise<void> {
	const file = buildBundlerDir.join(fileName);

	fs.writeFileSync(
		file.asNative,
		await transform(fs.readFileSync(file.asNative).toString())
	);
}

/**
 * Render a template.
 *
 * @param templateName
 * @param data
 */
export async function render(
	templateName: string,
	data: object
): Promise<string> {
	return new Promise((resolve, reject) => {
		ejs.renderFile(
			path.join(__dirname, 'template', `${templateName}.ejs`),
			data,
			{
				escape: text => text,
			},
			(err, str: string): void => {
				if (err) {
					reject(err);
				} else {
					resolve(str);
				}
			}
		);
	});
}
