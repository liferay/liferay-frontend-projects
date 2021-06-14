/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {transformJsSource} from '@liferay/js-toolkit-core';

import {project} from '../../globals';
import report from '../../report';
import transformImports from '../../transform/js/operation/transformImports';

/**
 * Webpack loader to substitute require calls for imported modules. This loader
 * simply converts any `require()` or `import` for bundler imports into a
 * `__REQUIRE__()` call.
 *
 * The `__REQUIRE__()` call is then serviced by our AMD loader.
 *
 * @param content module's source code
 */
export default function (content: string): void {

	//
	// Note that this is a webpack loader and its structure is constrained by
	// Webpack's API (https://webpack.js.org/api/loaders/#asynchronous-loaders)
	//
	// The real process is done in the `asyncTransform()` method below.
	//

	const callback = this.async();

	// Execute async transformation from webpack async loader

	asyncTransform(content, this.resourcePath)
		.then((transformedContent) => callback(null, transformedContent))
		.catch((error) => callback(error));
}

async function asyncTransform(
	content: string,
	resourcePath: string
): Promise<string> {
	const prjDirRelResourceFile = project.dir.relative(resourcePath);

	const log = report.getWebpackLogger(
		'imports-loader',
		prjDirRelResourceFile.asNative
	);

	// Early fail for performance: look for require/import

	if (content.indexOf('require') === -1 && content.indexOf('import') === -1) {
		log.debug(`File does not contain 'require' or 'import' statements`);

		return content;
	}

	const {imports} = project;

	// Early fail for performance: look for imported modules as strings

	let importsFound = false;

	for (const pkgName of Object.keys(imports)) {
		if (content.indexOf(pkgName) != -1) {
			importsFound = true;

			break;
		}
	}

	if (!importsFound) {
		log.debug(`File does not contain any 'imports' module`);

		return content;
	}

	// Parse source code to transform imports

	try {
		const {code} = await transformJsSource(
			{
				code: content,
			},
			transformImports(log, imports)
		);

		content = code;
	}
	catch (error) {
		log.error(`File could not be parsed`, error);
	}

	return content;
}
