/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';
import resolveModule from 'resolve';

/**
 * @param {object} context loader's context
 * @param {object} options loader's options
 * @return {string} the processed file content
 */
export default function (context, options) {
	const {content, log} = context;

	const {renderer, rendererDescription} = getRenderer();

	log.info('sass-loader', `Processed file with ${rendererDescription}`);

	changeFilePathExtension(context);

	return renderCSS(renderer, content, options);
}

/**
 * Get configured SASS renderer.
 * @return {*}
 */
function getRenderer() {
	let rendererFilePath = tryResolve('node-sass', '.');
	let rendererPkgJsonPath = tryResolve('node-sass/package.json', '.');
	let rendererSource = 'from project';

	if (rendererFilePath === undefined) {
		rendererFilePath = tryResolve('sass', '.');
		rendererPkgJsonPath = tryResolve('sass/package.json', '.');
		rendererSource = 'from project';
	}

	if (rendererFilePath === undefined) {
		rendererFilePath = tryResolve('sass');
		rendererPkgJsonPath = tryResolve('sass/package.json');
		rendererSource = 'from loader';
	}

	const pkgJson = JSON.parse(fs.readFileSync(rendererPkgJsonPath));

	let rendererDescription = `${pkgJson.name} v${pkgJson.version}`;

	rendererDescription += ` (${rendererSource})`;

	return {
		renderer: require(rendererFilePath),
		rendererDescription,
	};
}

/**
 * Change `filePath` extension to `.css` so that Portal may serve the resulting
 * CSS content.
 * @param {object} context
 */
function changeFilePathExtension(context) {
	let {filePath} = context;

	const extname = path.extname(filePath);

	if (extname === '') {
		filePath = `${filePath}.css`;
	}
	else {
		filePath = filePath.replace(new RegExp(`\\${extname}$`), '.css');
	}

	context.filePath = filePath;
}

function renderCSS(renderer, content, options) {
	const result = renderer.renderSync({
		data: content,
		...options,
	});

	return result.css.toString();
}

/**
 * Resolve a module name into its file path.
 * @param {string} moduleName module name
 * @param {string} basedir optional base directory
 */
function tryResolve(moduleName, basedir) {
	try {
		return resolveModule.sync(moduleName, {
			basedir,
		});
	}
	catch (err) {
		return undefined;
	}
}
