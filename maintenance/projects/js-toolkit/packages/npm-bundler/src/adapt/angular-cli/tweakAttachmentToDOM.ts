/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	JsSourceTransform,
	parseAsAstExpressionStatement,
	replaceJsSource,
} from '@liferay/js-toolkit-core';

/**
 * Changes `'app-root'` to `'#'+_LIFERAY_PARAMS_.portletElementId` so that
 * Angular attaches to the portlet's DIV node.
 *
 * @param domId DOM node id (f.e.: 'app-root')
 */
export default function tweakAttachmentToDOM(domId: string): JsSourceTransform {
	return (async (source) =>
		await replaceJsSource(source, {
			enter(node) {
				if (node.type !== 'Literal' || node.value !== domId) {
					return;
				}

				const {expression} = parseAsAstExpressionStatement(
					`'#' + _LIFERAY_PARAMS_.portletElementId`
				);

				return expression;
			},
		})) as JsSourceTransform;
}
