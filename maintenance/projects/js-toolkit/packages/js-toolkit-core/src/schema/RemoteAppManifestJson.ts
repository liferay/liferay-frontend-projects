/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/** Structure of `manifest.json` files for Remote Apps */
export default interface RemoteAppManifestJson {
	cssURLs: string[];
	htmlElementName: string;
	portletCategoryName?: string;
	type: 'customElement';
	urls: string[];
	useESM: boolean;
}
