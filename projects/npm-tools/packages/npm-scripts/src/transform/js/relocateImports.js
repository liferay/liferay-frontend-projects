/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {replaceJsSource} = require('@liferay/js-toolkit-core');
const path = require('path');

const NODE_TYPES = new Set([
	'ExportAllDeclaration',
	'ExportDefaultDeclaration',
	'ExportNamedDeclaration',
	'ImportDeclaration',
]);

/**
 * Create a JS transformer to relocate paths to imported modules after a
 * directory move.
 *
 * So, for example, if `index.js` was in `src` and contained:
 *
 * ```javascript
 * import doSomething from './util/doSomething';
 * ```
 *
 * And we move `index.js` to `src/other/path`, the tranformed file would be:
 *
 * ```javascript
 * import doSomething from '../../util/doSomething';
 * ```
 *
 * @param {string} previousDirRelPath
 * The path to the old directory from the new one (or the replacement to use for
 * `.`).
 *
 * In the example above, it would contain `../../util`.
 *
 * @return {function} a JS tranformer function
 */
module.exports = function (previousDirRelPath) {
	const dotReplacement =
		path.sep === '/'
			? previousDirRelPath
			: previousDirRelPath.replace(/\\/g, '/');

	return (source) =>
		replaceJsSource(source, {
			enter(node) {
				const {source} = node;

				if (
					NODE_TYPES.has(node.type) &&
					source.value.startsWith('./')
				) {
					source.value = source.value.replace(/^\./, dotReplacement);
				}
			},
		});
};
