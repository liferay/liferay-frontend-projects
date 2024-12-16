/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {JsSourceTransform, replaceJsSource} from '@liferay/js-toolkit-core';
import {parseAsExpressionStatement} from '@liferay/js-toolkit-core/lib/transform/js/parse';

const {expression: webpackManifestExpression} = parseAsExpressionStatement(
	'__WEBPACK_MANIFEST__'
);

/**
 * Replace occurrences of `window["webpackJsonp"]` by `__WEBPACK_MANIFEST__` so
 * that webpack bundles use the internalized manifest object.
 */
export default function replaceWebpackJsonp(): JsSourceTransform {
	return ((source) =>
		replaceJsSource(source, {
			enter(node) {
				if (
					node.type === 'MemberExpression' &&
					node.object.type === 'Identifier' &&
					node.object.name === 'window' &&
					node.property.type === 'Literal' &&
					node.property.value === 'webpackJsonp'
				) {
					return webpackManifestExpression;
				}
			},
		})) as JsSourceTransform;
}
