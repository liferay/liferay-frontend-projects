/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Get the portlet name.
 *
 * @param pkgJsonName
 */
export default function getPortletName(pkgJsonName: string): string {
	let portletName = pkgJsonName;

	portletName = portletName.replace(/-/g, '');
	portletName = portletName.replace(/[^A-Za-z0-9]/g, '_');

	return portletName;
}
