/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import ejs from 'ejs';
import fs from 'fs-extra';

import FilePath from '../file/FilePath';

/**
 * Template renderer class
 */
export default class Renderer {
	constructor(templatesDir: FilePath, outputDir?: FilePath) {
		this._templatesDir = templatesDir;
		this._outputDir = outputDir;
	}

	/**
	 * @param templateRelPosixPath the template path (relative to templates dir) in POSIX format
	 * @param data the contextual data to render the template
	 * @return the contents of the rendered template
	 */
	render(templateRelPosixPath: string, data: object = {}): Promise<string> {
		const templateRelPath = new FilePath(templateRelPosixPath, {
			posix: true,
		});

		if (!templateRelPath.isRelative()) {
			throw new Error(
				`Template path must be relative: ${templateRelPath}`
			);
		}

		return new Promise((resolve, reject) => {
			ejs.renderFile(
				this._templatesDir.join(templateRelPath) + '.ejs',
				data,
				{
					escape: (text) => text,
				},
				(err, str) => {
					if (err) {
						return reject(err);
					}

					if (this._outputDir) {
						const outputFile = this._outputDir.join(
							templateRelPath
						);

						fs.ensureDirSync(outputFile.dirname().asNative);

						fs.writeFileSync(outputFile.asNative, str);
					}

					resolve(str);
				}
			);
		});
	}

	private readonly _templatesDir: FilePath;
	private readonly _outputDir: FilePath | undefined;
}
