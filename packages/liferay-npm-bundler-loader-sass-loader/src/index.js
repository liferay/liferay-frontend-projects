/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import resolveModule from 'resolve';

/**
 * @param {object} context loader's context
 * @param {object} options loader's options
 * @return {string} the processed file content
 */
export default function(context, options) {
	const {content} = context;

	const renderer = getRenderer();

	const result = renderer.renderSync(
		Object.assign(
			{
				data: content,
			},
			options
		)
	);

	return result.css.toString();
}

/**
 * Get configured SASS renderer.
 * @return {*}
 */
function getRenderer() {
	let rendererFilePath = tryResolve('node-sass', '.');

	if (rendererFilePath === undefined) {
		rendererFilePath = tryResolve('sass', '.');
	}

	if (rendererFilePath === undefined) {
		rendererFilePath = tryResolve('sass');
	}

	return require(rendererFilePath);
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
	} catch (err) {
		return undefined;
	}
}
