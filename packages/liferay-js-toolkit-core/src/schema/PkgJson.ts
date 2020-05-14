/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/** Minimal package.json structure description */
export default interface PkgJson {
	name: string;
	version: string;
	description?: string;
	main?: string;
	portlet?: {
		[property: string]: string | boolean;
	};
	dependencies?: {
		[pkgName: string]: string;
	};
	devDependencies?: {
		[pkgName: string]: string;
	};
	peerDependencies?: {
		[pkgName: string]: string;
	};
}
