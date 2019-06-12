/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import ejs from 'ejs';
import fs from 'fs';
import path from 'path';

/**
 * Template renderer class
 */
export class Renderer {
	constructor(templatesDir, outputDir) {
		this._templatesDir = templatesDir;
		this._outputDir = outputDir;
	}

	/**
	 *
	 * @param {string} template the template path
	 * @param {Object} data the contextual data to render the template
	 */
	render(template, data = {}) {
		const outputPath = path.join(this._outputDir, template);

		fs.mkdirSync(path.dirname(outputPath), {recursive: true});

		ejs.renderFile(
			path.join(this._templatesDir, `${template}.ejs`),
			data,
			{
				escape: text => text,
			},
			(err, str) => {
				fs.writeFileSync(outputPath, str);
			}
		);
	}
}
