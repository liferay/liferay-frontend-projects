/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import estree from 'estree';
import {
	SourceCode,
	SourceTransform,
	replace,
} from 'liferay-npm-build-tools-common/lib/transform/js';
import {parseAs} from 'liferay-npm-build-tools-common/lib/transform/js/parse';

export default function tweakAttachmentToDOM(): SourceTransform {
	return (source => _tweakAttachmentToDOM(source)) as SourceTransform;
}

/**
 * Changes `document.getElementById('root')` to
 * `document.getElementById(_LIFERAY_PARAMS_.portletElementId)` so that React
 * attaches to the portlet's DIV node.
 *
 * @param source
 */
async function _tweakAttachmentToDOM(source: SourceCode): Promise<SourceCode> {
	return await replace(source, {
		enter(node) {
			if (node.type !== 'CallExpression') {
				return;
			}

			const {arguments: args, callee} = node;

			if (callee.type !== 'MemberExpression') {
				return;
			}

			const {object, property} = callee;

			if (object.type !== 'Identifier' || object.name !== 'document') {
				return;
			}

			if (
				property.type !== 'Identifier' ||
				property.name !== 'getElementById'
			) {
				return;
			}

			if (args.length !== 1) {
				return;
			}

			if (args[0].type !== 'Literal' || args[0].value !== 'root') {
				return;
			}

			const {expression} = parseAs<estree.ExpressionStatement>(
				'_LIFERAY_PARAMS_.portletElementId'
			);

			args[0] = expression;
		},
	});
}
