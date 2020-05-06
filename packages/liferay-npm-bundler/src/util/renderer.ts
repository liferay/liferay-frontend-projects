/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import ejs from 'ejs';
import fs from 'fs-extra';
import FilePath from 'liferay-js-toolkit-core/lib/file-path';
import path from 'path';

export interface RenderOptions {
	dir?: FilePath;
	name?: string;
}

/**
 * Template renderer class
 */
export default class Renderer {
	constructor(templatesPath: string, outputPath?: FilePath | undefined) {
		this._templatesPath = templatesPath;
		this._outputPath = outputPath;
	}

	/**
	 *
	 * @param templatePath the template path
	 * @param data the contextual data to render the template
	 * @param dir optional relative directory in output path
	 * @param name optional output file name
	 * @return the contents of the rendered template
	 */
	render(
		templatePath: string,
		data: object = {},
		{dir = undefined, name = undefined}: RenderOptions = {}
	): Promise<string> {
		return new Promise((resolve, reject) => {
			ejs.renderFile(
				path.join(this._templatesPath, `${templatePath}.ejs`),
				data,
				{
					escape: text => text,
				},
				(err, str) => {
					if (err) {
						return reject(err);
					}

					if (this._outputPath) {
						name = name || templatePath;

						const outputPath = dir
							? this._outputPath.join(dir)
							: this._outputPath;

						fs.ensureDirSync(outputPath.dirname().asNative);

						fs.writeFileSync(outputPath.asNative, str);
					}

					resolve(str);
				}
			);
		});
	}

	private readonly _templatesPath: string;
	private readonly _outputPath: FilePath | undefined;
}
