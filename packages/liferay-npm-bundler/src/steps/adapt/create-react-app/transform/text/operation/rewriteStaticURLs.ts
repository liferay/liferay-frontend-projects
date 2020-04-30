/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import escapeStringRegexp from 'escape-string-regexp';

import {TextTransform} from '../../../../../../util/transform/text';

/**
 * Map of source to destination assets URLs to be processed
 */
export interface AssetURLsMap {
	[source: string]: string;
}

/**
 * Rewrite static asset URLs inside a file (usually a webpack generated bundle).
 *
 * @param text the content to be rewritten
 * @param assetURLsMap map of source to destination assets URLs to be processed
 * @param prefix prefix to add to destination URLs (usually the web context)
 */
export default function rewriteStaticURLs(
	assetURLsMap: AssetURLsMap,
	prefix = ''
): TextTransform {
	return (text =>
		_rewriteStaticURLs(text, assetURLsMap, prefix)) as TextTransform;
}

function _rewriteStaticURLs(
	text: string,
	assetURLsMap: AssetURLsMap,
	prefix = ''
): Promise<string> {
	Object.entries(assetURLsMap).forEach(([srcAssetURL, destAssetURL]) => {
		const regexp = new RegExp(escapeStringRegexp(srcAssetURL), 'g');

		const matches = regexp.exec(text);

		if (!matches) {
			return;
		}

		text = text.replace(regexp, `${prefix}${destAssetURL}`);
	});

	return Promise.resolve(text);
}
