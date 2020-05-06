/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';
import {
	SourceTransform,
	replace,
} from 'liferay-npm-build-tools-common/lib/transform/js';
import {parseAsExpressionStatement} from 'liferay-npm-build-tools-common/lib/transform/js/parse';

import {findFiles} from '../../../../../util/files';

export default function adaptStaticURLsAtRuntime(
	...assetsGlobs: string[]
): SourceTransform {
	return (async source => {
		const adaptBuildDir = project.dir.join(project.adapt.buildDir);

		const assetURLs = new Set(
			findFiles(adaptBuildDir, assetsGlobs).map(file => file.asPosix)
		);

		return await replace(source, {
			enter(node, parent) {
				if (
					node.type !== 'Literal' ||
					typeof node.value !== 'string' ||
					!assetURLs.has(node.value)
				) {
					return;
				}

				// Don't process replacement nodes again
				if (
					parent.type === 'CallExpression' &&
					parent.callee.type === 'MemberExpression' &&
					parent.callee.object.type === 'Identifier' &&
					parent.callee.object.name === '_ADAPT_RT_' &&
					parent.callee.property.type === 'Identifier' &&
					parent.callee.property.name === 'adaptStaticURL'
				) {
					return;
				}

				return parseAsExpressionStatement(`
					_ADAPT_RT_.adaptStaticURL("${node.value}")
				`);
			},
		});
	}) as SourceTransform;
}
