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
